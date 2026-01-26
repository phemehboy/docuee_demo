"use server";

import "@/lib/database/registerModels";

import {
  CreateUserParams,
  UpdateAdminProfileParams,
  UpdatePlanParams,
  UpdateUserParams,
} from "@/types";
import { connectToDatabase } from "../database";
import User, { IUser } from "../database/models/user.model";
import School, { ISchool } from "../database/models/school.model";
import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Project from "../database/models/project.model";
import { nanoid } from "nanoid";

import console from "console";
import Student from "../database/models/student.model";
import mongoose from "mongoose";
import { Types } from "mongoose";
import Department from "../database/models/department.model";
import { sendDocueeEmail } from "../email/sendDocueeEmail";

import "@/lib/database/models/group.model";
import { getConvexClient } from "../convex/convexClient";
import StudyMode from "../database/models/studyMode.model";
import { createUserOrganization } from "./organization.action";
import { getDashboardPath, handleError } from "../utils";
import Instructor from "../database/models/instructor.model";
import Level from "../database/models/level.model";
import Organization, {
  MemberEntry,
} from "../database/models/organization.model";

const convexClient = getConvexClient();

const clerk = await clerkClient();

interface UpdateUserResult {
  error?: string;
  data?: any; // or `User` type if you have it typed
}

export async function updateUserById(userId: string, data: any) {
  try {
    await connectToDatabase();

    // ✅ Allowed fields only
    const allowed = [
      "username",
      "email",
      "phone",
      "country",
      "gender",
      "expertise",
      "yearsOfExperience",
      "timeZone",
    ];
    const updates: Record<string, any> = {};

    for (const key of allowed) {
      if (data[key] !== undefined) {
        updates[key] = data[key];
      }
    }

    // 🔹 Update in your MongoDB using the Mongo _id
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true },
    )
      .populate("school") // populate school reference
      .populate("program") // populate program reference (if it’s a ref)
      .populate("department") // populate department(s)
      .populate("hodDepartment") // populate department(s)
      .populate("level") // populate level(s)
      .populate("studyMode") // populate studyMode(s)
      .populate("designation") // designation
      .populate("expertise") // designation
      .lean<IUser>();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // 🔹 Update in Clerk (must use Clerk's userId)
    if (updatedUser.clerkId) {
      const clerkUpdate: any = {};
      if (updates.username) clerkUpdate.username = updates.username;
      if (updates.email) clerkUpdate.emailAddress = updates.email;

      if (Object.keys(clerkUpdate).length > 0) {
        await clerk.users.updateUser(
          updatedUser.clerkId, // ✅ Clerk userId, not Mongo _id
          clerkUpdate,
        );
      }
    } else {
      console.warn(`⚠️ No clerkUserId found for Mongo user ${userId}`);
    }

    let schoolId: string | undefined;

    if (updatedUser.school) {
      // If populated (an object with name/_id)
      if (
        typeof updatedUser.school === "object" &&
        "_id" in updatedUser.school
      ) {
        schoolId = (updatedUser.school as ISchool)._id.toString();
      } else {
        // If just an ObjectId
        schoolId = updatedUser.school.toString();
      }
    }

    // 🔹 Update in Convex
    if (updatedUser.clerkId) {
      await convexClient.mutation(api.users.updateConvexUserFromMongo, {
        clerkId: updatedUser.clerkId,
        timeZone: updatedUser.timeZone,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        school: schoolId,
        expertise: updatedUser.expertise,
        yearsOfExperience: updatedUser.yearsOfExperience,
        country: updatedUser.country,
      });
    }

    // ✅ Revalidate
    revalidatePath(
      `/user/${updatedUser._id}/usertype/${updatedUser.userType}/dashboard/profile`,
    );

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error: any) {
    console.error("❌ updateUserById error:", error);
    throw new Error(error.message || "Failed to update user");
  }
}

export async function updateUserPlanAndSubscription({
  userId,
  plan,
  subscriptionCoveredByCredit,
  subscriptionCancelled,
  customerId,
  currency,
  // subscriptionEndDate
}: UpdatePlanParams) {
  try {
    // 1. Update Mongo user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          subscriptionType: plan,
          subscriptionCoveredByCredit,
          subscriptionCancelled,
          customerId,
          currency,
          // subscriptionEndDate,
        },
      },
      { new: true },
    );

    if (!user) {
      throw new Error("User not found");
    }

    // 2. Update in Convex (user + linked project)
    await convexClient.mutation(api.users.updateUserSubscriptionType, {
      clerkId: user.clerkId, // ⚠️ ensure you store this in Mongo user or student/project doc
      subscriptionType: plan,
      subscriptionCoveredByCredit,
    });

    console.log(`✅ User ${user._id} upgraded to ${plan}`);
    return user;
  } catch (err) {
    console.error("❌ Failed to update user subscription plan:", err);
    throw err;
  }
}

export async function rewardReferrer(
  referrerId: string,
  referredUserId: string,
) {
  try {
    const referrer = await User.findById(referrerId);
    if (!referrer) {
      console.warn("⚠️ Referrer not found:", referrerId);
      return null; // important to return null if not found
    }

    const rewardAmount = 1000; // Adjust as needed

    if (referrer.rewardPreference === "cash") {
      referrer.withdrawableEarnings += rewardAmount;
    } else {
      referrer.creditBalance += rewardAmount;
    }

    referrer.creditTransactions.push({
      type: "referral",
      amount: rewardAmount,
      description: `Reward for referring user ${referredUserId}`,
    });

    referrer.paidReferredUsers.push(referredUserId);
    await referrer.save();

    console.log("🎉 Referrer rewarded successfully");

    return referrer; // ✅ Return for email logic
  } catch (err) {
    console.error("❌ Failed to reward referrer:", err);
    throw err;
  }
}

