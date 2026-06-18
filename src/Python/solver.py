import json
import sys

data = json.loads(sys.stdin.read())

days = data["totalDays"]
slots = data["totalSlotsPerDay"]

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

divisions = data.get("divisions", [])
teachers = data.get("teachers", [])
rooms = data.get("rooms", [])
lectures = data.get("lectures", [])


def normalized_type(lecture):
    return lecture.get("type", "Lecture") or "Lecture"


def is_lab(lecture):
    return normalized_type(lecture) == "Lab"


def is_lecture(lecture):
    return normalized_type(lecture) == "Lecture"


def get_teacher_id(teacher):
    return str(
        teacher.get("teacherId")
        or teacher.get("_id")
        or teacher.get("id")
        or ""
    )


def get_teacher_name(teacher):
    return teacher.get("teacherName") or teacher.get("name") or "-"


def lecture_duration(lecture):
    return max(1, min(slots, int(lecture.get("duration", 1) or 1)))


default_lab_duration = max(
    [lecture_duration(lecture) for lecture in lectures if is_lab(lecture)] or [2]
)
daily_lab_slot_limit = 0

if slots >= default_lab_duration:
    lab_blocks_per_day = max(1, round((slots / 3) / default_lab_duration))
    daily_lab_slot_limit = min(slots, lab_blocks_per_day * default_lab_duration)

daily_lecture_target = max(0, slots - daily_lab_slot_limit)
lab_subjects = {
    lecture.get("subject", "")
    for lecture in lectures
    if is_lab(lecture)
}


teacher_by_id = {
    get_teacher_id(teacher): teacher
    for teacher in teachers
    if get_teacher_id(teacher)
}

lecture_teacher_ids = [
    [str(value) for value in lecture.get("teacherIds", []) if str(value)]
    for lecture in lectures
]

teacher_busy = set()
room_busy = set()
division_lab_subject_days = [set() for _ in divisions]

timetable = []

for division in divisions:
    schedule = []

    for day_index in range(days):
        schedule.append({
            "day": DAYS[day_index],
            "slots": [None for _ in range(slots)]
        })

    timetable.append({
        "division": division.get("name", f"Division {len(timetable) + 1}"),
        "schedule": schedule
    })


def matching_teachers(lecture_index):
    matches = [
        teacher_by_id[teacher_id]
        for teacher_id in lecture_teacher_ids[lecture_index]
        if teacher_id in teacher_by_id
    ]

    return matches or teachers


def matching_rooms(lecture):
    room_type = lecture.get("roomType", "")
    matches = [room for room in rooms if room.get("type", "") == room_type]
    return matches or rooms


def teacher_key(teacher, day_index, slot_index):
    return f"{get_teacher_id(teacher)}_{day_index}_{slot_index}"


def room_key(room, day_index, slot_index):
    return f"{room.get('id') or room.get('_id') or room.get('name')}_{day_index}_{slot_index}"


def has_same_subject_neighbor(division_schedule, lecture, day_index, start_slot):
    if not is_lecture(lecture):
        return False

    subject = lecture.get("subject", "")
    before_slot = start_slot - 1
    after_slot = start_slot + lecture_duration(lecture)

    if before_slot >= 0:
        before = division_schedule[day_index]["slots"][before_slot]
        if before and before.get("type") == "Lecture" and before.get("subject") == subject:
            return True

    if after_slot < slots:
        after = division_schedule[day_index]["slots"][after_slot]
        if after and after.get("type") == "Lecture" and after.get("subject") == subject:
            return True

    return False


def count_day_slots(day, slot_type):
    return sum(1 for slot in day["slots"] if slot and slot.get("type") == slot_type)


def day_has_subject(day, subject, slot_type):
    return any(
        slot
        and slot.get("type") == slot_type
        and slot.get("subject") == subject
        for slot in day["slots"]
    )


def can_place_by_daily_mix(division_index, division_schedule, lecture, day_index, enforce_lab_rotation=True):
    day = division_schedule[day_index]
    duration = lecture_duration(lecture)

    if is_lab(lecture):
        subject = lecture.get("subject", "")

        if daily_lab_slot_limit <= 0:
            return False

        if duration != default_lab_duration:
            return False

        if count_day_slots(day, "Lab") + duration > daily_lab_slot_limit:
            return False

        if day_has_subject(day, subject, "Lab"):
            return False

        used_subjects = division_lab_subject_days[division_index]
        has_unused_lab_subject = any(
            lab_subject not in used_subjects
            for lab_subject in lab_subjects
        )

        if enforce_lab_rotation and has_unused_lab_subject and subject in used_subjects:
            return False

        return True

    return True


def placement_score(division_index, division_schedule, lecture, day_index, start_slot):
    day = division_schedule[day_index]
    lecture_slots = count_day_slots(day, "Lecture")
    lab_slots = count_day_slots(day, "Lab")
    free_slots = sum(1 for slot in day["slots"] if slot is None)

    if is_lab(lecture):
        subject = lecture.get("subject", "")
        balance_gap = daily_lab_slot_limit - lab_slots
        subject_is_new_for_week = subject not in division_lab_subject_days[division_index]
        return (
            subject_is_new_for_week,
            balance_gap,
            free_slots,
            -day_index,
            -start_slot
        )

    lecture_gap = daily_lecture_target - lecture_slots
    return (
        lecture_gap,
        free_slots,
        -lab_slots,
        -day_index,
        -start_slot
    )


