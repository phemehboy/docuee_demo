import { IInstructor } from "@/lib/database/models/instructor.model";
import { IStudent } from "@/lib/database/models/student.model";
import { Currency } from "@/lib/database/models/successcharge.model";
import { IUser } from "@/mongodb";
import { Types } from "mongoose";
import React from "react";

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  program: { type: string };
  department: { name: string };
  level: { name: string };
  grades: string; // e.g., "A" or "3.5 GPA"
  passRate: string; // e.g., "85%"
  recommendedAction:
    | "Promote"
    | "Probation"
    | "Carryover"
    | "Repeat"
    | "Graduate";
  schoolId: string;
}

export interface Group {
  _id: string;
  name: string;
  students: IStudent[];
}

export interface PopulatedInstructor extends Omit<IInstructor, "userId"> {
  _id: string;
  userId: IUser;
}

export interface PopulatedStudent extends Omit<IStudent, "userId"> {
  _id: string;
  userId: IUser;
}

export interface PopulatedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
  gender: string;
  department: {
    _id: string;
    name: string;
  };
  school: {
    _id: string;
    name: string;
  };
  level: {
    _id: string;
    name: string;
  };
}

export type PopulatedCreator = {
  _id: string;

  // From User (via student.userId)
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
  gender: string;

  // From Student directly
  admissionNumber?: string;
  cohortSerial: number;
  status?: "active" | "graduated";

  // Populated refs
  department?: { _id: string; name: string } | null;
  school?: { _id: string; name: string } | null;
  level?: { _id: string; name: string } | null;
  program?: { _id: string; name: string } | null;
  studyMode?: { _id: string; name: string } | null;

  supervisor?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;

  // Optionally include courses if you populate them
  courses?: { _id: string; code: string; title: string }[];
};

declare type SectionHeadingProps = {
  className: string;
  title: string;
  text?: string;
};

declare type SectionProps = {
  className?: string;
  id: string;
  customPaddings?: string;
  children: React.ReactNode;
};

declare type FaqProps = {
  item: {
    id: number;
    question: string;
    answer: string;
  };
  index: number;
};

declare type HeaderProps = {
  children: React.ReactNode;
  className?: string;
  href: string;
};

declare type AIActionType =
  | "GENERATE_OUTLINE"
  | "SUMMARIZE_STAGE"
  | "FIND_STAGE_GAPS"
  | "CHECK_TONE"
  | "STRUCTURE_SECTION"
  | "EXPLAIN_SECTION"
  | "IMPROVE_CLARITY"
  | "FIND_GAPS";
declare type gender = "male" | "female" | "other";
declare type userType = "supervisor" | "student" | "instructor" | "schoolAdmin";
declare type Status = "pending" | "approved" | "rejected";

export type CreateUserParams = {
  clerkId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  picture: string;
  referralCode?: string;
  isAdmin?: boolean;
};

export type UpdateAdminProfileParams = {
  userId: string;
  userDataToUpdate: {
    phone: string;
    gender: "male" | "female" | "other";
    designation: string;
    expertise: string[];
    yearsOfExperience: number;
    country: string;
  };
};

export type UpdatePlanParams = {
  userId: string;
  plan: "free" | "premium" | "pro";
  subscriptionCoveredByCredit: boolean;
  subscriptionCancelled: boolean;
  customerId?: string;
  currency?: string; // Optional
  // subscriptionEndDate: string; // Optional
};

export type VerifyUserParams = {
  userId: string;
  schoolName: string;
  proofDocument: FormData | undefined;
};

