import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      trim: true,
      required: [true, "Room Name Is Required"],
    },

    roomId: {
      type: String,
      trim: true,
      required: [true, "Room Id Is Required"],
    },

    roomType: {
      type: String,
      trim: true,
      required: true,
      enum: ["Lecture", "Lab", "Seminar", "Auditorium"],
      default: "Lecture",
    },

    roomStatus: {
      type: String,
      trim: true,
      required: true,
      enum: ["Available", "Occupied", "Under Maintenance"],
      default: "Available",
    },

    departmentName: {
      type: String,
      trim: true,
      required: true,
    },

    // ✅ IMPORTANT: tenant isolation
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // optional audit tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;