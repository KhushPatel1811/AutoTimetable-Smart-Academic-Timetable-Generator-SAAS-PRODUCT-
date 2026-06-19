import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv"
import authRoutes from './src/Routes/auth.route.js'
import dashboardRoutes from './src/Routes/dashboard.route.js'
import profileRoutes from './src/Routes/profile.route.js'
import teacherRoutes from './src/Routes/teacher.route.js'
import departmentRoutes from './src/Routes/department.route.js'
import roomRoutes from './src/Routes/room.route.js'
import subjectRoutes from './src/Routes/subject.route.js'
import timeTableRoutes from './src/Routes/timetable.route.js'
dotenv.config();    

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 2000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/Institute_Time_Table";

// Connecting Backend With MongoDB
mongoose.connect(MONGODB_URI).then(() => {
    console.log("Connected to MongoDB Database");
 
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Connected to Database: ${MONGODB_URI}`);
    });
  }).catch((err) => {
    console.error("Error connecting to MongoDB Database:", err);
});



// Login, Register And ChangePassword
app.use('/auth', authRoutes)

//Dashboard
app.use('/', dashboardRoutes)

//Profile
app.use('/profile', profileRoutes)

//Teachers
app.use('/teachers', teacherRoutes)

// Departments
app.use('/departments', departmentRoutes)

// Rooms
app.use('/rooms', roomRoutes)


// Subjects
app.use('/subjects', subjectRoutes)


//Timetable
app.use('/timetable', timeTableRoutes)