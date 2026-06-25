import json
import sys

data = json.loads(sys.stdin.read())

days = int(data.get("totalDays", 5))
lecture_slots_per_day = int(data.get("totalSlotsPerDay", 8))

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

divisions = data.get("divisions", [])
teachers = data.get("teachers", [])
rooms = data.get("rooms", [])
lectures = data.get("lectures", [])
break_slots = data.get("breakSlots", [])

# Build the combined slot map: for each position in the final array,
# is it a break slot or a lecture slot (and which lecture index)?
# break_slots[i].slotIndex = number of lecture slots BEFORE this break

# Sort breaks by slotIndex to process in order
sorted_breaks = sorted(break_slots, key=lambda b: int(b.get("slotIndex", 0)))

# Build a list of (type, index) for each row in the final timetable
# type = "lecture" (with lecture_index) or "break"
combined_slots = []  # list of dicts: {"type": "lecture"/"break", "lecture_index": int, "break": dict}
lecture_idx = 0
break_queue = list(sorted_breaks)

for i in range(lecture_slots_per_day):
    # Insert any breaks that come after this many lecture slots
    while break_queue and int(break_queue[0].get("slotIndex", 0)) == i:
        combined_slots.append({"type": "break", "break": break_queue.pop(0)})
    combined_slots.append({"type": "lecture", "lecture_index": lecture_idx})
    lecture_idx += 1

# Insert any trailing breaks (after all lecture slots)
for b in break_queue:
    combined_slots.append({"type": "break", "break": b})

total_combined = len(combined_slots)
# Build set of break positions in combined array
break_positions = {i for i, s in enumerate(combined_slots) if s["type"] == "break"}

# ----------------------------
# HELPERS
# ----------------------------
def normalized_type(lecture):
    t = (lecture.get("type") or "Lecture").strip().lower()

    if t == "lecture":
        return "Lecture"

    if t == "lab":
        return "Lab"

    return "Lecture"

def is_lab(lecture):
    return normalized_type(lecture) == "Lab"

def lecture_duration(l):
    return max(1, int(l.get("duration") or 1))

def get_teacher_id(t):
    # Use _id to match subject.teachers ObjectId references
    return str(t.get("id") or t.get("_id") or t.get("teacherId") or "")

def get_teacher_name(t):
    return t.get("teacherName") or t.get("name") or "-"

# ----------------------------
# ROOM TYPE MATCH
# ----------------------------
def matching_rooms(lecture):
    lecture_type = normalized_type(lecture).lower()

    matches = [
        r for r in rooms
        if str(r.get("roomType") or r.get("type") or "").strip().lower() == lecture_type
    ]

    return matches if matches else rooms

# ----------------------------
# TEACHER MAP
# ----------------------------
teacher_by_id = {
    get_teacher_id(t): t for t in teachers if get_teacher_id(t)
}

lecture_teacher_ids = [
    [str(x) for x in l.get("teacherIds", []) if str(x)]
    for l in lectures
]

def matching_teachers(i):
    ids = lecture_teacher_ids[i]
    matches = [teacher_by_id.get(t) for t in ids if teacher_by_id.get(t)]
    return matches if matches else teachers

# ----------------------------
# BUSY TRACKERS
# ----------------------------
teacher_busy = set()
room_busy = set()

def tkey(t, d, s):
    return f"{get_teacher_id(t)}_{d}_{s}"

def rkey(r, d, s):
    return f"{r.get('id') or r.get('_id') or r.get('name')}_{d}_{s}"

# ----------------------------
# INITIAL TIMETABLE
# ----------------------------
timetable = []

for i, div in enumerate(divisions):
    schedule = []

    for d in range(days):
        day_slots = []

        for cs in combined_slots:
            if cs["type"] == "break":
                b = cs["break"]
                day_slots.append({
                    "subjectName": b.get("label", "Break"),
                    "subjectCode": "-",
                    "subjectType": "Break",
                    "teacherName": "-",
                    "roomNumber": "-"
                })
            else:
                day_slots.append({
                    "subjectName": "Free",
                    "subjectCode": "-",
                    "subjectType": "Free",
                    "teacherName": "-",
                    "roomNumber": "-"
                })

        schedule.append({
            "day": DAYS[d],
            "slots": day_slots
        })

    timetable.append({
        "division": div.get("name", f"Division {i+1}"),
        "schedule": schedule
    })

# ----------------------------
# PLACEMENT LOGIC
# ----------------------------
def find_place(div_idx, lec_idx):
    lec = lectures[lec_idx]
    dur = lecture_duration(lec)
    candidates = matching_teachers(lec_idx)

    # Rotate teacher order per division so each division prefers a different teacher
    rotated_teachers = candidates[div_idx % len(candidates):] + candidates[:div_idx % len(candidates)]

    for d in range(days):
        for s in range(total_combined - dur + 1):
            if any(
                timetable[div_idx]["schedule"][d]["slots"][s+i].get("subjectType") != "Free"
                for i in range(dur)
            ):
                continue

            if any((s + i) in break_positions for i in range(dur)):
                continue

            for t in rotated_teachers:
                if any(tkey(t, d, s+i) in teacher_busy for i in range(dur)):
                    continue

                for r in matching_rooms(lec):
                    if any(rkey(r, d, s+i) in room_busy for i in range(dur)):
                        continue

                    return {
                        "day": d,
                        "start": s,
                        "teacher": t,
                        "room": r
                    }
    print("Could not place:", lec.get("subjectName"), "div:", div_idx, file=sys.stderr)
    return None

# ----------------------------
# COMMIT
# ----------------------------
def commit(div_idx, lec_idx, place):
    lec = lectures[lec_idx]
    dur = lecture_duration(lec)

    d = place["day"]
    s = place["start"]
    t = place["teacher"]
    r = place["room"]

    for i in range(dur):
        teacher_busy.add(tkey(t, d, s+i))
        room_busy.add(rkey(r, d, s+i))

        timetable[div_idx]["schedule"][d]["slots"][s+i] = {
            "subjectName": lec.get("subjectName") or lec.get("subject") or "-",
            "subjectCode": lec.get("subjectCode", "-"),
            "subjectType": normalized_type(lec),
            "teacherName": get_teacher_name(t),
            "roomNumber": r.get("roomName", r.get("name", "-"))
        }

# ----------------------------
# SOLVE
# ----------------------------
skipped = []

for lec_idx in range(len(lectures)):
    placed_all = True

    for div_idx in range(len(divisions)):
        place = find_place(div_idx, lec_idx)

        if not place:
            skipped.append(lectures[lec_idx].get("subjectName") or lectures[lec_idx].get("subject"))
            placed_all = False
            break

        commit(div_idx, lec_idx, place)

# ----------------------------
# OUTPUT
# ----------------------------
print(json.dumps({
    "success": True,
    "timetable": timetable,
    "skipped": skipped
}))