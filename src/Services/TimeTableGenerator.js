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

    let teachers = await Teacher.find({
    instituteId: instituteObjectId,
    teacherAvailability: "Available",
    $or: [
        { teacherDepartments: departmentName.trim() },
        { teacherDepartment: departmentName.trim() }
    ]
}).lean();

// Fallback for old teacher records where availability
// may not have been stored as "Available"
if (!teachers.length) {
    teachers = await Teacher.find({
        instituteId: instituteObjectId,
        $or: [
            { teacherDepartments: departmentName.trim() },
            { teacherDepartment: departmentName.trim() }
        ]
    }).lean();
}

console.log(
    "TEACHERS FOUND:",
    teachers.length,
    teachers.map(t => ({
        id: t._id,
        name: t.teacherName,
        departments: t.teacherDepartments,
        department: t.teacherDepartment
    }))
);

    // console.log("TEACHER QUERY:", teacherQuery);

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
            ? subject.teachers.map(t => String(t?._id || t))
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

    // Track how many classes each teacher has been assigned
    const teacherLoad = {};

    // Create teacher lookup
    const teacherMap = new Map(
        teachers.map(teacher => [
            String(teacher._id),
            teacher
        ])
    );

    // Initialize teacher load
    teachers.forEach(teacher => {
        teacherLoad[String(teacher._id)] = 0;
    });

    /**
     * Check whether a teacher is free
     */
    const isTeacherFree = (
        teacher,
        dayIndex,
        slotIndex,
        duration
    ) => {

        const teacherId = String(teacher._id);

        return Array.from(
            { length: duration },
            (_, k) => {

                const key =
                    `${teacherId}_${dayIndex}_${slotIndex + k}`;

                return !teacherBusy[key];

            }
        ).every(Boolean);
    };


    /**
     * Check whether a room is free
     */
    const isRoomFree = (
        room,
        dayIndex,
        slotIndex,
        duration
    ) => {

        return Array.from(
            { length: duration },
            (_, k) => {

                const key =
                    `${room._id}_${dayIndex}_${slotIndex + k}`;

                return !roomBusy[key];

            }
        ).every(Boolean);
    };


    /**
     * Mark teacher busy
     */
    const markTeacherBusy = (
        teacher,
        dayIndex,
        slotIndex,
        duration
    ) => {

        const teacherId = String(teacher._id);

        for (let k = 0; k < duration; k++) {

            const key =
                `${teacherId}_${dayIndex}_${slotIndex + k}`;

            teacherBusy[key] = true;
        }

        teacherLoad[teacherId] += duration;
    };


    /**
     * Mark room busy
     */
    const markRoomBusy = (
        room,
        dayIndex,
        slotIndex,
        duration
    ) => {

        for (let k = 0; k < duration; k++) {

            const key =
                `${room._id}_${dayIndex}_${slotIndex + k}`;

            roomBusy[key] = true;
        }
    };


    /**
     * =========================
     * PROCESS EACH DIVISION
     * =========================
     */

    for (const division of divisions) {

        /*
         * Shuffle so that subjects don't always
         * get allocated in exactly the same order.
         */
        const shuffledQueue = [...lectureQueue];

        shuffledQueue.sort(
            () => Math.random() - 0.5
        );


        for (const lecture of shuffledQueue) {

            let placed = false;


            /**
             * =========================
             * FIND SUBJECT TEACHERS
             * =========================
             */

            // Use all available department teachers
// and distribute workload as evenly as possible.

let possibleTeachers = [...teachers];

possibleTeachers.sort(
    (a, b) =>
        teacherLoad[String(a._id)] -
        teacherLoad[String(b._id)]
);

            /**
             * IMPORTANT:
             *
             * Sort teachers by current workload.
             *
             * Teacher with fewer assigned classes
             * gets priority.
             *
             * This prevents one teacher from getting
             * almost the entire timetable.
             */
            possibleTeachers.sort(
                (a, b) =>
                    teacherLoad[String(a._id)] -
                    teacherLoad[String(b._id)]
            );


            /**
             * =========================
             * FIND ROOMS
             * =========================
             */

            const roomPool = rooms.filter(room =>

                String(room.roomType || "")
                    .toLowerCase() ===

                String(lecture.preferredRoomType || "")
                    .toLowerCase()

            );


            const finalRooms =
                roomPool.length > 0
                    ? roomPool
                    : rooms;


            /**
             * =========================
             * SEARCH DAYS
             * =========================
             */

            for (
                let d = 0;
                d < division.schedule.length && !placed;
                d++
            ) {

                const day =
                    division.schedule[d];


                /**
                 * =========================
                 * SEARCH SLOTS
                 * =========================
                 */

                for (
                    let slot = 0;
                    slot <=
                    totalSlotsPerDay - lecture.duration &&
                    !placed;
                    slot++
                ) {


                    /**
                     * =========================
                     * CHECK DIVISION FREE
                     * =========================
                     */

                    const divisionFree =
                        Array.from(
                            {
                                length:
                                    lecture.duration
                            },
                            (_, k) =>
                                day.slots[
                                    slot + k
                                ]
                        ).every(
                            cell =>
                                cell.subjectType ===
                                "Free"
                        );


                    if (!divisionFree) {
                        continue;
                    }


                    /**
                     * =========================
                     * FIND FREE TEACHER
                     * =========================
                     */

                    /*
                     * Re-sort before every allocation.
                     *
                     * This is important because teacher
                     * workload changes after every class.
                     */
                    possibleTeachers.sort(
                        (a, b) =>
                            teacherLoad[
                                String(a._id)
                            ] -
                            teacherLoad[
                                String(b._id)
                            ]
                    );


                    const availableTeacher =
                        possibleTeachers.find(
                            teacher =>
                                isTeacherFree(
                                    teacher,
                                    d,
                                    slot,
                                    lecture.duration
                                )
                        );


                    if (!availableTeacher) {

                        continue;

                    }


                    /**
                     * =========================
                     * FIND FREE ROOM
                     * =========================
                     */

                    const availableRoom =
                        finalRooms.find(
                            room =>
                                isRoomFree(
                                    room,
                                    d,
                                    slot,
                                    lecture.duration
                                )
                        );


                    if (!availableRoom) {

                        continue;

                    }


                    /**
                     * =========================
                     * ALLOCATE
                     * =========================
                     */

                    markTeacherBusy(
                        availableTeacher,
                        d,
                        slot,
                        lecture.duration
                    );


                    markRoomBusy(
                        availableRoom,
                        d,
                        slot,
                        lecture.duration
                    );


                    for (
                        let k = 0;
                        k < lecture.duration;
                        k++
                    ) {

                        day.slots[
                            slot + k
                        ] = {

                            subjectName:
                                lecture.subjectName,    
                            subjectCode:lecture.subjectCode,
                            subjectType:lecture.subjectType,
                            teacherName:availableTeacher.teacherName,
                            roomNumber:availableRoom.roomName,
                            free: false
                        };
                    }
                    placed = true;
                }
            }
            /**
             * =========================
             * COULD NOT PLACE
             * =========================
             */

            if (!placed) {
                console.warn(`Could not place: ${lecture.subjectName} (${lecture.subjectCode})`);
            }
        }
    }
    /**
     * =========================
     * DEBUG
     * =========================
     */
    console.log(
        "FINAL TEACHER LOAD:",
        teacherLoad
    );


    return divisions.map(d => ({
        division:d.divisionName,
        schedule:d.schedule
    }));

};

export default generateEmptyTimetable;