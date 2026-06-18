import Subject from "../Models/SubjectModel.js";
import Teacher from "../Models/TeacherModel.js";
import Room from "../Models/RoomModel.js";

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

/**
 * STEP 1: EMPTY STRUCTURE
 */
const generateEmptyTimetable = async ({
    instituteId,
    departmentName,
    semester,
    totalDivisions,
    totalDays,
    totalSlotsPerDay
}) => {

    const subjects = await Subject.find({
        instituteId,
        departmentName,
        semester
    });

    const teachers = await Teacher.find({
        instituteId,
        teacherDepartment: departmentName
    });

    let rooms = await Room.find({
        instituteId,
        departmentName,
        roomStatus: "Available"
    });

    if (!rooms.length) {
        rooms = await Room.find({ roomStatus: "Available" });
    }

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
 * STEP 2: BUILD LECTURE QUEUE
 */
export const buildLectureQueue = (subjects, lectureDuration, labDuration) => {

    const queue = [];
    const labSlotsNeeded = Math.max(1, Math.ceil(labDuration / lectureDuration));
    const toNumber = (value) => Number(value) || 0;

    for (const subject of subjects) {

        const type = (subject.subjectType || "Lecture").trim();

        // IMPORTANT: subject.teacherName = [teacherIds]
        const teacherIds = (subject.teacherName || [])
            .map(id => id?.toString().trim())
            .filter(Boolean);

        const lectureCount = toNumber(subject.weekly_Lecture_Hour);
        const rawLabHours = toNumber(subject.weekly_Lab_Hour);

        if (type === "Lecture" || type === "Lecture + Lab") {

            for (let i = 0; i < lectureCount; i++) {
                queue.push({
                    subjectId: subject._id,
                    subjectName: subject.subjectName,
                    subjectCode: subject.subjectCode,
                    subjectType: "Lecture",
                    teacherIds,
                    preferredRoomType: "Lecture",
                    duration: 1
                });
            }
        }

        if (type === "Lab" || type === "Lecture + Lab") {

            const count = Math.ceil(rawLabHours / labSlotsNeeded);

            for (let i = 0; i < count; i++) {
                queue.push({
                    subjectId: subject._id,
                    subjectName: subject.subjectName,
                    subjectCode: subject.subjectCode,
                    subjectType: "Lab",
                    teacherIds,
                    preferredRoomType: "Lab",
                    duration: labSlotsNeeded
                });
            }
        }
    }

    console.log("Lecture Queue Size:", queue.length);
    return queue;
};

/**
 * STEP 3: ALLOCATION ENGINE (FIXED)
 */
export const allocateSubjects = (
    lectureQueue,
    divisions,
    teachers,
    rooms,
    totalSlotsPerDay
) => {

    const teacherBusy = {};
    const roomBusy = {};

    // ✅ MAP USING teacherId (IMPORTANT FIX)
    const teacherMap = new Map(
        teachers.map(t => [
            (t.teacherId || "").toString().trim(),
            t
        ])
    );

    console.log("Available Teachers:", teachers.map(t => t.teacherId));

    const getTeacherId = (t) =>
        (t.teacherId || "").toString().trim();

    for (let divIdx = 0; divIdx < divisions.length; divIdx++) {

        const division = divisions[divIdx];

        const shuffledQueue = shuffleArray([...lectureQueue]);

        for (const lecture of shuffledQueue) {

            let placed = false;

            console.log("\nLecture:", lecture.subjectName);
            console.log("Lecture teacherIds:", lecture.teacherIds);

            const lectureTeacherIds = (lecture.teacherIds || [])
                .map(id => id?.toString().trim())
                .filter(Boolean);

            // -------------------------
            // TEACHER SELECTION (FIXED)
            // -------------------------
            let selectedTeacher = null;

            for (const id of lectureTeacherIds) {
                if (teacherMap.has(id)) {
                    selectedTeacher = teacherMap.get(id);
                    break;
                }
            }

            // fallback chain (safe)
            if (!selectedTeacher) {
                selectedTeacher =
                    teachers.find(t => t.teacherAvailability === "Available") ||
                    teachers[0];
            }

            if (!selectedTeacher) {
                console.warn("❌ No teacher available at all");
                continue;
            }

            // -------------------------
            // ROOM SELECTION
            // -------------------------
            const preferredRooms = rooms.filter(
                r => r.roomType === lecture.preferredRoomType
            );

            const roomPool = preferredRooms.length ? preferredRooms : rooms;

            // -------------------------
            // SCHEDULING
            // -------------------------
            for (let dayIndex = 0;
                dayIndex < division.schedule.length && !placed;
                dayIndex++
            ) {

                const day = division.schedule[dayIndex];

                for (let slot = 0;
                    slot <= totalSlotsPerDay - lecture.duration && !placed;
                    slot++
                ) {

                    // check slot free
                    let free = true;

                    for (let k = 0; k < lecture.duration; k++) {
                        if (day.slots[slot + k] !== null) {
                            free = false;
                            break;
                        }
                    }

                    if (!free) continue;

                    for (const room of roomPool) {

                        let roomFree = true;

                        for (let k = 0; k < lecture.duration; k++) {
                            const rKey = `${room._id}_${dayIndex}_${slot + k}`;
                            if (roomBusy[rKey]) {
                                roomFree = false;
                                break;
                            }
                        }

                        if (!roomFree) continue;

                        // -------------------------
                        // PLACE LECTURE
                        // -------------------------
                        for (let k = 0; k < lecture.duration; k++) {

                            const tKey = `${getTeacherId(selectedTeacher)}_${dayIndex}_${slot + k}`;
                            const rKey = `${room._id}_${dayIndex}_${slot + k}`;

                            teacherBusy[tKey] = true;
                            roomBusy[rKey] = true;

                            day.slots[slot + k] = {
                                subject: lecture.subjectName,
                                subjectCode: lecture.subjectCode,
                                type: lecture.subjectType,

                                // ✅ ALWAYS FILLED
                                teacher: selectedTeacher.teacherName,
                                room: room.roomName
                            };
                        }

                        console.log(
                            `✓ ${lecture.subjectName} → ${day.day} Slot ${slot + 1}`
                        );

                        placed = true;
                        break;
                    }
                }
            }

            if (!placed) {
                console.warn(`✗ Could not place: ${lecture.subjectName}`);
            }
        }
    }

    // -------------------------
    // FILL FREE SLOTS
    // -------------------------
    for (const division of divisions) {
        for (const day of division.schedule) {
            for (let i = 0; i < day.slots.length; i++) {
                if (!day.slots[i]) {
                    day.slots[i] = {
                        subject: "Free",
                        subjectCode: "-",
                        type: "Free",
                        teacher: "-",
                        room: "-"
                    };
                }
            }
        }
    }

    return divisions;
};

/**
 * SHUFFLE
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export default generateEmptyTimetable;
