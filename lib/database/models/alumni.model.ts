import mongoose, { Schema, Document } from "mongoose";

interface IAlumni extends Document {
  student: mongoose.Types.ObjectId;
  program: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  school: mongoose.Types.ObjectId;
  graduationSession: string;
  certificateNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const AlumniSchema = new Schema<IAlumni>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    program: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true },
    graduationSession: { type: String, required: true },
    certificateNumber: { type: String, required: true },
  },
  { timestamps: true }
);

const Alumni = mongoose.models.Alumni || mongoose.model("Alumni", AlumniSchema);
export default Alumni;