export interface AssessmentCard {
  _id: string;
  totalMarks: number;
  status: string; // draft | submitted | hod_approved | etc
  duration?: number;
  gracePeriod?: number;
  endUtc?: string; // optional, computed end time
  startUtc?: string; // optional, computed start time
  timers?: {
    countdown?: string;
    status?: string;
  };
  questionSet?: {
    _id: string;
    status: "draft" | "submitted" | "approved" | "rejected";
    feedback?: string;
    content?: {
      type?: "objective" | "theory" | "hybrid";
      sections?: {
        title?: string;
        sectionType?: "objective" | "theory" | "hybrid"; // reflect your DB
        questions?: {
          questionText?: string; // match your DB
          marks?: number;
          options?: string[]; // optional for objective questions
          correctAnswer?: string;
        }[];
      }[];
    };
  };
  deptAssessment: {
    _id: string;
    proposedStart?: string; // from DeptAssessmentConfig
    proposedEnd?: string; // from DeptAssessmentConfig
    assessmentSetup: {
      title: string;
      type: "assignment" | "quiz" | "test" | "exam" | "project";
      assessmentDate: string; // ISO string date
      startTime: string; // e.g., "09:00"
      session?: string;
      semester?: { name: string };
      duration: number; // minutes
    };
  };
  course: {
    _id: string;
    title: string;
    description: string;
    code: string;
    level?: { name: string };
    department?: { name: string };
    program?: { type: string };
  };
}

export interface EnrichedCourseDTO {
  _id: string;
  courseId?: string;
  title: string;
  code: string;
  courseType: string;
  creditUnits: string | number;
  description?: string;
  thumbnail?: string;
  schoolId: string;
  school?: string;
  department?: { _id: string; name: string };
  departmentId?: string;
  level?: {
    _id: string;
    name: string;
    program?: {
      _id: string;
      type: string;
      department?: { _id: string; name: string };
    };
  };
  levelId?: string;
  program?: { _id: string; type: string };
  programType?: string;
  studyMode?: { _id: string; name: string }[];
  session: string;
  semester?: { _id: string; name: string };
  semesterId?: string;
  createdAt: Date;
  startDate?: string | Date;
  endDate?: string | Date;

