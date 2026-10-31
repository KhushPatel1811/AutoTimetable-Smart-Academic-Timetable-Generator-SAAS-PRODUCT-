import json
import sys

data = json.loads(sys.stdin.read())

days = int(data.get("totalDays", 5))
lecture_slots_per_day = int(data.get("totalSlotsPerDay", 8))

DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
]

divisions = data.get("divisions", [])
teachers = data.get("teachers", [])
rooms = data.get("rooms", [])
lectures = data.get("lectures", [])
break_slots = data.get("breakSlots", [])


# ============================================================
# BUILD COMBINED SLOT STRUCTURE
# ============================================================

sorted_breaks = sorted(
    break_slots,
    key=lambda b: int(b.get("slotIndex", 0))
)

combined_slots = []

lecture_idx = 0
break_queue = list(sorted_breaks)

for i in range(lecture_slots_per_day):

    while (
        break_queue
        and int(break_queue[0].get("slotIndex", 0)) == i
    ):
        combined_slots.append({
            "type": "break",
            "break": break_queue.pop(0)
        })

    combined_slots.append({
        "type": "lecture",
        "lecture_index": lecture_idx
    })

    lecture_idx += 1


# Trailing breaks
for b in break_queue:
    combined_slots.append({
        "type": "break",
        "break": b
    })


total_combined = len(combined_slots)

break_positions = {
    i
    for i, s in enumerate(combined_slots)
    if s["type"] == "break"
}


# ============================================================
# HELPERS
# ============================================================

def normalized_type(lecture):

    t = (
        lecture.get("type")
        or "Lecture"
    ).strip().lower()

    if t == "lecture":
        return "Lecture"

    if t == "lab":
        return "Lab"

    return "Lecture"


def lecture_duration(lecture):

    return max(
        1,
        int(lecture.get("duration") or 1)
    )


def get_teacher_id(teacher):

    return str(
        teacher.get("teacherId")
        or teacher.get("id")
        or teacher.get("_id")
        or ""
    )


def get_teacher_name(teacher):

    return (
        teacher.get("teacherName")
        or teacher.get("name")
        or "-"
    )


def get_room_id(room):

    return str(
        room.get("id")
        or room.get("_id")
        or room.get("roomId")
        or room.get("name")
        or ""
    )


def get_room_name(room):

    return (
        room.get("roomName")
        or room.get("name")
        or "-"
    )


# ============================================================
# ROOM MATCHING
# ============================================================

def matching_rooms(lecture):

    lecture_type = normalized_type(lecture).lower()

    matches = [
        r
        for r in rooms
        if str(
            r.get("roomType")
            or r.get("type")
            or ""
        ).strip().lower() == lecture_type
    ]

    return matches if matches else rooms


# ============================================================
# TEACHER MAP
# ============================================================

teacher_by_id = {
    get_teacher_id(t): t
    for t in teachers
    if get_teacher_id(t)
}


def matching_teachers(lecture_index):

    lecture = lectures[lecture_index]

    ids = [
        str(x)
        for x in lecture.get("teacherIds", [])
        if str(x)
    ]

    matches = [
        teacher_by_id[t_id]
        for t_id in ids
        if t_id in teacher_by_id
    ]

    # If subject has assigned teachers,
    # ONLY those teachers are allowed.
    if matches:
        return matches

    # Otherwise all teachers are allowed.
    return teachers


# ============================================================
# BUSY TRACKERS
# ============================================================

teacher_busy = set()
room_busy = set()


def teacher_key(teacher, day, slot):

    return f"{get_teacher_id(teacher)}_{day}_{slot}"


def room_key(room, day, slot):

    return f"{get_room_id(room)}_{day}_{slot}"


# ============================================================
# TEACHER LOAD
#
# IMPORTANT:
# We keep track of how many slots each teacher has received
# inside each division.
#
# This prevents one teacher from being selected for the
# complete division.
# ============================================================

teacher_division_load = {}

for div_idx in range(len(divisions)):

    teacher_division_load[div_idx] = {}

    for teacher in teachers:

        teacher_id = get_teacher_id(teacher)

        teacher_division_load[div_idx][teacher_id] = 0


# ============================================================
# INITIAL TIMETABLE
# ============================================================

timetable = []

for div_idx, div in enumerate(divisions):

    schedule = []

    for d in range(days):

        day_slots = []

        for combined_slot in combined_slots:

            if combined_slot["type"] == "break":

                b = combined_slot["break"]

                day_slots.append({
                    "subjectName": b.get(
                        "label",
                        "Break"
                    ),

                    "subjectCode": "-",

                    "subjectType": "Break",

                    "teacherId": "-",

                    "teacherName": "-",

                    "roomNumber": "-"
                })

            else:

                day_slots.append({
                    "subjectName": "Free",

                    "subjectCode": "-",

                    "subjectType": "Free",

                    "teacherId": "-",

                    "teacherName": "-",

                    "roomNumber": "-"
                })

        schedule.append({
            "day": DAYS[d],
            "slots": day_slots
        })

    timetable.append({
        "division": div.get(
            "name",
            f"Division {div_idx + 1}"
        ),

        "schedule": schedule
    })


# ============================================================
# FIND BEST TEACHER
# ============================================================

