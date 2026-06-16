import Subject from "../Models/SubjectModel.js";
import Teacher from "../Models/TeacherModel.js";
import Room from "../Models/RoomModel.js";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const generateEmptyTimetable = async ({ instituteId, departmentName, semester, totalDivisions, totalDays, totalSlotsPerDay }) => {
    const subjects = await Subject.find({
        instituteId,
        departmentName,
        semester
    });
    console.log("Subjects found:", subjects.length);

    const teachers = await Teacher.find({
        instituteId,
        teacherDepartment: departmentName
    });
    console.log("Teachers found:", teachers.length);

    const rooms = await Room.find({
        instituteId,
        departmentName,
        roomStatus: "Available"
    });
    console.log("Rooms found:", rooms.length);

    // Build empty division grids
    const divisions = [];
    for (let i = 0; i < totalDivisions; i++) {
        const schedule = [];
        for (let d = 0; d < totalDays; d++) {
            schedule.push({
                day: DAYS[d],
                slots: Array(totalSlotsPerDay).fill(null)
            });
        }
        divisions.push({
            divisionName: `Division ${String.fromCharCode(65 + i)}`,
            schedule
        });
    }

    return { subjects, teachers, rooms, divisions };
};

/**
 * Build a lecture queue from subjects.
 * - For "Lecture" type: creates weekly_Lecture_Hour entries, each duration = 1 slot
 * - For "Lab" type: creates weekly_Lab_Hour entries, each duration = labSlotsNeeded contiguous slots
 * - For "Lecture + Lab": creates both lecture entries AND lab entries
 * 
 * @param {Array} subjects - Subject documents from DB
 * @param {number} lectureDuration - Duration of one lecture slot in minutes
 * @param {number} labDuration - Duration of one lab session in minutes
 * @returns {Array} lectureQueue - Array of lecture objects to be scheduled
 */
export const buildLectureQueue = (subjects, lectureDuration, labDuration) => {
    const lectureQueue = [];

    // How many contiguous slots does one lab session occupy?
    const labSlotsNeeded = Math.max(1, Math.ceil(labDuration / lectureDuration));

    for (const subject of subjects) {
        const subjectType = (subject.subjectType || "Lecture").trim();

        // --- Add LECTURE entries ---
        if (subjectType === "Lecture" || subjectType === "Lecture + Lab") {
            const lectureCount = subject.weekly_Lecture_Hour || 0;
            for (let i = 0; i < lectureCount; i++) {
                lectureQueue.push({
                    subjectId: subject._id,
                    subjectName: subject.subjectName,
                    subjectCode: subject.subjectCode,
                    subjectType: "Lecture",
                    teacherNames: subject.teacherName || [],
                    preferredRoomType: "Lecture",
                    duration: 1  // 1 slot
                });
            }
        }

        // --- Add LAB entries ---
        if (subjectType === "Lab" || subjectType === "Lecture + Lab") {
            const labCount = subject.weekly_Lab_Hour || 0;
            for (let i = 0; i < labCount; i++) {
                lectureQueue.push({
                    subjectId: subject._id,
                    subjectName: subject.subjectName,
                    subjectCode: subject.subjectCode,
                    subjectType: "Lab",
                    teacherNames: subject.teacherName || [],
                    preferredRoomType: "Lab",
                    duration: labSlotsNeeded  // contiguous slots
                });
            }
        }
    }

    console.log("Lecture Queue Length:", lectureQueue.length, `(Lab sessions need ${labSlotsNeeded} contiguous slots each)`);
    return lectureQueue;
};

/**
 * Allocate subjects into division timetables.
 * 
 * KEY DESIGN:
 *  - Each division gets its OWN copy of the full lecture queue (all subjects).
 *  - Teacher and room conflicts are tracked GLOBALLY across divisions
 *    (a teacher can't be in two divisions at the same day+slot).
 *  - Lab entries occupy contiguous slots on the same day.
 *  - Any slot that can't be assigned gets marked { free: true }.
 *  - Algorithm NEVER throws — it gracefully marks unplaceable slots as free.
 *
 * @param {Array} lectureQueue - Base lecture queue (will be cloned per division)
 * @param {Array} divisions - Division grid objects with empty schedules
 * @param {Array} teachers - Teacher documents from DB
 * @param {Array} rooms - Room documents from DB
 * @param {number} totalSlotsPerDay - Number of slots per day
 * @returns {Array} divisions - Populated division timetables
 */
