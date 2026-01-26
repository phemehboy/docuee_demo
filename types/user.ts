import { ISchool } from "@/lib/database/models/school.model";
import { IUser, UserType } from "@/lib/database/models/user.model";

// types/user.ts
export interface IUUser {
  _id: string;
  clerkId: string;
  email: string;
  subscriptionType?: "free" | "premium" | "pro";
}

export interface SelectOption {
  _id: string;
  name: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
  userType: "student" | "instructor" | "supervisor" | "schoolAdmin";
  school: string;
  level?: string | string[];
  department?: string | string[] | SelectOption | SelectOption[];
  program?: string | string[];
  studyMode?: string | string[];
  designation?: string;
  isHOD?: boolean;
  isAssigned?: boolean;
  hodDepartment?: { _id: string; name: string };
}

export interface UserMap {
  [key: string]: {
    userId: string;
    clerkId: string;
    name: string;
    email: string;
    picture: string;
    department: string[];
    level: string[];
    program: string[];
    studyMode: string[];
  };
}

export interface ServerUser {
  id: string;
  emailAddresses: {
    id: string;
    emailAddress: string;
    verification: {
      status: "verified" | "unverified";
      verifiedAt: string | null;
    } | null; // <-- allow null
  }[];
}

export type EarningsPreference = "credits" | "cash";

export interface IUserClient {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: UserType;
  country?: string;
  subscriptionType?: string;

  creditBalance?: number;
  withdrawableEarnings?: number;

  useCreditsAutomatically?: boolean;
  rewardPreference?: EarningsPreference;

  payoutAccount: {
    bankName: string;
    bankCode?: string; // required for NG (Paystack), optional for others
    accountNumber: string;
    accountName: string;
    country: string;
    currency: "NGN" | "USD";
    verified: boolean;
  };

  level: { name: string; program: { type: string } }[];
  department: { _id: string; name: string }[];
  expertise: string[];
  designation: { name: string };
  program: {
    type: string;

    department: { name: string };
  }[];

  lastLoginAt?: Date;
  joinedAt?: Date;
  suspendedBySchool: boolean;
  picture: string;
  phone: string;
  school: {
    _id: string;
    name: string;
  };
  isHOD?: boolean;
  hodDepartment?: { _id: string; name: string };

  supervisor?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  isActiveToday?: boolean;
  isActiveLast7Days?: boolean;
}

export interface IStudentTableRow {
  _id: string; // MongoDB _id
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  picture?: string;
  phone?: string;
  joinedAt?: string | Date;
  lastLoginAt?: string | Date;
  suspendedBySchool?: boolean;

  program?: {
    _id: string;
    type: string;
    department: {
      _id: string;
      name: string;
    };
  }; // program has nested department
  department?: { _id: string; name: string };
  level?: { _id: string; name: string; rank: number; canGraduate?: boolean };
  studyMode?: { _id: string; name: string };

  status?: "active" | "graduated";
  admissionNumber?: string;
  cohortSerial?: number;

  supervisor?: IUser; // populated userId.supervisor
  school?: ISchool;

  // ✅ Add this new field
  group?: {
    _id: string;
    name: string;
  } | null;

  isActiveToday?: boolean;
  isActiveLast7Days?: boolean;
  approved?: boolean;
  grades?: string;
  passRate?: string;
  recommendedAction: any;
  schoolId?: string;
}

export interface ConvexUser {
  convexUserId: string; // Convex document _id
  _id: string; // mongodb document _id
  clerkId: string; // Clerk authentication ID
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  picture: string; // User picture / avatar
  organizationId: string;
  isAdmin: boolean;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}
