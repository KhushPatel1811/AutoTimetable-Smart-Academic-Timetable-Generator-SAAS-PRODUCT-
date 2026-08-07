import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from './Routes/auth.route.js';
import dashboardRoutes from './Routes/dashboard.route.js';
import profileRoutes from './Routes/profile.route.js';
import teacherRoutes from './Routes/teacher.route.js';
import departmentRoutes from './Routes/department.route.js';
import roomRoutes from './Routes/room.route.js';
import subjectRoutes from './Routes/subject.route.js';
import timeTableRoutes from './Routes/timetable.route.js';
import savedTimetableRoutes from './Routes/saved-timetable.route.js';
import notificationRoutes from './Routes/notification.route.js';
import activityLogRoutes from './Routes/activity-log.route.js';

dotenv.config({ path: '../.env' });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.PORT || 2000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/Institute_Time_Table";

console.log("MONGODB_URI:", process.env.MONGODB_URI);

mongoose.connect(MONGODB_URI).then(() => {
    console.log("Connected to MongoDB Database");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Error connecting to MongoDB Database:", err);
    console.log("Name:", err.name);
    console.log("Message:", err.message);
});

// Auth
app.use('/auth', authRoutes);

// Dashboard
app.use('/', dashboardRoutes);

// Profile
app.use('/profile', profileRoutes);

// Teachers
app.use('/teachers', teacherRoutes);

// Departments
app.use('/departments', departmentRoutes);

// Rooms
app.use('/rooms', roomRoutes);

// Subjects
app.use('/subjects', subjectRoutes);

// Timetable Generation
app.use('/timetable', timeTableRoutes);

// Saved Timetables
app.use('/saved-timetables', savedTimetableRoutes);

// Notifications (with 24h TTL auto-cleanup via MongoDB index)
app.use('/notifications', notificationRoutes);

// Activity Logs (Founder-only)
app.use('/activity-logs', activityLogRoutes);