export async function getStudentsForSupervisor(supervisorId: string) {
  try {
    await connectToDatabase();

    const students = await Student.find({
      supervisor: supervisorId,
      userId: { $exists: true },
    })
      .populate({
        path: "userId",
        select:
          "_id firstName lastName email picture phone joinedAt lastLoginAt suspendedBySchool supervisor status",
        populate: {
          path: "supervisor",
          select: "firstName lastName email",
          model: "User",
        },
      })
      .populate({
        path: "program",
        select: "type department",
        populate: {
          path: "department",
          select: "name",
        },
      })
      .populate("supervisor", "firstName lastName")
      .populate("department", "name")
      .populate("level", "name")
      .populate("studyMode", "name")
      .populate("school", "_id")
      .populate("group", "name")
      .select(
        "_id admissionNumber cohortSerial program department level studyMode school userId status",
      );

    // Transform and sort properly
    const studentData = students
      .map((s) => {
        const lastLoginAt = s.userId?.lastLoginAt
          ? new Date(s.userId.lastLoginAt)
          : null;

        const activeToday =
          lastLoginAt &&
          lastLoginAt >= new Date(new Date().setHours(0, 0, 0, 0));

        const activeLast7Days =
          lastLoginAt &&
          lastLoginAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        return {
          _id: s._id,
          firstName: s.userId?.firstName,
          lastName: s.userId?.lastName,
          email: s.userId?.email,
          picture: s.userId?.picture,
          phone: s.userId?.phone,
          joinedAt: s.userId?.joinedAt,
          lastLoginAt: s.userId?.lastLoginAt,
          suspendedBySchool: s.userId?.suspendedBySchool,
          status: s.userId?.status,
          admissionNumber: s.admissionNumber,
          cohortSerial: s.cohortSerial,
          program: s.program,
          department: s.department,
          level: s.level,
          studyMode: s.studyMode,
          supervisor: s.supervisor,
          school: s.school,
          group: s.group,
          isActiveToday: !!activeToday,
          isActiveLast7Days: !!activeLast7Days,
        };
      })
      .sort((a, b) => {
        // Sort by department name first
        const depA = a.department?.name || "";
        const depB = b.department?.name || "";
        if (depA < depB) return -1;
        if (depA > depB) return 1;

        // If same department, sort by cohortSerial
        return (a.cohortSerial || 0) - (b.cohortSerial || 0);
      });

    return {
      data: JSON.parse(JSON.stringify(studentData)),
      error: null,
    };
  } catch (error) {
    console.error("Failed to get students for supervisor:", error);
    return {
      data: [],
      error: "Failed to retrieve students for supervisor.",
    };
  }
}

export async function getStudentsForInstructor(instructorUser: IUser) {
  try {
    await connectToDatabase();

    // Get instructor data (with arrays)
    const instructor = await Instructor.findOne({
      userId: instructorUser._id,
    }).populate("schoolId department level program studyMode");

    if (!instructor) {
      return {
        data: [],
        error: "Instructor record not found.",
      };
    }

    // Build filter
    const filter: any = {
      school: instructor.schoolId,
      department: { $in: instructor.department || [] },
      level: { $in: instructor.level || [] },
      program: { $in: instructor.program || [] },
      studyMode: { $in: instructor.studyMode || [] },
    };

    // Optional: Add session/semester if available
    const school = instructor.schoolId as any;
    if (school?.currentSession) filter.session = school.currentSession;
    if (school?.currentSemester) filter.semester = school.currentSemester;

    // Query matching students
    const students = await Student.find(filter)
      .populate({
        path: "userId",
        select:
          "_id firstName lastName email picture phone joinedAt lastLoginAt suspendedBySchool supervisor status",
        populate: {
          path: "supervisor",
          select: "firstName lastName email",
          model: "User",
        },
      })
      .populate({
        path: "program",
        select: "type department",
        populate: {
          path: "department",
          select: "name",
        },
      })
      .populate("department", "name")
      .populate("level", "name canGraduate")
      .populate("studyMode", "name")
      .populate("school", "_id")
      .populate("group", "name")
      .select(
        "_id admissionNumber cohortSerial program department level studyMode school userId status",
      );

    // Transform + sort
    const studentData = students
      .map((s) => {
        const lastLoginAt = s.userId?.lastLoginAt
          ? new Date(s.userId.lastLoginAt)
          : null;

        const activeToday =
          lastLoginAt &&
          lastLoginAt >= new Date(new Date().setHours(0, 0, 0, 0));

        const activeLast7Days =
          lastLoginAt &&
          lastLoginAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        return {
          _id: s._id,
          userId: s.userId?._id,
          firstName: s.userId?.firstName,
          lastName: s.userId?.lastName,
          email: s.userId?.email,
          picture: s.userId?.picture,
          phone: s.userId?.phone,
          joinedAt: s.userId?.joinedAt,
          lastLoginAt: s.userId?.lastLoginAt,
          suspendedBySchool: s.userId?.suspendedBySchool,
          status: s.status,
          admissionNumber: s.admissionNumber,
          cohortSerial: s.cohortSerial,
          program: s.program,
          department: s.department,
          level: s.level,
          studyMode: s.studyMode,
          supervisor: s.userId?.supervisor,
          school: s.school,
          group: s.group,
          isActiveToday: !!activeToday,
          isActiveLast7Days: !!activeLast7Days,
        };
      })
      .sort((a, b) => {
        const depA = a.department?.name || "";
        const depB = b.department?.name || "";
        if (depA < depB) return -1;
        if (depA > depB) return 1;
        return (a.cohortSerial || 0) - (b.cohortSerial || 0);
      });

    return {
      data: JSON.parse(JSON.stringify(studentData)),
      error: null,
    };
  } catch (error) {
    console.error("Failed to get students for instructor:", error);
    return {
      data: [],
      error: "Failed to retrieve students for instructor.",
    };
  }
}

