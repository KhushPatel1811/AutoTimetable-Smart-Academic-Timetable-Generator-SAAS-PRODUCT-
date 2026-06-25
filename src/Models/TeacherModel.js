import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    teacherId: {
      type: String,
      required: [true, "Teacher ID is required"],
      trim: true,
    },

    teacherName: {
      type: String,
      required: [true, "Teacher name is required"],
      trim: true,
      minLength: [3, "Name must be at least 3 characters"],
      maxLength: [50, "Name cannot exceed 50 characters"],
      match: [
        /^[A-Za-z0-9\s.,&()-]+$/,
        "Name contains invalid characters",
      ],
    },

    teacherEmail: {
      type: String,
      required: [true, "Teacher email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email format",
      ],
    },

    teacherPhoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Phone number must contain 10 digits"],
    },

    teacherDepartment: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },

    teacherAvailability: {
      type: String,
      required: [true, "Availability status is required"],
      enum: {
        values: ["Available", "Busy", "On Leave"],
        message: "Invalid teacher availability status",
      },
      default: "Available",
    },

    // ✅ RBAC CORE FIELD
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Institute ID is required"],
      index: true,
    },

    // optional audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // proper relation
    Subjects: [
      {
        subjects: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;