def get_sorted_teachers(candidates, div_idx):

    """
    Sort teachers by their current workload in this division.

    The teacher with the LOWEST workload is preferred.

    This is the main fix.
    """

    return sorted(
        candidates,
        key=lambda teacher: (
            teacher_division_load[div_idx].get(
                get_teacher_id(teacher),
                0
            ),

            get_teacher_id(teacher)
        )
    )


# ============================================================
# FIND PLACE
# ============================================================

def find_place(div_idx, lecture_index):

    lecture = lectures[lecture_index]

    duration = lecture_duration(lecture)

    candidates = matching_teachers(
        lecture_index
    )

    if not candidates:

        return None


    # --------------------------------------------------------
    # IMPORTANT
    # Sort teachers according to their CURRENT LOAD
    # --------------------------------------------------------

    ordered_teachers = get_sorted_teachers(
        candidates,
        div_idx
    )


    # --------------------------------------------------------
    # Search days
    # --------------------------------------------------------

    for d in range(days):

        # ----------------------------------------------------
        # Search slots
        # ----------------------------------------------------

        for s in range(
            total_combined - duration + 1
        ):

            # ------------------------------------------------
            # Division must be free
            # ------------------------------------------------

            if any(
                timetable[div_idx]
                ["schedule"][d]
                ["slots"][s + i]
                .get("subjectType") != "Free"

                for i in range(duration)
            ):

                continue


            # ------------------------------------------------
            # Cannot cross a break
            # ------------------------------------------------

            if any(
                (s + i) in break_positions

                for i in range(duration)
            ):

                continue


            # ------------------------------------------------
            # Try teachers in LOAD order
            # ------------------------------------------------

            for teacher in ordered_teachers:

                teacher_id = get_teacher_id(
                    teacher
                )

                # --------------------------------------------
                # Teacher must be free
                # --------------------------------------------

                teacher_available = True

                for i in range(duration):

                    key = teacher_key(
                        teacher,
                        d,
                        s + i
                    )

                    if key in teacher_busy:

                        teacher_available = False
                        break


                if not teacher_available:

                    continue


                # --------------------------------------------
                # Find room
                # --------------------------------------------

                available_room = None

                for room in matching_rooms(
                    lecture
                ):

                    room_available = True

                    for i in range(duration):

                        key = room_key(
                            room,
                            d,
                            s + i
                        )

                        if key in room_busy:

                            room_available = False
                            break


                    if room_available:

                        available_room = room
                        break


                if available_room is None:

                    continue


                # --------------------------------------------
                # Found valid placement
                # --------------------------------------------

                return {
                    "day": d,

                    "start": s,

                    "teacher": teacher,

                    "room": available_room
                }


    print(
        "Could not place:",
        lecture.get("subjectName"),
        "division:",
        div_idx,
        file=sys.stderr
    )

    return None


# ============================================================
# COMMIT
# ============================================================

def commit(
    div_idx,
    lecture_index,
    place
):

    lecture = lectures[lecture_index]

    duration = lecture_duration(
        lecture
    )

    d = place["day"]

    s = place["start"]

    teacher = place["teacher"]

    room = place["room"]


    teacher_id = get_teacher_id(
        teacher
    )


    # --------------------------------------------------------
    # Increase teacher workload for this division
    # --------------------------------------------------------

    teacher_division_load[
        div_idx
    ][teacher_id] += duration


    # --------------------------------------------------------
    # Occupy teacher + room
    # --------------------------------------------------------

    for i in range(duration):

        teacher_busy.add(
            teacher_key(
                teacher,
                d,
                s + i
            )
        )

        room_busy.add(
            room_key(
                room,
                d,
                s + i
            )
        )


        # ----------------------------------------------------
        # Write timetable cell
        # ----------------------------------------------------

        timetable[div_idx] \
            ["schedule"][d] \
            ["slots"][s + i] = {

            "subjectName":
                lecture.get(
                    "subjectName"
                )
                or lecture.get(
                    "subject"
                )
                or "-",

            "subjectCode":
                lecture.get(
                    "subjectCode",
                    "-"
                ),

            "subjectType":
                normalized_type(
                    lecture
                ),

            "teacherId":
                teacher_id,

            "teacherName":
                get_teacher_name(
                    teacher
                ),

            "roomNumber":
                get_room_name(
                    room
                )
        }


# ============================================================
# SOLVE
# ============================================================

skipped = []


for lecture_index in range(
    len(lectures)
):

    placed_all = True


    # --------------------------------------------------------
    # IMPORTANT:
    # Every division gets this subject,
    # but teacher selection is independent for each division.
    # --------------------------------------------------------

    for div_idx in range(
        len(divisions)
    ):

        place = find_place(
            div_idx,
            lecture_index
        )


        if not place:

            skipped.append(
                lectures[
                    lecture_index
                ].get(
                    "subjectName"
                )
                or lectures[
                    lecture_index
                ].get(
                    "subject"
                )
            )

            placed_all = False

            break


        commit(
            div_idx,
            lecture_index,
            place
        )


# ============================================================
# DEBUG: TEACHER LOAD
# ============================================================

print(
    "TEACHER LOAD PER DIVISION:",
    file=sys.stderr
)

for div_idx in range(
    len(divisions)
):

    print(
        timetable[div_idx]["division"],
        teacher_division_load[div_idx],
        file=sys.stderr
    )


# ============================================================
# OUTPUT
# ============================================================

print(
    json.dumps({
        "success": True,

        "timetable": timetable,

        "skipped": skipped
    })
)