export async function getStudentsByUserId(supervisorId: string) {
  try {
    await connectToDatabase();

    const students = await Student.find({
      supervisor: supervisorId,
    });

    return JSON.parse(JSON.stringify(students));
  } catch (error) {
    console.error("Error fetching students by supervisor:", error);
    return [];
  }
}

function serialize(doc: any) {
  return JSON.parse(
    JSON.stringify(doc, (key, value) => {
      if (value instanceof Date) return value.toISOString();
      if (value?._bsontype === "ObjectID") return value.toString();
      return value;
    }),
  );
}

export async function getInstructorsForSchool(
  schoolId: string,
  departmentId?: string,
) {
  try {
    await connectToDatabase();

    if (!Types.ObjectId.isValid(schoolId)) {
      throw new Error("Invalid school ID.");
    }

    const instructors = await Instructor.find({ schoolId })
      .populate({
        path: "userId",
        populate: [{ path: "department" }, { path: "level" }],
      })
      .lean();

    // 🔁 Filter by department if departmentId is provided
    const filteredInstructors = departmentId
      ? instructors.filter(
          (instructor: any) =>
            Array.isArray(instructor.userId?.department) &&
            instructor.userId.department.some(
              (dep: any) => dep?._id?.toString() === departmentId,
            ),
        )
      : instructors;

    const departments = await Department.find({ school: schoolId }).lean();
    const studyModes = await StudyMode.find({ school: schoolId }).lean();
    const levels = await Level.find({ school: schoolId })
      .populate({
        path: "program",
        select: "type department", // populate program's type and department reference
        populate: {
          path: "department",
          select: "name", // only select the department's name
        },
      })
      .lean();

    return {
      instructors: JSON.parse(JSON.stringify(filteredInstructors)),
      departments: JSON.parse(JSON.stringify(departments)),
      studyModes: JSON.parse(JSON.stringify(studyModes)),
      levels: JSON.parse(JSON.stringify(levels)),
    };
  } catch (error) {
    console.error("Failed to fetch instructors for school:", error);
    return { instructors: [], departments: [], levels: [] };
  }
}

export async function hasCompletedAdminProfile(
  adminId: string,
): Promise<boolean> {
  await connectToDatabase();

  const userDoc = await User.findOne({ _id: adminId });

  // ✅ Convert to plain JS object to avoid serialization issues
  const user = userDoc ? JSON.parse(JSON.stringify(userDoc)) : null;

  // ✅ Now safe to check fields
  return !!(
    user?.country &&
    user?.phone &&
    user?.gender &&
    user?.designation &&
    user?.expertise
  );
}

export async function getUsersBySchoolId(schoolId: string) {
  try {
    const students = await User.find({
      school: schoolId,
      userType: "student",
    })
      .populate("program", "type")
      .populate("level", "name")
      .populate("supervisor", "firstName lastName")
      .select(
        "_id firstName lastName email phone suspendedBySchool joinedAt program level supervisor lastLoginAt",
      );

    return JSON.parse(JSON.stringify(students));
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return [];
  }
}

export async function getStudentsByAdminId(adminId: string) {
  try {
    await connectToDatabase();

    // Find the admin/HOD user
    const adminUser = await User.findById(adminId);

    if (!adminUser) {
      console.warn("Admin/HOD not found:", adminId);
      return { school: null, students: [] };
    }

    // Find the school
    const school = await School.findOne({ _id: adminUser.school });
    if (!school) {
      console.warn("No school found for admin:", adminId);
      return { school: null, students: [] };
    }

    // Determine student filter
    let studentFilter: any = { school: school._id };

    if (adminUser.isHOD && adminUser.hodDepartment) {
      // HOD: only fetch students in their department
      studentFilter.department = adminUser.hodDepartment;
    }

    // Fetch students
    const students = await Student.find(studentFilter)
      .populate({
        path: "userId",
        select:
          "_id firstName lastName email picture phone joinedAt lastLoginAt suspendedBySchool supervisor",
        populate: {
          path: "supervisor",
          select: "firstName lastName email",
          model: "User",
        },
      })
      .populate("school", "_id")
      .populate({
        path: "program",
        select: "type department",
        populate: { path: "department", select: "name" },
      })
      .populate("department", "name")
      .populate("level", "name rank canGraduate")
      .populate("studyMode", "name")
      .populate("group", "name")
      .select(
        "_id userId school program department level studyMode group status admissionNumber cohortSerial",
      );

    // Transform for frontend
    const studentData = students.map((s) => {
      const lastLoginAt = s.userId?.lastLoginAt
        ? new Date(s.userId.lastLoginAt)
        : null;

      return {
        _id: s._id,
        userId: s.userId?._id,
        firstName: s.userId?.firstName,
        lastName: s.userId?.lastName,
        email: s.userId?.email,
        picture: s.userId?.picture,
        phone: s.userId?.phone,
        joinedAt: s.userId?.joinedAt,
        lastLoginAt: s.userId?.lastLoginAt,
        suspendedBySchool: s.userId?.suspendedBySchool,
        program: s.program,
        department: s.department,
        level: s.level,
        studyMode: s.studyMode,
        group: s.group,
        status: s.status,
        admissionNumber: s.admissionNumber,
        cohortSerial: s.cohortSerial,
        supervisor: s.userId?.supervisor,
        school: s.school,
        isActiveToday:
          lastLoginAt &&
          lastLoginAt >= new Date(new Date().setHours(0, 0, 0, 0)),
        isActiveLast7Days:
          lastLoginAt &&
          lastLoginAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        approved: s.approved,
      };
    });

    // ✅ Sort by cohortSerial ascending
    studentData.sort((a, b) => {
      if (a.cohortSerial == null) return 1;
      if (b.cohortSerial == null) return -1;
      return a.cohortSerial - b.cohortSerial;
    });

    return {
      school: JSON.parse(JSON.stringify(school)),
      students: JSON.parse(JSON.stringify(studentData)),
    };
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return { school: null, students: [] };
  }
}