  // 🔹 Enriched fields
  studentCount: number;
  // studyModeName: string[] | [];
  instructors: {
    instructorId: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
}

export type CreateCourseParams = {
  userId: string;
  title: string;
  code: string;
  description: string;
  startDate: Date;
  endDate: Date;
  thumbnail: FormData | undefined;
  creatorId: string;
  level: string;
  department: string;
  semester: string;
  session: string;
  instructors: string[];
  studyMode: string[];
  creditUnits: number;
  courseType: "core" | "elective";
};

export type UpdateCourseParams = {
  courseId: string;
  title: string;
  code: string;
  description: string;
  startDate: Date;
  endDate: Date;
  thumbnail: FormData | undefined;
  level: string;
  department: string;
  semester: string;
  session: string;
  instructors: string[];
  studyMode: string[];
  creditUnits: number;
  courseType: "core" | "elective";
};

export type SubscriptionData = {
  subscription_id: string;
  amount: number;
  status: string;
  start_date?: Date;
  email: string;
  payment_method: string;
  authorization_code: string;
  transaction_reference: string;
  authorization: any; // You can further type this
  currency: Currency;
};

export type UpdateUserParams = {
  userId: string | null;
  userDataToUpdate: Partial<IUser>;
  requireFields: boolean;
  path: string;
  routeUserType?: string;
};

export interface SearchParams {
  query?: string | null;
  type?: string | null;
}

export type CreateProjectParams = {
  topicOne: string;
  topicTwo: string;
  topicThree: string;
  topicFour: string;
  projectCreator: string;
  supervisorId: string;
  organizationId: Types.ObjectId;
  status: string;
  path: string;
  groupId?: string;
  accountMode?: "independent" | "institutional";
  schoolId?: string; // optional for independent
  departmentName?: string; // optional for independent
  session?: string; // optional for independent
  activeProjectId?: string;
};

export type GetProjectParams = {
  page?: number;
  pageSize?: number;
  userEmail: string;
  searchQuery?: string;
};

export type CreateAssignmentParams = {
  title: string;
  description: string;
  dueDate: Date;
  instructorId: string;
  courseId: string;
};
export type UpdateAssignmentParams = {
  title: string;
  description: string;
  dueDate: Date;
  instructorId: string;
  courseId: string;
  assignmentId: string;
  path: string;
};

export type SearchParamProps = {
  params?: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
export interface SearchSupervisorProps {
  supervisor: string;
  setSupervisor: (supervisor: string) => void;
  supervisors: IUser[];
}

export type CreateOrgProps = {
  clerkOrgId: string;
  name: string;
  slug: string;
  createdBy: string | undefined;
};

export type UpdateOrgProps = {
  clerkOrgId: string;
  name: string;
  slug: string;
};

export type MembershipData = {
  email: string;
  clerkOrgId: string;
};

// ====== LEVEL PARAMS
export type CreateLevelParams = {
  levelName: string;
  schoolId?: string;
};

export interface CreateProgramParams {
  programName: string;
  schoolId?: string;
}

export interface CreateStudyModeParams {
  studyModeName: string;
  schoolId?: string;
}

export type CreateLevelParams = {
  level: string;
};

export type CreateStudyLevelParams = {
  studyLevelName: string;
};

export type CreateDepartmentParams = {
  departmentName: string;
  schoolId?: string;
};

export type CreateSchoolParams = {
  schoolName: string;
};

export type CreateDesignationParams = {
  designationName: string;
  schoolId: string;
};

export type CreateExpertiseParams = {
  expertiseName: string;
  schoolId: string;
};

declare type UpdateProjectParams = {
  projectId: string | undefined;
  status: Status;
  approvalReason: string | undefined;
  rejectionReason: string | undefined;
  submissionDeadline: Date | null | undefined;
  activeStatus: string | undefined;
};

declare type HeaderProps = {
  children: React.ReactNode;
  className?: string;
};

declare type CreateDocumentParams = {
  userId: string;
  email: string;
  // projectId: string;
};

declare type AddDocumentBtnProps = {
  userId: string;
  email: string;
  // projectId: string;
};

declare type UserTypeSelectorParams = {
  userType: string;
  setUserType: React.Dispatch<React.SetStateAction<UserType>>;
  onClickHandler?: (value: string) => void;
};

declare type AccessType = ["room:write"] | ["room:read", "room:presence:write"];

declare type RoomAccesses = Record<string, AccessType>;

declare type DeleteModalProps = { roomId: string; projectId?: string };

declare type MongoUserType = "student" | "supervisor";

declare type User = {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar: string;
  color: string;
  mongoUserType?: MongoUserType;
  userType?: UserType;
};

declare type CollaboratorProps = {
  roomId: string;
  email: string;
  creatorId: string;
  collaborator: User;
  user: User;
};

declare type CollaborativeRoomProps = {
  userEmail: string;
  roomId: string;
  roomMetadata: RoomMetadata;
  users: User[];
  currentUserType: UserType;
};

declare type ThreadWrapperProps = { thread: ThreadData<BaseMetadata> };

declare type ShareDocumentDialogProps = {
  roomId: string;
  collaborators: User[];
  creatorId: string;
  currentUserType: UserType;
};

declare type ShareDocumentParams = {
  roomId: string;
  email: string;
  userType: UserType;
  updatedBy: User;
};

export type ColorPickerProps = {
  color: string;
  onChange: (color) => void;
  icon: string;
  disabled: boolean;
};

export type TableModalProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean | ((prevVar: boolean) => boolean)) => void;
  children: React.ReactNode;
  addTable: () => void;
  rows: number | undefined;
  columns: number | undefined;
};

export type CodeBlockPluginProps = {
  blockType: string;
  selectedElementKey: string;
  codeLanguage: string;
  disabled: boolean;
};

export type ImageModalProps = {
  title: string;
  setIsOpen: (value: boolean | ((prevVar: boolean) => boolean)) => void;
  isOpen: boolean;
  children: React.ReactNode;
  url: string;
  file?: File;
  addImage: () => void;
};

export type YoutubeModalProps = {
  title: string;
  setIsOpen: (value: boolean | ((prevVar: boolean) => boolean)) => void;
  isOpen: boolean;
  children: React.ReactNode;
  url: string;
  addYoutubeVideo: () => void;
};

export type room = {
  id: string;
  metadata: Record<string, any>;
  usersAccesses: RoomAccesses;
  [key: string]: any;
};

export type NOTIFICATIONDATAPROPS = {
  title: string;
  type: string;
  message: string;
  projectId: string;
  userId: string;
  actionLink: string;
};

export type PAYMENTNOTIFICATIONPROPS = {
  title: string;
  type: string;
  message: string;
  userId: string;
  actionLink: string;
};

declare type ThreadWrapperProps = { thread: ThreadData<BaseMetadata> };
