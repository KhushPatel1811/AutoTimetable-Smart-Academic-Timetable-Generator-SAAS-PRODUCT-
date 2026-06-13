import express from 'express'
import TimeTable from '../Models/TimeTableModel.js'

const router = express.Router()


//! Helper to convert "HH:MM" strings into total minutes from midnight

const timeToMinutes = (timeStr) => {
    const [hour, minutes] = timeStr.split(':').map(Number)
    return hour*60 + minutes
}

//! Helper to convert total minutes back to readable "HH:MM AM/PM" format
const minuteToString = (totalMinutes) => {
    const hour = Math.floor(totalMinutes)/60
    const minutes = totalMinutes%60

    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour%12 === 0 ? 12 : hour%12
    const displayMinute = minutes < 10 ? `0${minute}` : minutes

    return `${displayHour}:${displayMinute} ${ampm}`
}



router.post('/generate', async (req, resp, next) => {
try {
    const { 
      departmentName, semester, totalDivisions, totalDays, 
      dayStartTime, dayEndTime, lectureDuration, labDuration, subjects 
    } = req.body;

    const lecDur = Number(lectureDuration);
    const labDur = Number(labDuration);
    
    // 1. Generate standard base time slots (e.g., 60-minute blocks)
    const calculatedSlots = [];
    let currentMinutes = timeToMinutes(dayStartTime);
    const endMinutes = timeToMinutes(dayEndTime);

    while (currentMinutes + lecDur <= endMinutes) {
      const start = minutesToTimeString(currentMinutes);
      const end = minutesToTimeString(currentMinutes + lecDur);
      calculatedSlots.push(`${start} - ${end}`);
      currentMinutes += lecDur;
    }

    const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const activeDays = ALL_DAYS.slice(0, Number(totalDays));

    // 2. Archive previous versions
    await Timetable.updateMany(
      { departmentName, semester: Number(semester), isLatest: true }, 
      { $set: { isLatest: false } }
    );
    
    const latestDoc = await Timetable.findOne({ departmentName, semester: Number(semester) }).sort({ version: -1 });
    const nextVersion = latestDoc ? latestDoc.version + 1 : 1;

    const divisionsData = [];

    // 3. Process the Multi-Division Schedule Grid
    for (let d = 0; d < Number(totalDivisions); d++) {
      const divisionName = `Division ${String.fromCharCode(65 + d)}`;
      const divisionSchedule = [];

      for (const day of activeDays) {
        const slotsMap = {};
        
        // Track slots we skip over because a lab took up a double block
        const coveredSlots = new Set(); 

        for (let s = 0; s < calculatedSlots.length; s++) {
          const currentSlotTime = calculatedSlots[s];

          // If this specific hour was already claimed by a running lab, skip it
          if (coveredSlots.has(currentSlotTime)) continue;

          const subjectIndex = (d + activeDays.indexOf(day) + s) % subjects.length;
          const targetSub = subjects[subjectIndex];

          if (targetSub.subjectType === 'Lab') {
            // Check if there is a consecutive slot available to accommodate the longer lab duration
            const slotsNeeded = Math.ceil(labDur / lecDur); // e.g., 120 / 60 = 2 slots
            
            if (s + slotsNeeded <= calculatedSlots.length) {
              // Calculate the combined custom time string for the lab block
              const labStartStr = calculatedSlots[s].split(' - ')[0];
              const labEndStr = calculatedSlots[s + slotsNeeded - 1].split(' - ')[1];
              const combinedLabTimeRange = `${labStartStr} - ${labEndStr}`;

              const labData = {
                subjectName: targetSub.subjectName,
                subjectCode: targetSub.subjectCode,
                teacherName: targetSub.teacherName || 'Faculty Member',
                roomNumber: `${201 + Number(semester) * 10 + d + s}`, // Labs typically use different labs/rooms
                type: 'Lab'
              };

              // Map the lab data to the initial slot time and lock succeeding slots
              slotsMap[currentSlotTime] = labData;
              
              for (let i = 1; i < slotsNeeded; i++) {
                const nextSlot = calculatedSlots[s + i];
                coveredSlots.add(nextSlot);
                // Mark subsequent base slots as part of this ongoing lab so the frontend can skip rendering them
                slotsMap[nextSlot] = { ...labData, isContinuation: true };
              }
              continue;
            }
          }

          // Default Fallback: Standard Lecture Assignment
          slotsMap[currentSlotTime] = {
            subjectName: targetSub.subjectName,
            subjectCode: targetSub.subjectCode,
            teacherName: targetSub.teacherName || 'Faculty Member',
            roomNumber: `${101 + Number(semester) * 10 + d + s}`,
            type: 'Lecture'
          };
        }
        
        divisionSchedule.push({ day, slots: slotsMap });
      }
      divisionsData.push({ divisionName, schedule: divisionSchedule });
    }

    // 4. Save parent document
    const newTimetable = new Timetable({
      departmentName,
      semester: Number(semester),
      totalDivisions: Number(totalDivisions),
      totalDays: Number(totalDays),
      dayStartTime,
      dayEndTime,
      lectureDuration: lecDur,
      labDuration: labDur,
      version: nextVersion,
      isLatest: true,
      divisions: divisionsData
    });

    await newTimetable.save();
    res.status(201).json({ timetable: newTimetable, generatedSlots: calculatedSlots });
  } catch (error) {
    res.status(500).json({ message: 'Engine compilation error', error: error.message });
  }
})




router.get('/latest', async (req, resp, next) => {
    try {
        const { department, semester } = req.query;
        const timetable = await Timetable.findOne({
            departmentName: department,
            semester: Number(semester),
            isLatest: true
        });
        res.status(200).json(timetable);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching timetable", error: error.message });
    }
})


export default router