export async function getInstructorsByAdminId(adminId: string) {
  try {
    await connectToDatabase();

    // Find the admin/HOD user
    const adminUser = await User.findById(adminId);

    if (!adminUser) {
      console.warn("Admin/HOD not found:", adminId);
      return { school: null, instructors: [] };
    }

    // Find the school
    const school = await School.findOne({ _id: adminUser.school });
    if (!school) {
      console.warn("No school found for admin:", adminId);
      return { school: null, instructors: [] };
    }

    // Build query for instructors
    let instructorFilter: any = { schoolId: school._id };

    if (adminUser.isHOD && adminUser.hodDepartment) {
      // HOD: only instructors in their department
      instructorFilter.department = adminUser.hodDepartment;
    }

    const instructors = await Instructor.find(instructorFilter)
      .populate({
        path: "userId",
        select:
          "_id firstName lastName email picture phone hodDepartment joinedAt lastLoginAt suspendedBySchool isHOD supervisor",
        populate: {
          path: "hodDepartment",
          select: "name",
        },
      })
      .populate("department", "name")
      .populate("designation", "name")
      .populate("expertise", "name")
      .populate({
        path: "level",
        select: "name program",
        populate: {
          path: "program",
          select: "type department",
          populate: { path: "department", select: "name" },
        },
      })
      .populate({
        path: "program",
        select: "type department",
        populate: { path: "department", select: "name" },
      })
      .populate("studyMode", "name")
      .populate("schoolId", "_id name");

    // Transform for frontend
    const instructorData = instructors.map((inst) => {
      const lastLoginAt = inst.userId?.lastLoginAt
        ? new Date(inst.userId.lastLoginAt)
        : null;

      const activeToday =
        lastLoginAt && lastLoginAt >= new Date(new Date().setHours(0, 0, 0, 0));
      const activeLast7Days =
        lastLoginAt &&
        lastLoginAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      return {
        _id: inst._id,
        userId: inst.userId?._id,
        firstName: inst.userId?.firstName,
        lastName: inst.userId?.lastName,
        email: inst.userId?.email,
        picture: inst.userId?.picture,
        phone: inst.userId?.phone,
        hodDepartment: inst.userId?.hodDepartment,
        joinedAt: inst.userId?.joinedAt,
        lastLoginAt: inst.userId?.lastLoginAt,
        suspendedBySchool: inst.userId?.suspendedBySchool,
        isHOD: inst.userId?.isHOD,
        supervisor: inst.userId?.supervisor,
        department: inst.department,
        designation: inst.designation,
        expertise: inst.expertise,
        level: inst.level,
        program: inst.program,
        studyMode: inst.studyMode,
        school: inst.schoolId,
        isActiveToday: !!activeToday,
        isActiveLast7Days: !!activeLast7Days,
      };
    });

    return {
      school: JSON.parse(JSON.stringify(school)),
      instructors: JSON.parse(JSON.stringify(instructorData)),
    };
  } catch (error) {
    console.error("Failed to fetch instructors:", error);
    return { school: null, instructors: [] };
  }
}

export async function getSupervisorsByAdminId(adminId: string) {
  try {
    await connectToDatabase();

    const adminUser = await User.findById(adminId);

    if (!adminUser) {
      console.warn("Admin/HOD not found:", adminId);
      return { school: null, supervisors: [] };
    }

    const school = await School.findOne({ _id: adminUser.school });

    if (!school) {
      console.warn("No school found for admin:", adminId);
      return { school: null, supervisors: [] };
    }

    // Base query for supervisors
    let supervisorFilter: any = { school: school._id, userType: "supervisor" };

    if (adminUser.isHOD && adminUser.hodDepartment) {
      supervisorFilter.department = adminUser.hodDepartment;
    }

    const supervisors = await User.find(supervisorFilter)
      .populate("department", "name")
      .populate("designation", "name")
      .populate("expertise", "name")
      .populate("level", "name")
      .populate({
        path: "program",
        select: "type department",
        populate: { path: "department", select: "name" },
      })
      .populate("school", "_id name")
      .populate("supervisor", "_id firstName lastName email")
      .populate("hodDepartment", "_id name")
      .select(
        "_id firstName lastName email picture phone joinedAt program level supervisor lastLoginAt suspendedBySchool isHOD hodDepartment userType",
      );

    // Transform for frontend
    const supervisorData = supervisors.map((sup) => {
      const lastLoginAt = sup.lastLoginAt ? new Date(sup.lastLoginAt) : null;

      return {
        _id: sup._id.toString(),
        firstName: sup.firstName,
        lastName: sup.lastName,
        email: sup.email,
        picture: sup.picture,
        phone: sup.phone,
        joinedAt: sup.joinedAt,
        lastLoginAt: sup.lastLoginAt,
        suspendedBySchool: sup.suspendedBySchool,
        isHOD: sup.isHOD,
        hodDepartment: sup.hodDepartment,
        supervisor: sup.supervisor,
        department: sup.department,
        designation: sup.designation,
        expertise: sup.expertise,
        level: sup.level,
        program: sup.program,
        school: sup.school,
        userType: sup.userType,
        isActiveToday:
          lastLoginAt &&
          lastLoginAt >= new Date(new Date().setHours(0, 0, 0, 0)),
        isActiveLast7Days:
          lastLoginAt &&
          lastLoginAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      };
    });

    return {
      school: JSON.parse(JSON.stringify(school)),
      supervisors: JSON.parse(JSON.stringify(supervisorData)),
    };
  } catch (error) {
    console.error("Failed to fetch supervisors:", error);
    return { school: null, supervisors: [] };
  }
}

