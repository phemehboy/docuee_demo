import mongoose from "mongoose";
import { Types } from "mongoose";

export type PopulatedUser = {
  _id: string | mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  picture?: string | null;
  level?: { _id: string | mongoose.Types.ObjectId; name: string }[];
  department?: { _id: string | mongoose.Types.ObjectId; name: string }[];
  program?: {
    _id: string | mongoose.Types.ObjectId;
    type: string;
    department?: { _id: string | mongoose.Types.ObjectId; name: string };
  }[];
  studyMode?: { _id: string | mongoose.Types.ObjectId; name: string }[];
  designation?: { _id: string | mongoose.Types.ObjectId; name: string } | null;
};

export interface StudentLean {
  _id?: Types.ObjectId | string;
  userId?: Types.ObjectId | string;

  school?: Types.ObjectId | string;
  level?: Types.ObjectId | string;
  department?: Types.ObjectId | string;
  program?: Types.ObjectId | string;

  studyMode?: Types.ObjectId | string;
  admissionNumber?: string | null;
  cohortSerial?: number | null;
  semester?: Types.ObjectId | string;
  session?: string | null;
}
