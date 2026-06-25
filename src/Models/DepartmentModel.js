import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: [true, "Department Name Is Required"],
      trim: true,
      match: [/^[A-Za-z0-9 ]+$/, "Invalid Department Name"],
    },

    departmentId: {
      type: String,
      required: true,
      trim: true,
    },

    // IMPORTANT: tenant isolation
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },

    // OPTIONAL (only if you want audit tracking)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

departmentSchema.index(
  { instituteId: 1, departmentName: 1 },
  { unique: true }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;