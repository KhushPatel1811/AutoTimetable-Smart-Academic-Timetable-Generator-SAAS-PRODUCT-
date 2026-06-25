import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format",
      ],
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },

    role: {
      type: String,
      enum: ["Admin", "Teacher", "Student"],
      default: "Student",
      required: [true, 'Role Is Required'],
    },

    // IMPORTANT: This is tenant ownership (NOT userId)
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Institute Id Is Required'],
      index: true,
    },

    instituteName: {
      type: String,
      required: [true, 'Institute Name Is Required'],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema)

export default User;