export async function assignSupervisorToStudent(
  studentId: string,
  supervisorId: string,
) {
  try {
    await connectToDatabase();

    // 🔍 Find student
    const student = await Student.findById(studentId).populate("userId");
    if (!student) {
      throw new Error("Student not found");
    }

    // 🔍 Validate supervisor
    const supervisor = await User.findById(supervisorId);
    if (
      !supervisor ||
      !["supervisor", "instructor"].includes(supervisor.userType)
    ) {
      throw new Error("Invalid supervisor");
    }

    // ✅ Update the Student document
    student.supervisor = supervisorId;
    await student.save();

    // ✅ Update the User document (so it's accessible from both sides)
    await User.findByIdAndUpdate(student.userId._id, {
      supervisor: supervisorId,
    });

    // ✅ Send email to student
    await sendDocueeEmail({
      to: student.userId.email,
      subject: "Supervisor Assigned to Your Project",
      title: "You've Been Assigned a Supervisor",
      body: `Dear ${student.userId.firstName},<br><br>We are pleased to inform you that <strong>${supervisor.firstName} ${supervisor.lastName}</strong> has been assigned as your project supervisor. You can now begin working closely with them through the platform.`,
      buttonText: "Go to Dashboard",
      buttonUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}${getDashboardPath(
        student.userId._id.toString(),
        "student",
      )}`,
    });
  } catch (error) {
    console.error("Error assigning supervisor:", error);

    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred while assigning supervisor");
    }
  }
}

export async function assignSupervisorToStudents(
  studentIds: string[],
  supervisorId: string,
) {
  try {
    await connectToDatabase();

    // 🔍 Validate supervisor first
    const supervisor = await User.findById(supervisorId);
    if (
      !supervisor ||
      !["supervisor", "instructor"].includes(supervisor.userType)
    ) {
      throw new Error("Invalid supervisor");
    }

    // 🔍 Fetch all students
    const students = await Student.find({ _id: { $in: studentIds } }).populate(
      "userId",
    );

    if (!students || students.length === 0) {
      throw new Error("No valid students found");
    }

    // ✅ Update all students' supervisor field in Student collection
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { supervisor: supervisorId },
    );

    // ✅ Update User collection for each student
    await User.updateMany(
      { _id: { $in: students.map((s) => s.userId._id) } },
      { supervisor: supervisorId },
    );

    // ✅ Send email to each student (parallelized for speed)
    await Promise.all(
      students.map((student) =>
        sendDocueeEmail({
          to: student.userId.email,
          subject: "Supervisor Assigned to Your Project",
          title: "You've Been Assigned a Supervisor",
          body: `Dear ${student.userId.firstName},<br><br>We are pleased to inform you that <strong>${supervisor.firstName} ${supervisor.lastName}</strong> has been assigned as your project supervisor. You can now begin working closely with them through the platform.`,
          buttonText: "Go to Dashboard",
          buttonUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}${getDashboardPath(
            student.userId._id.toString(),
            "student",
          )}`,
        }),
      ),
    );

    return { success: true, count: students.length };
  } catch (error) {
    console.error("Error assigning supervisor (bulk):", error);

    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred while assigning supervisor");
    }
  }
}

export async function getInstructorsBySchoolId(schoolId: string) {
  try {
    await connectToDatabase();
    const instructors = await User.find({
      school: schoolId,
      userType: "instructor",
    }).select("_id firstName lastName email joinedAt lastLoginAt");

    return JSON.parse(JSON.stringify(instructors));
  } catch (error) {
    console.error("Failed to fetch instructors:", error);
    return [];
  }
}

export async function getSupervisorsBySchoolId(schoolId: string) {
  try {
    await connectToDatabase();
    const supervisors = await User.find({
      school: schoolId,
      userType: "supervisor",
    }).select("_id firstName lastName email joinedAt lastLoginAt");

    return JSON.parse(JSON.stringify(supervisors));
  } catch (error) {
    console.error("Failed to fetch instructors:", error);
    return [];
  }
}

export async function getEligibleSupervisors(
  schoolId: string,
  departmentId: string,
) {
  try {
    await connectToDatabase();

    const supervisors = await User.find({
      school: schoolId,
      userType: { $in: ["supervisor", "instructor"] },
      department: { $in: [departmentId] },
    }).select("_id firstName lastName email picture joinedAt lastLoginAt");

    return JSON.parse(JSON.stringify({ supervisors }));
  } catch (error) {
    console.error("Error fetching eligible supervisors:", error);
    return { supervisors: [] };
  }
}

