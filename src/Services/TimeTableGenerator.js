import mongoose from "mongoose";
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
 * =========================
 * STEP 1: EMPTY STRUCTURE
 * =========================
 */
const generateEmptyTimetable = async ({
    instituteId,
    departmentName,
    semester,
    totalDivisions,
    totalDays,
    totalSlotsPerDay
}) => {
    if (!instituteId || !departmentName) {
        throw new Error("InstituteId and DepartmentName required");
    }

    const instituteObjectId = new mongoose.Types.ObjectId(instituteId);

    const subjectQuery = {
        instituteId: instituteObjectId,
        departmentName: departmentName.trim()
    };

    if (semester !== undefined && semester !== null && semester !== "") {
        subjectQuery.semester = Number(semester);
    }

    // console.log("Subject Query:", subjectQuery);

    const subjects = await Subject.find(subjectQuery).lean();
    // console.log("Subjects Found:", subjects.length);

    const teacherQuery = {
        instituteId: instituteObjectId,
        teacherDepartment: departmentName.trim()
    };

    // console.log("TEACHER QUERY:", teacherQuery);

    const teachers = await Teacher.find(teacherQuery).lean();
    // console.log("TEACHERS FOUND:", teachers.length);

    let rooms = await Room.find({
        instituteId: instituteObjectId,
        departmentName: departmentName.trim(),
        roomStatus: "Available"
    }).lean();

    if (!rooms.length) {
        rooms = await Room.find({
            instituteId: instituteObjectId,
            roomStatus: "Available"
        }).lean();
    }

    console.log("ROOMS FOUND:", rooms.length);

    if (!subjects.length) throw new Error("No subjects found");
    if (!teachers.length) throw new Error("No teachers found");
    if (!rooms.length) throw new Error("No rooms found");

    const divisions = [];

    for (let i = 0; i < totalDivisions; i++) {
        const schedule = [];

        for (let d = 0; d < totalDays; d++) {
            schedule.push({
                day: DAYS[d] ?? `Day ${d + 1}`,
                slots: Array.from({ length: totalSlotsPerDay }, () => ({
    subjectName: "Free",
    subjectCode: "-",
    subjectType: "Free",
    teacherName: "-",
    roomNumber: "-",
    free: true
}))
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
 * =========================
 * STEP 2: BUILD LECTURE QUEUE
 * =========================
 */
export const buildLectureQueue = (subjects, lectureDuration, labDuration) => {

    const queue = [];
    const safeLectureDuration = Number(lectureDuration) || 1;
    const safeLabDuration = Number(labDuration) || 2;

    const labSlotsNeeded = Math.max(1, Math.ceil(safeLabDuration / safeLectureDuration));

    for (const subject of subjects) {

        const type = (subject.subjectType || "Lecture").trim();

        const teacherIds = Array.isArray(subject.teachers)
            ? subject.teachers.map(t => String(t))
            : [];

        const lectureCount = Number(subject.weekly_Lecture_Hour || 5);
        const labHours = Number(subject.weekly_Lab_Hour || 0);

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
            const labCount = Math.ceil(labHours / labSlotsNeeded);

            for (let i = 0; i < labCount; i++) {
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

    // console.log("Lecture Queue Size:", queue.length);

    return queue;
};

/**
 * =========================
 * STEP 3: ALLOCATION ENGINE
 * =========================
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

    const teacherMap = new Map(
    teachers.map(t => [String(t._id), t])
);
    for (const division of divisions) {

        const shuffledQueue = [...lectureQueue];
        for (const lecture of shuffledQueue) {

            let placed = false;

                const selectedTeacher =
    lecture.teacherIds
        .map(id => teacherMap.get(String(id)))
        .find(Boolean)
    || teachers[0];

            const teacherKey = String(selectedTeacher._id);
const roomPool = rooms.filter(r =>
    String(r.roomType || "").toLowerCase() ===
    String(lecture.preferredRoomType || "").toLowerCase()
);

const finalRooms = roomPool.length > 0 ? roomPool : rooms;
            for (let d = 0; d < division.schedule.length && !placed; d++) {

                const day = division.schedule[d];

                for (let slot = 0; slot <= totalSlotsPerDay - lecture.duration && !placed; slot++) {

const isFree = Array.from(
    { length: lecture.duration },
    (_, k) => day.slots[slot + k]
).every(v => v.subjectType  === "Free");
                    if (!isFree) continue;

                    for (const room of finalRooms) {

                        const roomFree = Array.from(
                            { length: lecture.duration },
                            (_, k) => {
                                const key = `${room._id}_${d}_${slot + k}`;
                                return !roomBusy[key];
                            }
                        ).every(Boolean);

                        if (!roomFree) continue;

                        for (let k = 0; k < lecture.duration; k++) {

                            const tKey = `${teacherKey}_${d}_${slot + k}`;
                            const rKey = `${room._id}_${d}_${slot + k}`;

                            teacherBusy[tKey] = true;
                            roomBusy[rKey] = true;

                            day.slots[slot + k] = {
    subjectName: lecture.subjectName,
    subjectCode: lecture.subjectCode,
    subjectType: lecture.subjectType,
    teacherName: selectedTeacher.teacherName,
    roomNumber: room.roomName,
    free: false
};
                        }

                        placed = true;
                        break;
                    }
                }
            }

            if (!placed) {
                console.warn("Could not place:", lecture.subjectName);
            }
        }
    }
return divisions.map(d => ({
    division: d.divisionName,
    schedule: d.schedule
}));};

export default generateEmptyTimetable;