import { Schema, model, models, Document, Types } from "mongoose";

const AnswerSchema = new Schema({
  questionId: { type: String, required: true },
  sectionIndex: { type: Number, required: true },
  questionIndex: { type: Number, required: true },
  answerText: { type: String },
  selectedOption: { type: String },
  score: { type: Number, default: 0 },
  marks: { type: Number, default: 0 },
});

interface ICourseAssessmentAttempt extends Document {
  courseAssessment: Types.ObjectId;
  student: Types.ObjectId;
  assessmentType: "exam" | "test" | "assignment" | "quiz" | "project";
  questionType: "objective" | "theory" | "hybrid";
  answers: any[];
  status: "in-progress" | "submitted" | "graded";
  totalScore?: number;
  totalObtainedMarks?: number;
  totalPossibleMarks?: number;
  submittedAt?: Date;
  gradedBy?: Types.ObjectId;
  gradedAt?: Date;
}

const CourseAssessmentAttemptSchema = new Schema<ICourseAssessmentAttempt>(
  {
    courseAssessment: {
      type: Schema.Types.ObjectId,
      ref: "CourseAssessment",
      required: true,
    },

    student: { type: Schema.Types.ObjectId, ref: "User", required: true },

    assessmentType: {
      type: String,
      enum: ["exam", "test", "assignment", "quiz", "project"],
      required: true,
    },

    questionType: {
      type: String,
      enum: ["objective", "theory", "hybrid"],
      required: true,
    },

    answers: [AnswerSchema],

    status: {
      type: String,
      enum: ["in-progress", "submitted", "graded"],
      default: "in-progress",
    },

    totalScore: { type: Number, default: 0 },
    totalObtainedMarks: { type: Number, default: 0 },
    totalPossibleMarks: { type: Number, default: 0 },

    submittedAt: { type: Date },
    gradedBy: { type: Schema.Types.ObjectId, ref: "User" },

    gradedAt: { type: Date },
  },
  { timestamps: true }
);

const CourseAssessmentAttempt =
  models.CourseAssessmentAttempt ||
  model<ICourseAssessmentAttempt>(
    "CourseAssessmentAttempt",
    CourseAssessmentAttemptSchema
  );

export default CourseAssessmentAttempt;