export const updateAdminProfile = async ({
  userId,
  userDataToUpdate,
}: UpdateAdminProfileParams): Promise<{ error?: string; data?: any }> => {
  try {
    await connectToDatabase();

    if (!userId) return { error: "Missing user ID" };

    const user = await User.findById(userId);
    if (!user) return { error: "User not found" };

    // Check for duplicate phone
    if (userDataToUpdate.phone) {
      const existingUser = await User.findOne({
        phone: userDataToUpdate.phone,
        _id: { $ne: user._id },
      });
      if (existingUser)
        return { error: "This phone number is already in use." };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          phone: userDataToUpdate.phone,
          gender: userDataToUpdate.gender,
          country: userDataToUpdate.country,
          designation: userDataToUpdate.designation,
          expertise: userDataToUpdate.expertise,
          yearsOfExperience: userDataToUpdate.yearsOfExperience,
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedUser) return { error: "Update failed" };

    return { data: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error: any) {
    console.error("Failed to update admin profile:", error);
    return { error: error?.message || "Failed to update admin profile" };
  }
};

export const updateUserBillingCycle = async ({
  userId,
  nextBillingDate,
  subscriptionEndDate,
}: {
  userId: string;
  nextBillingDate: string;
  subscriptionEndDate: string;
}) => {
  try {
    await connectToDatabase();

    await User.findByIdAndUpdate(userId, {
      nextBillingDate,
      subscriptionEndDate,
    });

    console.log("✅ Billing cycle updated for user:", userId);
  } catch (error) {
    console.error("❌ Error updating billing cycle:", error);
    throw new Error("Failed to update billing cycle");
  }
};

export async function getUserLists(clerkIds: string[]) {
  const { data: users } = await clerk.users.getUserList({
    userId: clerkIds,
  });

  return users.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.emailAddresses[0]?.emailAddress || "",
    imageUrl: user.imageUrl,
  }));
}

export async function getDocuments(ids: Id<"documents">[]) {
  const documents = convexClient.query(api.documents.getDocumentByIds, { ids });

  return documents;
}

export async function getProjects(ids: Id<"projects">[]) {
  const projects = convexClient.query(api.projects.getProjectByIds, { ids });

  return projects;
}

export async function createUser(user: CreateUserParams) {
  await connectToDatabase();
  console.log("Connected to database");

  const referralCode = nanoid(8).toUpperCase();
  let newUser;

  try {
    // 1️⃣ Create MongoDB user
    newUser = await User.create({
      ...user,
      subscriptionType: "free",
      referralCode,
      isAdmin: user.isAdmin ?? false,
    });
    console.log("MongoDB user created:", newUser);

    // 2️⃣ Create organization if missing
    if (!newUser.organizationId) {
      const org = await createUserOrganization(newUser._id.toString());
      newUser.organizationId = org._id.toString();
      await newUser.save();
      console.log("Organization created for new user:", org._id);
    }

    // 3️⃣ Sync to Convex
    try {
      await convexClient.mutation(api.users.syncUserToConvex, {
        mongoUserId: newUser._id.toString(),
        clerkId: newUser.clerkId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        userType: newUser.userType,
        email: newUser.email,
        picture: newUser.picture,
        organizationId: newUser.organizationId?.toString() || "",
        isAdmin: newUser.isAdmin || false,
      });
      console.log("User synced to Convex successfully");
    } catch (convexError) {
      console.error("Failed to sync user to Convex:", convexError);

      // ⚠️ Rollback Clerk first
      if (newUser.clerkId) {
        try {
          await clerk.users.deleteUser(newUser.clerkId);
          console.log("Rolled back Clerk user due to Convex sync failure");
        } catch (clerkError) {
          console.error(
            "Failed to delete user from Clerk during rollback:",
            clerkError,
          );
        }
      }

      // ⚠️ Then rollback MongoDB
      await User.findByIdAndDelete(newUser._id);
      console.log("Rolled back MongoDB user due to Convex sync failure");

      throw new Error("Failed to sync user to Convex. User creation aborted.");
    }

    return JSON.parse(JSON.stringify(newUser));
  } catch (error: any) {
    console.error("Error creating user:", error);
    throw new Error(error.message || "Failed to create user");
  }
}

export async function updateUserReferredBy(
  clerkId: string,
  referredByCode: string,
) {
  try {
    await connectToDatabase();

    // Find user by Clerk ID
    const user = await User.findOne({ clerkId });
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Already referred?
    if (user.referredBy) {
      return { success: false, message: "User already has a referrer" };
    }

    // Referrer lookup
    const referrer = await User.findOne({ referralCode: referredByCode });
    if (!referrer) {
      return { success: false, message: "Referrer not found" };
    }

    // Prevent user referring themselves
    if (referrer._id.equals(user._id)) {
      return { success: false, message: "User cannot refer themselves" };
    }

    // Set referrer
    user.referredBy = referrer._id;
    await user.save();

    // Avoid duplicate entries in referredUsers
    if (!referrer.referredUsers.includes(user._id)) {
      referrer.referredUsers.push(user._id);
      await referrer.save();
    }

    return { success: true, message: "Referral successfully updated" };
  } catch (error) {
    console.error("[Referral Error]:", error);
    return {
      success: false,
      message: "An error occurred while updating referral",
    };
  }
}

