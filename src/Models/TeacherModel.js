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

    // ✅ MULTI-DEPARTMENT: array of department names
    teacherDepartments: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "At least one department is required",
      },
    },

    // ✅ LEGACY SUPPORT: keep teacherDepartment as virtual/first element for backward compat
    teacherDepartment: {
      type: String,
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

    // Optional linked user account (for teacher portal login)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    Subjects: [
      {
        subjects: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save: keep teacherDepartment in sync with first element of teacherDepartments
teacherSchema.pre("save", function (next) {
  if (this.teacherDepartments && this.teacherDepartments.length > 0) {
    this.teacherDepartment = this.teacherDepartments[0];
  }
  next();
});

teacherSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.$set?.teacherDepartments?.length > 0) {
    update.$set.teacherDepartment = update.$set.teacherDepartments[0];
  }
  next();
});

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;