export const allocateSubjects = (lectureQueue, divisions, teachers, rooms, totalSlotsPerDay) => {

    // Global conflict trackers (across ALL divisions)
    // Key format: "teacherId_dayIndex_slotIndex" or "roomId_dayIndex_slotIndex"
    const teacherBusy = {};
    const roomBusy = {};

    // Process each division independently — each division gets all subjects
    for (let divIdx = 0; divIdx < divisions.length; divIdx++) {
        const division = divisions[divIdx];
        console.log(`\n--- Scheduling ${division.divisionName} ---`);

        // Shuffle the lecture queue for variety between divisions
        const divisionQueue = shuffleArray([...lectureQueue]);

        for (const lecture of divisionQueue) {
            let placed = false;

            // Find ALL matching teachers (not just the first)
            const matchingTeachers = teachers.filter(t =>
                lecture.teacherNames.includes(t.teacherName)
            );

            // Find ALL matching rooms of the preferred type
            const matchingRooms = rooms.filter(r =>
                r.roomType === lecture.preferredRoomType
            );

            if (matchingTeachers.length === 0 || matchingRooms.length === 0) {
                console.warn(`  ⚠ No teacher/room for "${lecture.subjectName}" (need ${lecture.preferredRoomType} room). Skipping.`);
                continue;
            }

            // Try each day, then each starting slot position
            for (let dayIndex = 0; dayIndex < division.schedule.length && !placed; dayIndex++) {
                const day = division.schedule[dayIndex];

                for (let startSlot = 0; startSlot <= totalSlotsPerDay - lecture.duration && !placed; startSlot++) {

                    // Check if ALL needed contiguous slots are empty
                    let slotsAvailable = true;
                    for (let s = 0; s < lecture.duration; s++) {
                        if (day.slots[startSlot + s] !== null) {
                            slotsAvailable = false;
                            break;
                        }
                    }
                    if (!slotsAvailable) continue;

                    // Try each teacher + room combination
                    for (const teacher of matchingTeachers) {
                        if (placed) break;

                        // Check teacher is free for ALL contiguous slots
                        let teacherFree = true;
                        for (let s = 0; s < lecture.duration; s++) {
                            const tKey = `${teacher.teacherId}_${dayIndex}_${startSlot + s}`;
                            if (teacherBusy[tKey]) {
                                teacherFree = false;
                                break;
                            }
                        }
                        if (!teacherFree) continue;

                        for (const room of matchingRooms) {
                            if (placed) break;

                            // Check room is free for ALL contiguous slots
                            let roomFree = true;
                            for (let s = 0; s < lecture.duration; s++) {
                                const rKey = `${room.roomId}_${dayIndex}_${startSlot + s}`;
                                if (roomBusy[rKey]) {
                                    roomFree = false;
                                    break;
                                }
                            }
                            if (!roomFree) continue;

                            // SUCCESS — place the lecture in all contiguous slots
                            for (let s = 0; s < lecture.duration; s++) {
                                day.slots[startSlot + s] = {
                                    subjectName: lecture.subjectName,
                                    subjectCode: lecture.subjectCode,
                                    subjectType: lecture.subjectType,
                                    teacherName: teacher.teacherName,
                                    roomNumber: room.roomName
                                };

                                // Mark teacher and room as busy globally
                                const tKey = `${teacher.teacherId}_${dayIndex}_${startSlot + s}`;
                                const rKey = `${room.roomId}_${dayIndex}_${startSlot + s}`;
                                teacherBusy[tKey] = true;
                                roomBusy[rKey] = true;
                            }

                            console.log(`  ✓ ${lecture.subjectName} (${lecture.subjectType}) → ${day.day} Slot ${startSlot + 1}${lecture.duration > 1 ? `-${startSlot + lecture.duration}` : ''} [${teacher.teacherName}, ${room.roomName}]`);
                            placed = true;
                        }
                    }
                }
            }

            if (!placed) {
                console.warn(`  ✗ Could not place: ${lecture.subjectName} (${lecture.subjectType}) in ${division.divisionName}`);
            }
        }
    }

    // Fill any remaining null slots with { free: true }
    for (const division of divisions) {
        for (const day of division.schedule) {
            for (let i = 0; i < day.slots.length; i++) {
                if (day.slots[i] === null) {
                    day.slots[i] = {
                        subjectName: "Free",
                        subjectCode: "-",
                        subjectType: "Free",
                        teacherName: "-",
                        roomNumber: "-",
                        free: true
                    };
                }
            }
        }
    }

    return divisions;
};

/**
 * Fisher-Yates shuffle to randomize lecture placement order.
 * This prevents all divisions from having identical schedules.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export default generateEmptyTimetable;