export async function updateUserInvitedStatus(clerkId: string) {
  try {
    await connectToDatabase();

    // Find the user by their Clerk ID
    const user = await User.findOne({ clerkId });
    if (!user) return { success: false, message: "User not found" };

    // Check if the invited status is already the same
    if (user.invited === true) {
      return {
        success: true,
        message: "Invited status is already up-to-date",
      };
    }

    // Update the user's invited status
    user.invited = true;
    await user.save();

    return {
      success: true,
      message: "User invited status updated successfully",
    };
  } catch (error) {
    console.error("Error updating invited status:", error);
    return { success: false, message: "Failed to update invited status" };
  }
}

export async function updateSchool({
  userId,
  school,
}: {
  userId: string;
  school: string;
}) {
  try {
    await connectToDatabase();

    if (!userId) {
      throw new Error("Missing userId");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.school = school;
    await user.save();

    return JSON.parse(
      JSON.stringify({
        status: "success",
        message: "School updated successfully",
        schoolId: user.school,
      }),
    );
  } catch (error) {
    handleError(error);
  }
}

export async function updateUser({
  userId,
  userDataToUpdate,
  path,
  requireFields = false,
  routeUserType,
}: UpdateUserParams): Promise<UpdateUserResult> {
  try {
    await connectToDatabase();

    if (!userId) {
      return { error: "Missing userId." };
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return { error: "User not found." };
    }

    // ✅ Check for duplicate phone number
    if (userDataToUpdate.phone) {
      const existingUser = await User.findOne({
        phone: userDataToUpdate.phone,
        _id: { $ne: user._id }, // ignore current user
      });
      if (existingUser) {
        return { error: "This phone number is already in use." };
      }
    }

    // Filter out undefined/null values
    const filteredData = Object.fromEntries(
      Object.entries(userDataToUpdate).filter(
        ([_, value]) => value !== undefined, // 👈 keep null
      ),
    );

    // const filteredData = Object.fromEntries(
    //   Object.entries(userDataToUpdate).filter(
    //     ([_, value]) => value !== undefined && value !== null
    //   )
    // );

    // ✅ Enforce required fields if enabled
    if (requireFields) {
      if (!filteredData.country || !filteredData.gender) {
        return { error: "Country and gender are required fields." };
      }
    }

    // Normalize school field
    if (
      filteredData.school &&
      typeof filteredData.school === "object" &&
      "_id" in filteredData.school
    ) {
      filteredData.school = filteredData.school._id;
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, filteredData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return { error: "User update failed." };
    }

    let schoolId: string | undefined;
    if (updatedUser.school) {
      schoolId =
        typeof updatedUser.school === "object" && "_id" in updatedUser.school
          ? updatedUser.school._id.toString()
          : updatedUser.school.toString();
    }

    // Update Convex
    await convexClient.mutation(api.users.updateConvexUserFromMongo, {
      clerkId: updatedUser.clerkId,
      timeZone: updatedUser.timeZone,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      school: schoolId,
      expertise: updatedUser.expertise,
      yearsOfExperience: updatedUser.yearsOfExperience,
      country: updatedUser.country,
    });

    // Determine new route
    let newRoute: string | null = null;

    if (routeUserType) {
      newRoute = `/user/${updatedUser._id}/usertype/${routeUserType}/dashboard`;
    }

    // Update Clerk publicMetadata
    if (newRoute) {
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(updatedUser.clerkId, {
        publicMetadata: { currentRoute: newRoute },
      });
    }

    if (path) revalidatePath(path);

    return { data: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error: any) {
    console.error(error);
    return { error: error?.message || "Failed to update user." };
  }
}

export async function deleteUser(clerkId: string) {
  await connectToDatabase();

  // Find user
  const userToDelete = await User.findOne({ clerkId });

  // If user is already gone, just return null (no error!)
  if (!userToDelete) {
    console.warn("deleteUser: User not found, skipping");
    return null;
  }

  // Delete user
  const deletedUser = await User.findByIdAndDelete(userToDelete._id);

  return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
}

export async function getUserById(identifier: string) {
  try {
    const populateOptions = [
      {
        path: "school",
        populate: { path: "_id name currentSemester" },
      },
      { path: "department" },
      {
        path: "level",
        populate: {
          path: "program",
          populate: { path: "department" }, // ✅ Populate department inside program within level
        },
      },
      {
        path: "program",
        populate: { path: "department" }, // ✅ Populate department inside direct program
      },
      { path: "studyMode" },
      { path: "designation" },
      { path: "expertise" },
      { path: "supervisor" },
      { path: "hodDepartment" },
    ];

    await connectToDatabase();

    // Try by Clerk ID first
    let user = await User.findOne({ clerkId: identifier })
      .populate(populateOptions)
      .lean();

    // If not found and it's a valid ObjectId, try by Mongo _id
    if (!user && mongoose.Types.ObjectId.isValid(identifier)) {
      user = await User.findById(identifier).populate(populateOptions).lean();
    }

    if (!user) return null;

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getAllUsers() {
  try {
    await connectToDatabase();

    const users = await User.find({});

    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    handleError(error);
  }
}

export async function getAllSupervisors(
  schoolId: string,
  departmentId: string,
) {
  try {
    await connectToDatabase();

    const supervisors = await User.find({
      $and: [
        { school: schoolId },
        { department: departmentId }, // optional but improves relevance
        {
          $or: [
            { userType: "supervisor" },
            { userType: "instructor", isSupervisor: true },
          ],
        },
      ],
    });

    return JSON.parse(JSON.stringify(supervisors));
  } catch (error) {
    handleError(error);
  }
}

export async function getClerkUsers() {
  const { userId } = await auth();

  await connectToDatabase();

  // Step 1 — find the org that this user belongs to
  const org = await Organization.findOne({ "members.userClerkId": userId });

  if (!org) {
    console.warn("No organization found for this user");
    return [
      {
        id: "none",
        name: "No organization found",
        avatar: "",
        color: "",
        userType: "guest" as const, // 👈 add fallback
      },
    ];
  }

  // Step 2 — extract all Clerk IDs for members
  const memberClerkIds = org.members.map((m: MemberEntry) => m.userClerkId);

  if (memberClerkIds.length === 0) {
    return [
      {
        id: "none",
        name: "No members found",
        avatar: "",
        color: "",
        userType: "guest" as const, // 👈 add fallback
      },
    ];
  }

  // Step 3 — fetch Clerk users by ID
  const response = await clerk.users.getUserList({ userId: memberClerkIds });

  // Step 4 — return in Liveblocks-compatible format
  return response.data.map((user) => ({
    id: user.id,
    name:
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.primaryEmailAddress?.emailAddress ||
      "Unknown",
    avatar: user.imageUrl,
    color: "",
    userType: "member" as const, // 👈 narrow to valid union member
  }));
}

export async function getCurrentUserByEmailAddress(email: string) {
  try {
    await connectToDatabase();

    const currentUser = await User.findOne({ email: email });

    return JSON.parse(JSON.stringify(currentUser));
  } catch (error) {
    handleError(error);
  }
}

export async function checkEmailRegistered(email: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const user = await User.findOne({ email });

    return user !== null;
  } catch (error) {
    handleError(error);
    return false;
  }
}

export async function createStudent(
  userId: string,
  details: {
    school: string | null;
  },
) {
  try {
    await connectToDatabase();

    const existingStudent = await Student.findOne({ userId });

    if (existingStudent) {
      existingStudent.school = details.school;

      const updatedStudent = await existingStudent.save();

      if (!updatedStudent) {
        console.error("Failed to update the student record.", {
          userId,
          details,
        });
        throw new Error("Failed to update student. Please try again.");
      }

      return JSON.parse(JSON.stringify(updatedStudent));
    }

    const newStudent = await Student.create({
      userId,
      school: details.school,
    });

    if (!newStudent) {
      console.error("No student record was created.", { userId, details });
      throw new Error("Failed to create student. Please try again.");
    }

    return JSON.parse(JSON.stringify(newStudent));
  } catch (error) {
    console.error("Error creating student:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : null,
      userId,
      details,
    });
    throw new Error("Failed to create student. Please try again later.");
  }
}

export async function createInstructor(
  userId: string,
  details: {
    expertise: string[];
    yearsOfExperience: number;
    schoolId?: string | null;
  },
) {
  try {
    await connectToDatabase();

    let instructor = await Instructor.findOne({ userId });

    if (instructor) {
      instructor.expertise = details.expertise;
      instructor.yearsOfExperience = details.yearsOfExperience;
      instructor.schoolId = details.schoolId;

      await instructor.save();
    } else {
      instructor = await Instructor.create({
        userId,
        expertise: details.expertise,
        yearsOfExperience: details.yearsOfExperience,
        schoolId: details.schoolId,
      });
    }

    return JSON.parse(JSON.stringify(instructor));
  } catch (error) {
    console.error("Error creating instructor:", error);
    throw new Error("Failed to create instructor. Please try again later.");
  }
}

export async function getInstructorSchool(userId: string) {
  try {
    await connectToDatabase();

    const instructor = await Instructor.findOne({ userId }).populate("school");

    if (!instructor || !instructor.school) return null;

    return JSON.parse(JSON.stringify({ schoolId: instructor.school._id }));
  } catch (error) {
    handleError(error);
  }
}

export async function updateInvitation(email: string) {
  try {
    await connectToDatabase();

    // 2. Initialize Clerk client
    const clerk = await clerkClient();

    // 3. Get Clerk user(s) by email
    const response = await clerk.users.getUserList({ emailAddress: [email] });

    const users = response.data;

    if (!users.length) {
      console.warn(`❌ No Clerk user found for email: ${email}`);
      return;
    }

    const userId = users[0].id;

    // 4. Get user's org memberships
    const orgResponse = await clerk.users.getOrganizationMembershipList({
      userId,
    });
    const memberships = orgResponse.data;
    const orgCount = memberships.length;

    // 5. Update orgCount in MongoDB
    await User.updateOne(
      { email },
      {
        $set: {
          invited: false,
          orgCount,
        },
      },
    );

    console.log(`✅ Updated orgCount for ${email}: ${orgCount}`);
  } catch (error) {
    console.error("🔥 Error updating invitation status:", error);
    throw error;
  }
}

export async function getSupervisorEmail(projectId: string) {
  try {
    await connectToDatabase();

    const project = await Project.findById(projectId).populate("supervisor");

    if (!project) {
      throw new Error("Project not found");
    }

    if (!project.supervisor) {
      throw new Error("Supervisor not assigned");
    }

    // 3. Return Supervisor Email
    return project.supervisor;
  } catch (error) {
    console.error("Error in getSupervisorEmail:", error);
    return null; // or throw error, based on preference
  }
}

export async function getSupervisorEmailByStudentId(studentId: string) {
  try {
    await connectToDatabase();

    const user = await User.findById(studentId);

    const project = await Project.findOne({
      projectCreator: user._id,
    }).populate("supervisor");

    if (!project) {
      throw new Error("Project not found");
    }

    if (!project.supervisor) {
      throw new Error("Supervisor not assigned");
    }

    // 3. Return Supervisor Email
    return project.supervisor;
  } catch (error) {
    console.error("Error in getSupervisorEmail:", error);
    return null; // or throw error, based on preference
  }
}