def find_placement(division_index, lecture_index, tentative_teacher_busy, tentative_room_busy):
    lecture = lectures[lecture_index]
    duration = lecture_duration(lecture)
    division_schedule = timetable[division_index]["schedule"]
    candidates = []

    rotation_attempts = [True, False] if is_lab(lecture) else [True]

    for enforce_lab_rotation in rotation_attempts:
        for day_offset in range(days):
            day_index = (division_index + day_offset) % days

            if not can_place_by_daily_mix(
                division_index,
                division_schedule,
                lecture,
                day_index,
                enforce_lab_rotation
            ):
                continue

            for start_slot in range(slots - duration + 1):
                if has_same_subject_neighbor(division_schedule, lecture, day_index, start_slot):
                    continue

                if any(division_schedule[day_index]["slots"][start_slot + offset] is not None for offset in range(duration)):
                    continue

                for teacher in matching_teachers(lecture_index):
                    if any(
                        teacher_key(teacher, day_index, start_slot + offset) in teacher_busy
                        or teacher_key(teacher, day_index, start_slot + offset) in tentative_teacher_busy
                        for offset in range(duration)
                    ):
                        continue

                    for room in matching_rooms(lecture):
                        if any(
                            room_key(room, day_index, start_slot + offset) in room_busy
                            or room_key(room, day_index, start_slot + offset) in tentative_room_busy
                            for offset in range(duration)
                        ):
                            continue

                        candidates.append({
                            "day_index": day_index,
                            "start_slot": start_slot,
                            "teacher": teacher,
                            "room": room,
                            "score": placement_score(division_index, division_schedule, lecture, day_index, start_slot)
                        })

        if candidates:
            break

    if not candidates:
        return None

    return max(candidates, key=lambda placement: placement["score"])


def commit_placement(division_index, lecture_index, placement):
    lecture = lectures[lecture_index]
    duration = lecture_duration(lecture)
    day_index = placement["day_index"]
    start_slot = placement["start_slot"]
    teacher = placement["teacher"]
    room = placement["room"]

    for offset in range(duration):
        slot_index = start_slot + offset
        teacher_busy.add(teacher_key(teacher, day_index, slot_index))
        room_busy.add(room_key(room, day_index, slot_index))

        timetable[division_index]["schedule"][day_index]["slots"][slot_index] = {
            "subject": lecture.get("subject", ""),
            "subjectCode": lecture.get("subjectCode", "-"),
            "teacher": get_teacher_name(teacher),
            "roomType": lecture.get("roomType", ""),
            "room": room.get("name") or lecture.get("roomName", "-"),
            "type": normalized_type(lecture)
        }

    if is_lab(lecture):
        division_lab_subject_days[division_index].add(lecture.get("subject", ""))


def interleaved_order(target_type):
    pending = [
        index for index, lecture in enumerate(lectures)
        if normalized_type(lecture) == target_type
    ]
    subject_totals = {}

    for index in pending:
        subject = lectures[index].get("subject", "")
        subject_totals[subject] = subject_totals.get(subject, 0) + 1

    order = []
    last_subject = None

    while pending:
        pending.sort(
            key=lambda index: (
                lectures[index].get("subject", "") == last_subject,
                -subject_totals.get(lectures[index].get("subject", ""), 0),
                -lecture_duration(lectures[index]),
                lectures[index].get("subject", "")
            )
        )

        selected = pending.pop(0)
        subject = lectures[selected].get("subject", "")
        subject_totals[subject] -= 1
        last_subject = subject
        order.append(selected)

    return order


lecture_order = interleaved_order("Lab") + interleaved_order("Lecture")

skipped = []

for lecture_index in lecture_order:
    placements = []
    tentative_teacher_busy = set()
    tentative_room_busy = set()

    for division_index in range(len(divisions)):
        placement = find_placement(
            division_index,
            lecture_index,
            tentative_teacher_busy,
            tentative_room_busy
        )

        if placement is None:
            placements = []
            skipped.append(lectures[lecture_index].get("subject", "Unknown"))
            break

        duration = lecture_duration(lectures[lecture_index])

        for offset in range(duration):
            tentative_teacher_busy.add(
                teacher_key(placement["teacher"], placement["day_index"], placement["start_slot"] + offset)
            )
            tentative_room_busy.add(
                room_key(placement["room"], placement["day_index"], placement["start_slot"] + offset)
            )

        placements.append(placement)

    for division_index, placement in enumerate(placements):
        commit_placement(division_index, lecture_index, placement)


for division in timetable:
    for day in division["schedule"]:
        for slot_index, slot in enumerate(day["slots"]):
            if slot is None:
                day["slots"][slot_index] = {
                    "subject": "Free",
                    "teacher": "-",
                    "roomType": "",
                    "room": "-",
                    "type": "Free"
                }


response = {
    "success": bool(timetable),
    "timetable": timetable,
    "skipped": skipped
}

print(json.dumps(response))
