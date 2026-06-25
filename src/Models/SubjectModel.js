import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    subjectId: {
      type: String,
      required: [true, 'Subject Id Is Required'],
      trim: true,
    },

    subjectName: {
      type: String,
      required: [true, 'Subject Name Is Required'],
      trim: true,
    },

    subjectCode: {
      type: String,
      unique: true,
      required: [true, 'Subject Code Is required'],
      trim: true,
    },

    semester: {
      type: Number,
      required: [true, 'Semester Is Required'],
      min: 1,
      max: 10,
    },

    departmentName: {
      type: String,
      required: [true, 'Department Name Is Required'],
      trim: true,
    },

    subjectType: {
      type: String,
      enum: ["Lecture", "Lab", "Lecture + Lab"],
      default: "Lecture",
      required: [true, 'Subject Type Is Required'],
    },

    weekly_Lecture_Hour: {
      type: Number,
      required: [true, 'Weekly Lecture Hour Is Required'],
      min: [0, 'Min 0 lectures allowed'],
      max:[10, 'Max 10 lectured allowed']
    },

    weekly_Lab_Hour: {
      type: Number,
      required: [true, 'Weekly Lab Hour Is Required'],
      min: [0, 'Min 0 lab hour allowed'],
      max: [6, 'Max 6 lab hour required'],
    },

    preferredRoomType: {
      type: String,
      enum: ["Lecture", "Lab", "Seminar", "Auditorium"],
      default: "Lecture",
      required: [true, 'Preferred Room Type Is required'],
    },

    // ✅ RBAC CORE FIELD (IMPORTANT)
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Institute Id Is Required'],
      index: true,
    },

    // ✅ Proper relation instead of string names
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Subject = mongoose.model("Subject", SubjectSchema);

export default Subject;