import { IGroup } from "@/lib/database/models/group.model";
import {
  IndependentStatus,
  ProjectType,
} from "@/lib/database/models/project.model";
import { IStudent } from "@/lib/database/models/student.model";
import { IUser } from "@/lib/database/models/user.model";

export type IndependentProjectDashboardProps = {
  projects?: ProjectDTO[];
  student: IStudent;
  project: ProjectDTO | null;
  setProject: React.Dispatch<React.SetStateAction<ProjectDTO | null>>;

  studentUser: IUser | null;

  accountMode: "independent";

  open: boolean;
  setOpen: (v: boolean) => void;

  redirectUrl: string;
  callbackUrl: string;

  isFreeUserWithoutCredits: boolean;
  isButtonDisabled: boolean;
  isProjectButtonDisabled: boolean;

  relevantDeadline: any;
  handleFinePayment: () => void;

  getApprovedProjectTitle: () => string;

  // userCredit: number;
};

export type IndependentProjectWorkspaceProps = {
  // projects?: ProjectDTO[];
  project: ProjectDTO | null;

  student: IStudent;

  studentUser: IUser | null;

  accountMode: "independent";

  callbackUrl: string;

  isFreeUserWithoutCredits: boolean;
  isProjectButtonDisabled: boolean;

  relevantDeadline: any;
  handleFinePayment: () => void;

  getApprovedProjectTitle: () => string;

  disableChat?: boolean;

  open: boolean;
  setOpen: (v: boolean) => void;
  redirectUrl: string;
  isButtonDisabled: boolean;
  onSuccess: (project: ProjectDTO) => void;
  activeProjectId?: string;

  // userCredit: number;
};

export enum Status {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface Topic {
  topic: string;
  status: Status;
  rejectionReason?: string;
}

export interface ProjectTopics {
  topicOne: Topic;
  topicTwo: Topic;
  topicThree: Topic;
  topicFour: Topic;
}

export type OverallStatus =
  | "pending"
  | "approved"
  | "in-progress"
  | "completed"
  | "rejected";

export interface FineDTO {
  amount: number;
  isPaid: boolean;
  applied: boolean;
  reason?: string;
  paymentReference?: string;
  paidAt?: string; // 👈 string instead of Date (DTOs should be serializable)
  currency: "NGN" | "USD";
  paymentService: "paystack" | "flutterwave";
}

export interface SubmissionStageDTO {
  content: string;
  submitted: boolean;
  submittedAt?: string;
  editableByStudent: boolean;
  completed: boolean;
  approvedAt?: string;
  deadline?: string;
  fine?: FineDTO;
  grade?: {
    score?: number;
    comment?: string;
    gradedAt?: string;
  };
}

export interface ProjectDTO {
  _id: string;
  supervisorId: string;
  departmentName: string;
  projectTopics: ProjectTopics;
  rejectionReason?: string;
  approvalReason?: string;
  submissionStages: Record<string, SubmissionStageDTO>;
  approvalDate?: string;
  overallStatus: OverallStatus;
  independentStatus?: IndependentStatus;

  // Can be string (just ID) OR populated student with userId
  projectCreator: IStudent;
  projectType: ProjectType;

  organizationId: string;
  schoolId: string;
  session: string;
  convexProjectId?: string;
  groupId?: IGroup;
  createdAt: string;
  updatedAt: string;
}

export interface Fine {
  amount: number;
  applied: boolean;
  isPaid: boolean;
  paymentReference?: string;
  paidAt?: Date;
  currency: "NGN" | "USD";
  paymentService: "paystack" | "flutterwave";
}

export interface SubmissionStageData {
  content: string;
  submitted: boolean;
  submittedAt?: Date;
  editableByStudent: boolean;
  completed: boolean;
  approvedAt?: Date;
  deadline?: Date;
  fine?: Fine;
  grade?: {
    score?: number;
    comment?: string;
    gradedAt?: Date;
  };
}

export interface SubmissionStages {
  [key: string]: SubmissionStageData;
}

// export interface SubmissionStages {
//   proposal: SubmissionStageData;
//   chapter1: SubmissionStageData;
//   chapter2: SubmissionStageData;
//   chapter3: SubmissionStageData;
//   finalsubmission: SubmissionStageData;
//   [key: string]: SubmissionStageData;
// }

export interface DeadlineCardProps {
  submissionStages: SubmissionStages;
  onFinePayment: () => void;
  project: any;
  overallStatus: OverallStatus;
  isFreeUserWithoutCredits: boolean;
  initialUserId: string;
  callbackUrl: string;
  userCredit: number;
}
