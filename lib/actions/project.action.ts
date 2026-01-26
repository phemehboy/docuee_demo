"use server";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { CreateProjectParams } from "@/types";
import { getDashboardPath, handleError } from "../utils";
import { connectToDatabase } from "../database";
import { revalidatePath } from "next/cache";
import User, { IUser } from "../database/models/user.model";
import Project, {
  OverallStatus,
  Status,
} from "../database/models/project.model";
import School from "../database/models/school.model";
import { sendDocueeEmail } from "../email/sendDocueeEmail";
import Student from "../database/models/student.model";
import { buildInitialSubmissionStages } from "../initProjectStages/initProjectStages";
import { buildIndependentSubmissionStages } from "../initProjectStages/independentSubmissionStages";
import { createProjectNotification } from "./project-notification.action";
import Organization from "../database/models/organization.model";
import Group from "../database/models/group.model";
import Department from "../database/models/department.model";

export async function getStudentProject(studentId: string) {
  try {
    await connectToDatabase();

    // Find the student
    const student = await Student.findOne({ userId: studentId });

    if (!student) return null;

    const projectQuery: any = { $or: [{ projectCreator: student._id }] };

    if (student.group) {
      projectQuery.$or.push({ groupId: student.group });
    }

    // Find the project either created by this student or linked to their group
    const project = await Project.findOne(projectQuery)
      .sort({ createdAt: -1 })
      .populate({
        path: "supervisorId",
        model: "User",
        select: "firstName lastName email",
      })
      .populate({
        path: "schoolId",
        select: "name",
      })
      .populate({
        path: "groupId",
        model: "Group",
        populate: {
          path: "students",
          model: "Student",
          populate: {
            path: "userId",
            model: "User",
            select: "firstName lastName email",
          },
        },
      })
      .lean();

    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    console.error("❌ Error fetching student project:", error);
    return null;
  }
}

export async function getPendingTopicSubmissions(supervisorId: string) {
  try {
    await connectToDatabase();

    const projects = await Project.find({
      supervisorId,
      overallStatus: "pending",
      $or: [
        { "projectTopics.topicOne.status": "pending" },
        { "projectTopics.topicTwo.status": "pending" },
        { "projectTopics.topicThree.status": "pending" },
        { "projectTopics.topicFour.status": "pending" },
      ],
    })
      .populate({
        path: "projectCreator",
        populate: { path: "userId", select: "firstName lastName email" },
      })
      .sort({ createdAt: -1 })
      .limit(10);

    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error("Error fetching pending topic submissions:", error);
    return [];
  }
}

export async function getProjectsStatusBySupervisor(supervisorId: string) {
  try {
    await connectToDatabase();

    const statusCounts = {
      approved: 0,
      rejected: 0,
      pending: 0,
      "in-progress": 0,
      completed: 0,
    };

    const projects = await Project.find({ supervisorId }).populate({
      path: "supervisorId",
      select: "department", // Only fetch department field
    });

    // Extract supervisor departments (assumes all projects have the same supervisor)
    const supervisorDepartments = projects[0]?.supervisorId?.department || [];

    for (const project of projects) {
      const status = project.overallStatus as keyof typeof statusCounts;
      if (status in statusCounts) {
        statusCounts[status] += 1;
      }
    }

    return { statusCounts, departments: supervisorDepartments };
  } catch (error) {
    console.error("Error fetching project statuses:", error);
    return {
      statusCounts: {
        approved: 0,
        rejected: 0,
        pending: 0,
        "in-progress": 0,
        completed: 0,
      },
      departments: [], // ensure consistent return shape
    };
  }
}

export async function updateTopicStatusMongoWithConvexId(
  projectId: string,
  convexProjectId: string,
) {
  await connectToDatabase();

  const project = await Project.findById(projectId);
  if (!project) return;

  project.convexProjectId = convexProjectId;
  await project.save();
}

export async function updateTopicStatus({
  projectId,
  topicKey,
  status,
  reason,
}: {
  projectId: string;
  topicKey: "topicOne" | "topicTwo" | "topicThree" | "topicFour";
  status: "approved" | "rejected";
  reason?: string;
}) {
  await connectToDatabase();

  const project = await Project.findById(projectId)
    .populate({
      path: "projectCreator",
      populate: { path: "userId" },
    })
    .populate("groupId");

  if (!project) {
    return { success: false, message: "Project not found" };
  }

  // -------------------------------------------------
  // UPDATE TOPIC STATUS
  // -------------------------------------------------
  project.projectTopics[topicKey].status = status;
  project.projectTopics[topicKey].rejectionReason =
    status === "rejected" ? reason : undefined;

  // -------------------------------------------------
  // RECALCULATE OVERALL STATUS
  // -------------------------------------------------
  const topicStatuses = Object.values(project.projectTopics).map(
    (topic: any) => topic.status,
  );

  // After recalculating overallStatus
  if (topicStatuses.includes("approved")) {
    project.overallStatus = "approved";

    if (project.context === "institutional") {
      const school = await School.findById(project.schoolId);
      if (school) {
        project.submissionStages = buildInitialSubmissionStages(school);
      }
    }

    if (project.context === "independent") {
      // Create default independent stages
      project.submissionStages = buildIndependentSubmissionStages();
      project.independentStatus = "active";
    }
  } else if (topicStatuses.every((s) => s === "rejected")) {
    project.overallStatus = "rejected";

    if (project.context === "independent") {
      project.independentStatus = "pending_topics";
    }
  } else {
    project.overallStatus = "pending";
  }

  await project.save();

  // -------------------------------------------------
  // ADD SUPERVISOR TO ORGANIZATION IF APPROVED
  // -------------------------------------------------
  if (
    project.overallStatus === "approved" &&
    project.supervisorId &&
    project.organizationId
  ) {
    const supervisor = await User.findById(project.supervisorId);
    const organization = await Organization.findById(project.organizationId);

    if (supervisor?.clerkId && organization) {
      const exists = organization.members.some(
        (m: any) => m.userClerkId === supervisor.clerkId,
      );
      if (!exists) {
        organization.members.push({
          userClerkId: supervisor.clerkId,
          joinedAt: new Date(),
        });
        await organization.save();
      }
    }
  }

  // -------------------------------------------------
  // HANDLE NOTIFICATIONS & EMAILS
  // -------------------------------------------------
  const isApproved = project.overallStatus === "approved";
  const isFullyRejected = project.overallStatus === "rejected";

  // Only notify when the project is fully approved OR fully rejected
  if (isApproved || isFullyRejected) {
    const studentUser = project.projectCreator?.userId as IUser | undefined;
    const group = project.groupId
      ? await Group.findById(project.groupId).populate({
          path: "students",
          populate: { path: "userId" },
        })
      : null;

    const allStudents = group
      ? group.students.map((s: any) => s.userId).filter(Boolean)
      : studentUser
        ? [studentUser]
        : [];

    // -------------------------------------------------
    // IF FULLY REJECTED – BUILD REASON LIST
    // -------------------------------------------------
    let rejectionSummaryText = "";
    let rejectionSummaryHTML = "";

    if (isFullyRejected) {
      const topicList = Object.values(project.projectTopics) as any[];

      const formattedList = topicList.map((t: any, idx: number) => {
        const reason =
          t.rejectionReason && t.rejectionReason.trim().length > 0
            ? t.rejectionReason
            : "No reason provided";

        return {
          text: `${idx + 1}. ${t.topic} — ${reason}`,
          html: `<p><strong>${idx + 1}. ${t.topic}</strong><br/>Reason: ${reason}</p>`,
        };
      });

      rejectionSummaryText = formattedList.map((x) => x.text).join("\n");
      rejectionSummaryHTML = formattedList.map((x) => x.html).join("");
    }

    // -------------------------------------------------
    // SEND NOTIFICATION AND EMAIL TO ALL STUDENTS
    // -------------------------------------------------
    for (const user of allStudents) {
      const isGroupProject = !!project.groupId;

      const title = isApproved ? "Project Approved" : "Project Rejected";

      // -------------------------------
      // IN-APP NOTIFICATION
      // -------------------------------
      const message = isApproved
        ? isGroupProject
          ? "Your group project has been approved. You may now begin working on it with your teammates."
          : "Your project has been approved. You may now begin working on it."
        : isGroupProject
          ? `All group project topics were rejected.\n\nReasons:\n${rejectionSummaryText}`
          : `All your project topics were rejected.\n\nReasons:\n${rejectionSummaryText}`;

      await createProjectNotification({
        title,
        message,
        type: isApproved ? "project_approved" : "project_rejected",
        userId: user._id,
        projectId: project._id,
        actionLink: getDashboardPath(user._id.toString(), "student", "project"),
      });

      // -------------------------------
      // EMAIL BODY
      // -------------------------------
      const emailBody = isApproved
        ? isGroupProject
          ? `Dear ${user.firstName},<br><br>Your group project has been approved. You may now begin working on it with your teammates.`
          : `Dear ${user.firstName},<br><br>Your project has been approved. You may now begin working on it.`
        : isGroupProject
          ? `Dear ${user.firstName},<br><br>All your group project topics were rejected.<br><br>${rejectionSummaryHTML}`
          : `Dear ${user.firstName},<br><br>All your project topics were rejected.<br><br>${rejectionSummaryHTML}`;

      // SEND EMAIL
      await sendDocueeEmail({
        to: user.email,
        subject: title,
        title: isApproved
          ? "Project Approval Notice"
          : "Project Rejection Notice",
        body: emailBody,
        buttonText: "Go to Dashboard",
        buttonUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}${getDashboardPath(
          user._id.toString(),
          "student",
        )}`,
        theme: isApproved ? "green" : "red",
      });
    }
  }

  // -------------------------------------------------
  // SYNC TO CONVEX IF APPROVED
  // -------------------------------------------------
  let convexPayload: any = null;
  if (project.overallStatus === "approved") {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/convex/sync-project`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project._id,
            userId: project.projectCreator.userId._id,
          }),
        },
      );

      const { success, payload } = await response.json();
      if (success) convexPayload = payload;
    } catch (err) {
      console.error("Failed to sync project to Convex:", err);
    }
  }

  return { success: true, convexPayload };
}

export const getProjectsBySchoolId = async (schoolId: string) => {
  try {
    await connectToDatabase();

    const projects = await Project.find({ schoolId })
      .populate({
        path: "projectCreator",
        model: "Student",
        populate: [
          {
            path: "userId",
            model: "User",
            select: "_id firstName lastName email picture gender",
          },
          { path: "school", select: "_id name" },
          { path: "department", select: "_id name" },
          { path: "level", select: "_id name" },
          { path: "program", select: "_id name" },
          { path: "studyMode", select: "_id name" },
          { path: "group", select: "_id name" },
          {
            path: "supervisor",
            select: "_id firstName lastName email picture",
          },
        ],
      })
      .populate({
        path: "supervisorId",
        model: "User",
        select: "_id firstName lastName email picture",
      });

    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error("Failed to get projects:", error);
    return [];
  }
};

export async function getProjectsStatusBySchoolId(schoolId: string) {
  try {
    const statuses = await Project.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
      {
        $group: {
          _id: "$overallStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      inProgress: 0,
      completed: 0,
      pendingReview: 0,
    };

    for (const status of statuses) {
      if (status._id === "in-progress") result.inProgress = status.count;
      if (status._id === "completed") result.completed = status.count;
      if (status._id === "pending") result.pendingReview = status.count;
    }

    return result;
  } catch (error) {
    console.error("Error getting project status breakdown:", error);
    return {
      inProgress: 0,
      completed: 0,
      pendingReview: 0,
    };
  }
}

export async function createOrUpdateProject(project: CreateProjectParams) {
  try {
    await connectToDatabase();

    const {
      topicOne,
      topicTwo,
      topicThree,
      topicFour,
      projectCreator,
      supervisorId,
      organizationId,
      status,
      path,
      groupId,
      accountMode,
      activeProjectId,
    } = project;

    if (!projectCreator) throw new Error("Project creator is required.");

    const student = await Student.findById(projectCreator).populate("userId");
    if (!student) throw new Error("Student not found.");

    const studentUser = student.userId as IUser;

    const studentFullName = `${studentUser.firstName} ${studentUser.lastName}`;
    const pronoun =
      studentUser.gender === "male"
        ? "his"
        : studentUser.gender === "female"
          ? "her"
          : "their";

    // Only fetch school, department, session if NOT independent
    let school: any = null;
    let departmentName: string | undefined = undefined;
    let currentSession: string | undefined = undefined;

    if (accountMode !== "independent") {
      school = await School.findById(student.school);
      if (!school) throw new Error("School not found.");

      const departmentDoc = await Department.findById(student.department);
      if (!departmentDoc) throw new Error("Student's department not found.");
      departmentName = departmentDoc.name;

      currentSession = school.currentSession;
    }

    // Fetch supervisor
    const supervisorUser = await User.findById(supervisorId);
    if (!supervisorUser) throw new Error("Supervisor not found.");
    const supervisorObjectId = supervisorUser._id.toString();

    const supervisorRole =
      supervisorUser.userType === "instructor" ? "instructor" : "supervisor";

    let query: any;
    if (activeProjectId) {
      query = groupId
        ? { _id: activeProjectId, groupId }
        : { _id: activeProjectId, projectCreator };
    } else {
      query = groupId ? { groupId } : { projectCreator };
    }

    const existingProject = await Project.findOne(query).sort({
      createdAt: -1,
    });

    const newTopics = [topicOne, topicTwo, topicThree, topicFour];

    // ✅ Get group info if applicable
    let groupName = "";
    let groupMembers: string[] = [];

    if (groupId) {
      const group = await Group.findById(groupId).populate("students");
      if (!group) throw new Error("Group not found.");

      groupName = group.name;
      groupMembers = group.students.map((s: any) => s._id.toString());
    }

    // ======= UPDATE EXISTING PROJECT =======
    if (existingProject) {
      const existingTopics = existingProject.projectTopics;

      // 1️⃣ Prevent updates if any topic is approved
      const approvedTopics = Object.values(existingTopics)
        .filter((t: any) => t.status === "approved")
        .map((t: any) => t.topic);

      if (accountMode !== "independent" && approvedTopics.length > 0) {
        throw new Error(
          "You cannot update your project topics because one or more has already been approved.",
        );
      }

      // 2️⃣ Track rejected topics
      const rejectedTopics = Object.values(existingTopics)
        .filter((t: any) => t.status === "rejected")
        .map((t: any) => t.topic);

      // 3️⃣ Validate new submission against rejected topics
      const duplicates = newTopics.filter((t) => rejectedTopics.includes(t));
      if (duplicates.length > 0) {
        throw new Error(
          `You cannot resubmit previously rejected topics: ${duplicates.join(", ")}`,
        );
      }

      // 4️⃣ Update topics
      existingProject.projectTopics = {
        topicOne: {
          topic: topicOne,
          status: rejectedTopics.includes(topicOne) ? "rejected" : "pending",
        },
        topicTwo: {
          topic: topicTwo,
          status: rejectedTopics.includes(topicTwo) ? "rejected" : "pending",
        },
        topicThree: {
          topic: topicThree,
          status: rejectedTopics.includes(topicThree) ? "rejected" : "pending",
        },
        topicFour: {
          topic: topicFour,
          status: rejectedTopics.includes(topicFour) ? "rejected" : "pending",
        },
      };

      existingProject.supervisorId = supervisorId;
      existingProject.organizationId = organizationId;
      existingProject.departmentName = departmentName;
      existingProject.overallStatus = "pending";
      existingProject.independentStatus =
        accountMode === "independent" ? "topics_submitted" : null;
      existingProject.context = accountMode ?? "institutional";
      await existingProject.save();

      // ✅ Notify supervisor
      const supervisorMessage = groupId
        ? `Your group has updated their project topics.`
        : `Your student, ${studentFullName}, has updated ${pronoun} project topics.`;

      await createProjectNotification({
        title: "Project Updated",
        type: "project_updated",
        message: supervisorMessage,
        projectId: existingProject._id.toString(),
        userId: supervisorObjectId,
        actionLink: getDashboardPath(
          supervisorObjectId,
          supervisorRole,
          "projects",
        ),
      });

      // ✅ Notify all group members (if group project)
      if (groupId) {
        for (const memberId of groupMembers) {
          await createProjectNotification({
            title: "Project Updated",
            type: "project_updated",
            message: `Your group "${groupName}" has updated the project topics.`,
            projectId: existingProject._id.toString(),
            userId: memberId,
            actionLink: getDashboardPath(memberId, "student"),
          });
        }
      } else {
        await createProjectNotification({
          title: "Project Updated",
          type: "project_updated",
          message: "You have updated your project topics.",
          projectId: existingProject._id.toString(),
          userId: projectCreator,
          actionLink: getDashboardPath(projectCreator, "student"),
        });
      }

      // Send email to supervisor
      await sendDocueeEmail({
        to: supervisorUser.email,
        subject: `Project Topics Updated by ${groupId ? `Group: ${groupName}` : studentFullName}`,
        title: "Project Topics Updated",
        body: `
            <p>Dear ${supervisorUser.firstName},</p>
            <p>${
              groupId
                ? `The group <strong>${groupName}</strong> under your supervision`
                : `Your student, <strong>${studentFullName}</strong>`
            }${accountMode !== "independent" ? ` from the <strong>${departmentName}</strong> department` : ""} has updated ${
              groupId ? "their" : pronoun
            } project topics.</p>
            <ol>
              <li>${topicOne}</li>
              <li>${topicTwo}</li>
              <li>${topicThree}</li>
              <li>${topicFour}</li>
            </ol>
          `,
        buttonText: "Review Topics",
        buttonUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}${getDashboardPath(
          supervisorObjectId,
          supervisorRole,
          "projects",
        )}`,
        note: "Please log in to review the updated topics.",
      });

      revalidatePath(path);
      return JSON.parse(JSON.stringify(existingProject));
    }

    // ======= CREATE NEW PROJECT ========

    // Determine first stage
    let firstStageName = "proposal";
    if (
      accountMode !== "independent" &&
      Array.isArray(school.projectStages) &&
      school.projectStages.length > 0
    ) {
      firstStageName = school.projectStages[0].toLowerCase();
    }

    const newProject = await Project.create({
      supervisorId,
      organizationId,
      departmentName,
      groupId: groupId || null, // ✅ attach groupId when available
      projectTopics: {
        topicOne: { topic: topicOne, status },
        topicTwo: { topic: topicTwo, status },
        topicThree: { topic: topicThree, status },
        topicFour: { topic: topicFour, status },
      },
      projectCreator,
      schoolId: accountMode === "independent" ? null : school._id,
      session: accountMode === "independent" ? null : currentSession,
      currentStage: firstStageName,
      context: accountMode ?? "institutional",
      independentStatus:
        accountMode === "independent" ? "topics_submitted" : null,
    });

    // ✅ Notify supervisor
    await createProjectNotification({
      title: "Project Created",
      type: "project_created",
      message: groupId
        ? `The group "${groupName}" has submitted their project topics for your review.`
        : `Your student, ${studentFullName}, has submitted ${pronoun} project topics.`,
      projectId: newProject._id.toString(),
      userId: supervisorObjectId,
      actionLink: getDashboardPath(
        supervisorObjectId,
        supervisorRole,
        "projects",
      ),
    });

    // ✅ Notify group members or single student
    if (groupId) {
      for (const memberId of groupMembers) {
        await createProjectNotification({
          title: "Project Created",
          type: "project_created",
          message: `Your group "${groupName}" has submitted project topics.`,
          projectId: newProject._id.toString(),
          userId: memberId,
          actionLink: getDashboardPath(memberId, "student"),
        });
      }
    } else {
      await createProjectNotification({
        title: "Project Created",
        type: "project_created",
        message: "You have submitted new project topics.",
        projectId: newProject._id.toString(),
        userId: projectCreator,
        actionLink: getDashboardPath(projectCreator, "student"),
      });
    }

    await createProjectNotification({
      title: "Project Created",
      type: "project_created",
      message: groupId
        ? "Your group has submitted project topics."
        : "You have submitted new project topics.",
      projectId: newProject._id.toString(),
      userId: projectCreator,
      actionLink: getDashboardPath(projectCreator, "student"),
    });

    await sendDocueeEmail({
      to: supervisorUser.email,
      subject: `Project Topics Submitted by ${
        groupId ? `Group: ${groupName}` : studentFullName
      }`,

      title: "New Project Topics Submitted",
      body: `
        <p>Dear ${supervisorUser.firstName},</p>
        <p>${
          groupId
            ? `The group <strong>${groupName}</strong> under your supervision`
            : `Your student, <strong>${studentFullName}</strong>`
        } ${accountMode !== "independent" ? ` from the <strong>${departmentName}</strong> department` : ""} has submitted project topics for your review.</p>
        <ol>
          <li>${topicOne}</li>
          <li>${topicTwo}</li>
          <li>${topicThree}</li>
          <li>${topicFour}</li>
        </ol>
      `,
      buttonText: "Review Topics",
      buttonUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}${getDashboardPath(
        supervisorObjectId,
        supervisorRole,
        "projects",
      )}`,
      note: "Please log in to review and approve or reject these topics.",
    });

    revalidatePath(path);
    return JSON.parse(JSON.stringify(newProject));
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export async function deleteProject(projectId: string) {
  try {
    await connectToDatabase();

    const project = await Project.findById(projectId);

    if (!project) {
      console.error(`Project with ID ${projectId} not found`);
      return false;
    }

    await Project.findByIdAndDelete(projectId);
    console.log(`Project with ID ${projectId} successfully deleted`);

    return true;
  } catch (error) {
    console.error(`Error deleting project with ID ${projectId}:`, error);
    return false;
  }
}

export async function getProjectByUserId(userId: string) {
  try {
    await connectToDatabase();

    const project = await Project.findOne({ projectCreator: userId }).populate({
      path: "projectCreator",
      model: User,
      select: "_id firstName lastName picture gender email",
    });

    if (!project) throw new Error("Project not found!");

    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    handleError(error);
  }
}

export async function getProjectForStudent(studentId: string) {
  try {
    await connectToDatabase();

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) return null;

    // Try to find individual project first
    let project = await Project.findOne({
      projectCreator: new mongoose.Types.ObjectId(student._id),
    })
      .populate({
        path: "projectCreator",
        populate: [
          {
            path: "userId",
            populate: [
              { path: "school", populate: { path: "currentSemester" } },
              { path: "department" },
              { path: "level" },
              { path: "program" },
              { path: "studyMode" },
              { path: "designation" },
              { path: "supervisor" },
              { path: "hodDepartment" },
            ],
          },
          { path: "school" },
          { path: "department" },
          { path: "level" },
          { path: "program" },
          { path: "studyMode" },
          { path: "supervisor" },
        ],
      })
      // Populate the groupId and its students properly
      .populate({
        path: "groupId",
        populate: {
          path: "students",
          populate: [
            {
              path: "userId",
              populate: [
                { path: "school", populate: { path: "currentSemester" } },
                { path: "department" },
                { path: "level" },
                { path: "program" },
                { path: "studyMode" },
                { path: "designation" },
                { path: "supervisor" },
                { path: "hodDepartment" },
              ],
            },
            { path: "supervisor" },
          ],
        },
      })
      .lean();

    // If no individual project, check for group project
    if (!project && student.group) {
      project = await Project.findOne({ groupId: student.group._id })
        .populate({
          path: "projectCreator",
          populate: [
            {
              path: "userId",
              populate: [
                { path: "school", populate: { path: "currentSemester" } },
                { path: "department" },
                { path: "level" },
                { path: "program" },
                { path: "studyMode" },
                { path: "designation" },
                { path: "supervisor" },
                { path: "hodDepartment" },
              ],
            },
            { path: "school" },
            { path: "department" },
            { path: "level" },
            { path: "program" },
            { path: "studyMode" },
            { path: "supervisor" },
          ],
        })
        .populate({
          path: "groupId",
          populate: {
            path: "students",
            populate: [
              {
                path: "userId",
                populate: [
                  { path: "school", populate: { path: "currentSemester" } },
                  { path: "department" },
                  { path: "level" },
                  { path: "program" },
                  { path: "studyMode" },
                  { path: "designation" },
                  { path: "supervisor" },
                  { path: "hodDepartment" },
                ],
              },
              { path: "supervisor" },
            ],
          },
        })
        .lean();
    }

    if (!project) return null;

    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    handleError(error);
    return null;
  }
}

export async function getIndependentProjectsForStudent(studentId: string) {
  try {
    await connectToDatabase();

    const student = await Student.findById(studentId);
    if (!student) return [];

    const projects = await Project.find({
      projectCreator: new mongoose.Types.ObjectId(student._id),
      context: "independent",
    })
      .populate({
        path: "projectCreator",
        populate: [
          {
            path: "userId",
            populate: [
              { path: "school", populate: { path: "currentSemester" } },
              { path: "department" },
              { path: "level" },
              { path: "program" },
              { path: "studyMode" },
              { path: "designation" },
              { path: "supervisor" },
              { path: "hodDepartment" },
            ],
          },
          { path: "school" },
          { path: "department" },
          { path: "level" },
          { path: "program" },
          { path: "studyMode" },
          { path: "supervisor" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    handleError(error);
    return [];
  }
}

export async function getProjectByProjectId(projectId: string) {
  try {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      console.error("❌ Invalid projectId:", projectId);
      return null;
    }

    const project = await Project.findById(
      new mongoose.Types.ObjectId(projectId),
    )
      .populate(
        "projectCreator",
        "clerkId firstName lastName email userType subscriptionType",
      )
      .populate("supervisorId", "clerkId firstName lastName email userType");

    if (!project) {
      console.error("❌ Project not found in database.");
      return null;
    }

    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    console.error("🔥 Error fetching project:", error);
    return null;
  }
}

export async function updateProjectOrgIdInMongoDB(
  projectId: string,
  organizationId: string,
) {
  try {
    await connectToDatabase();

    const updatedProject = await Project.updateOne(
      { _id: new ObjectId(projectId) }, // ✅ convert projectId to ObjectId
      { $set: { organizationId } }, // 👌 shorthand is fine here
    );

    return JSON.parse(JSON.stringify(updatedProject));
  } catch (error) {
    console.error("🔥 Error updating project organizationId:", error);
    return null;
  }
}

export async function getAllAssignedProjects(params: {
  supervisorId: string;
  schoolId?: string; // optional
}) {
  try {
    await connectToDatabase();

    const { supervisorId, schoolId } = params;

    const schoolIdsToQuery: (string | null)[] = [null]; // allow string or null
    if (schoolId) schoolIdsToQuery.push(schoolId);

    const projects = await Project.find({
      supervisorId,
      schoolId: { $in: schoolIdsToQuery },
    })
      .populate({
        path: "projectCreator",
        model: "Student",
        populate: [
          {
            path: "userId",
            model: "User",
            select:
              "_id firstName lastName picture gender email clerkId userType subscriptionType timeZone",
          },
          { path: "school", select: "_id name" },
          { path: "department", select: "_id name" },
          { path: "level", select: "_id name" },
          { path: "program", select: "_id name" },
          { path: "studyMode", select: "_id name" },
          { path: "group", select: "_id name" },
          {
            path: "supervisor",
            select: "_id firstName lastName email picture",
          },
          { path: "courses", select: "_id code title" },
        ],
      })
      .populate({
        path: "supervisorId",
        model: "User",
        select: "_id firstName lastName email clerkId userType picture",
      })
      .sort({ createdAt: -1 });

    return { projects: JSON.parse(JSON.stringify(projects)) };
  } catch (error) {
    console.error("❌ Error fetching assigned projects:", error);
    throw new Error("Failed to fetch assigned projects");
  }
}

export async function allAssignedProjects(userEmail: string) {
  try {
    await connectToDatabase();

    const projects = await Project.find({ supervisor: userEmail });

    // Check if any topic is approved and update overallStatus
    const updatedProjects = projects.map((project) => {
      const { projectTopics } = project;

      const isAnyTopicApproved = [
        projectTopics?.topicOne?.status,
        projectTopics?.topicTwo?.status,
        projectTopics?.topicThree?.status,
        projectTopics?.topicFour?.status,
      ].includes(Status.Approved);

      if (isAnyTopicApproved) {
        project.overallStatus = "approved" as OverallStatus;
      }

      return project;
    });

    return JSON.parse(JSON.stringify(updatedProjects));
  } catch (error) {
    console.error("Error fetching assigned projects:", error);
    throw new Error("Failed to fetch assigned projects");
  }
}

export async function getProjectStatusByUserId(userId: string) {
  try {
    await connectToDatabase();

    const project = await Project.findOne({ projectCreator: userId });

    if (!project) return { exists: false, approved: false };

    return {
      exists: true,
      approved: project.status === "approved",
    };
  } catch (error) {
    handleError(error);
    throw new Error("Failed to fetch project status.");
  }
}

export async function getProjectStatusCounts(userEmail: string) {
  try {
    await connectToDatabase();

    const queryBase = { supervisor: userEmail };

    // Approved projects: At least one topic has status "approved"
    const approvedCountPromise = Project.countDocuments({
      ...queryBase,
      $or: [
        { "projectTopics.topicOne.status": "approved" },
        { "projectTopics.topicTwo.status": "approved" },
        { "projectTopics.topicThree.status": "approved" },
        { "projectTopics.topicFour.status": "approved" },
      ],
    });

    // Rejected projects: All topics have status "rejected"
    const rejectedCountPromise = Project.countDocuments({
      ...queryBase,
      $and: [
        { "projectTopics.topicOne.status": "rejected" },
        { "projectTopics.topicTwo.status": "rejected" },
        { "projectTopics.topicThree.status": "rejected" },
        { "projectTopics.topicFour.status": "rejected" },
      ],
    });

    // Pending projects: All topics have status "pending"
    const pendingCountPromise = Project.countDocuments({
      ...queryBase,
      $and: [
        { "projectTopics.topicOne.status": "pending" },
        { "projectTopics.topicTwo.status": "pending" },
        { "projectTopics.topicThree.status": "pending" },
        { "projectTopics.topicFour.status": "pending" },
      ],
    });

    // Execute promises concurrently
    const [approvedCount, rejectedCount, pendingCount] = await Promise.all([
      approvedCountPromise,
      rejectedCountPromise,
      pendingCountPromise,
    ]);

    return {
      approvedCount,
      rejectedCount,
      pendingCount,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching project status counts:", {
        message: error.message,
        stack: error.stack,
        userEmail,
      });
      throw new Error(
        `Failed to fetch project status counts: ${error.message}`,
      );
    } else {
      console.error("Unknown error:", { error, userEmail });
      throw new Error(
        "An unknown error occurred while fetching project status counts.",
      );
    }
  }
}

export async function updateProjectOverallStatus(
  studentId: string,
  status: OverallStatus,
) {
  try {
    await connectToDatabase();

    const project = await Project.findOne({ projectCreator: studentId });

    if (!project) {
      throw new Error("No project found");
    }

    // Update the project's overall status
    const updatedProject = await Project.updateOne(
      { projectCreator: studentId },
      {
        $set: {
          overallStatus: status,
          updatedAt: new Date(),
        },
      },
    );

    if (updatedProject.modifiedCount === 0) {
      throw new Error("Failed to update project status");
    }

    // Return the updated project status
    return {
      status: "success",
      data: { studentId, status },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating project status:", error.message);
      throw new Error(error.message);
    } else {
      console.error("Unknown error occurred:", error);
      throw new Error("Internal Server Error");
    }
  }
}

export async function updateMongoOverallStatus({
  projectId,
  newStatus,
}: {
  projectId: string;
  newStatus: OverallStatus;
}) {
  try {
    await connectToDatabase();

    if (!projectId) {
      console.warn(`Project ID missing; skipping MongoDB update.`);
      return;
    }

    const project = await Project.findById(projectId);

    if (!project) {
      console.warn(`MongoDB: No project found with _id ${projectId}.`);
      return;
    }

    if (project.overallStatus === "completed") {
      console.log(
        `MongoDB: Project ${projectId} is already "completed"; no update will be made.`,
      );
      return;
    }

    if (
      project.overallStatus === "in-progress" ||
      project.overallStatus === newStatus
    ) {
      console.log(
        `MongoDB: Project ${projectId} is already "${newStatus}"; no update necessary.`,
      );
      return;
    }

    const updateResult = await Project.updateOne(
      { _id: projectId },
      { $set: { overallStatus: newStatus, updatedAt: Date.now() } },
    );

    if (updateResult.matchedCount === 0) {
      console.warn(
        `MongoDB: No project found with _id ${projectId} to update.`,
      );
    } else {
      console.log(
        `MongoDB: Successfully updated project ${projectId} to status "${newStatus}".`,
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating project overallStatus:", error.message);
      throw new Error(error.message);
    } else {
      console.error("Unknown error occurred:", error);
      throw new Error("Internal Server Error");
    }
  }
}

export async function updateMongoOverallStatusToCompleted({
  projectId,
  newStatus,
}: {
  projectId: string;
  newStatus: OverallStatus;
}) {
  try {
    await connectToDatabase();

    // Now handle MongoDB update
    if (projectId) {
      console.log(`Attempting to update MongoDB project with ID: ${projectId}`);

      const updateResult = await Project.updateOne(
        { _id: projectId },
        { $set: { overallStatus: newStatus, updatedAt: Date.now() } },
      );

      if (updateResult.matchedCount === 0) {
        console.warn(
          `MongoDB: No project found with _id ${projectId} to update.`,
        );
      } else {
        console.log(
          `MongoDB: Successfully updated project ${projectId} to status "${newStatus}".`,
        );
      }
    } else {
      console.warn(
        `Project ${projectId} has no associated MongoDB ID; skipping MongoDB update.`,
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating project overallStatus:", error.message);
      throw new Error(error.message);
    } else {
      console.error("Unknown error occurred:", error);
      throw new Error("Internal Server Error");
    }
  }
}

export async function getPaginatedAssignedStudents(
  supervisorEmail: string,
  page: number = 1,
  limit: number = 10,
  searchQuery?: string,
) {
  if (!supervisorEmail) {
    throw new Error("Supervisor email is required.");
  }

  try {
    await connectToDatabase();

    const skip = (page - 1) * limit;

    // Build search filter
    const searchRegex = searchQuery
      ? { $regex: searchQuery, $options: "i" }
      : undefined;

    // Base match
    const baseMatch: any = {
      supervisor: supervisorEmail,
    };

    // Create main pipeline
    const pipeline: any[] = [
      { $match: baseMatch },
      {
        $lookup: {
          from: "users",
          localField: "projectCreator",
          foreignField: "_id",
          as: "creator",
        },
      },
      { $unwind: "$creator" },
    ];

    // Apply search if needed
    if (searchRegex) {
      pipeline.push(
        {
          $addFields: {
            fullName: {
              $concat: [
                { $ifNull: ["$creator.firstName", ""] },
                " ",
                { $ifNull: ["$creator.lastName", ""] },
              ],
            },
          },
        },
        {
          $match: {
            $or: [
              { "creator.firstName": searchRegex },
              { "creator.lastName": searchRegex },
              { fullName: searchRegex },
              { "creator.email": searchRegex },
              { overallStatus: searchRegex },
            ],
          },
        },
      );
    }

    // Add sorting, skipping, and limiting
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    );

    const projects = await Project.aggregate(pipeline);

    const students = projects.map((project: any) => ({
      _id: project.creator?._id,
      firstName: project.creator?.firstName,
      lastName: project.creator?.lastName,
      email: project.creator?.email,
      picture: project.creator?.picture,
      gender: project.creator?.gender,
      topics: [
        {
          title: project.projectTopics?.topicOne?.topic,
          status: project.projectTopics?.topicOne?.status,
        },
        {
          title: project.projectTopics?.topicTwo?.topic,
          status: project.projectTopics?.topicTwo?.status,
        },
        {
          title: project.projectTopics?.topicThree?.topic,
          status: project.projectTopics?.topicThree?.status,
        },
        {
          title: project.projectTopics?.topicFour?.topic,
          status: project.projectTopics?.topicFour?.status,
        },
      ],
      status: project.overallStatus,
      level: project.level,
      department: project.department,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));

    // Build separate count pipeline (excluding sort, skip, limit)
    const countPipeline: any[] = [
      { $match: baseMatch },
      {
        $lookup: {
          from: "users",
          localField: "projectCreator",
          foreignField: "_id",
          as: "creator",
        },
      },
      { $unwind: "$creator" },
    ];

    if (searchRegex) {
      countPipeline.push({
        $match: {
          $or: [
            { "creator.firstName": searchRegex },
            { "creator.lastName": searchRegex },
            { "creator.email": searchRegex },
            { overallStatus: searchRegex },
          ],
        },
      });
    }

    countPipeline.push({ $count: "count" });

    const countResult = await Project.aggregate(countPipeline);
    const totalCount = countResult[0]?.count || 0;

    return JSON.parse(
      JSON.stringify({
        status: "success",
        data: students,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
        },
      }),
    );
  } catch (error) {
    console.error("Error fetching students:", error);
    throw new Error("Internal server error.");
  }
}

export async function getStudentDetails(id: string) {
  try {
    await connectToDatabase();

    const student = await Project.findById({ projectCreator: id }); // Replace with your database function
    if (!student) {
      throw new Error("Student not found");
    }

    return { status: "success", data: student };
  } catch (error) {
    console.error(error);
    throw new Error("Internal Server Error");
  }
}

export const getApprovedStudents = async (
  supervisorId?: string,
  searchQuery?: string,
) => {
  try {
    await connectToDatabase();

    const query: any = {
      $and: [
        {
          $or: [
            { "projectTopics.topicOne.status": "approved" },
            { "projectTopics.topicTwo.status": "approved" },
            { "projectTopics.topicThree.status": "approved" },
            { "projectTopics.topicFour.status": "approved" },
          ],
        },
      ],
    };

    if (supervisorId) {
      query.$and.push({ supervisor: supervisorId });
    }

    // If searchQuery exists, find matching users and filter by their IDs
    if (searchQuery) {
      const searchTerms = searchQuery.split(" ");

      const nameConditions =
        searchTerms.length === 1
          ? {
              $or: [
                { firstName: { $regex: searchQuery, $options: "i" } },
                { lastName: { $regex: searchQuery, $options: "i" } },
                { email: { $regex: searchQuery, $options: "i" } },
              ],
            }
          : {
              $and: [
                { firstName: { $regex: searchTerms[0], $options: "i" } },
                { lastName: { $regex: searchTerms[1], $options: "i" } },
              ],
            };

      const matchingUsers = await User.find(nameConditions).select("_id");

      const matchingUserIds = matchingUsers.map((user) => user._id);

      query.$and.push({
        projectCreator: { $in: matchingUserIds },
      });
    }

    const projects = await Project.find(query).populate<{
      projectCreator: IUser;
    }>("projectCreator", "_id firstName lastName email");

    const projectsData = projects
      .map((project) => {
        if (project.projectCreator) {
          return {
            studentId: project.projectCreator._id,
            name: `${project.projectCreator.firstName} ${project.projectCreator.lastName}`,
            email: project.projectCreator.email,
            level: project.level,
            department: project.department,
            overallStatus: project.overallStatus,
          };
        }
        return null;
      })
      .filter(Boolean);

    return JSON.parse(JSON.stringify(projectsData));
  } catch (error) {
    console.error("Error fetching approved students:", error);
    throw new Error("Failed to fetch approved students.");
  }
};

export const rejectStudentProject = async (studentId: string) => {
  try {
    // Find and update the project for the given student
    const updatedProject = await Project.findOneAndUpdate(
      { projectCreator: studentId },
      {
        $set: {
          "projectTopics.topicOne.status": "rejected",
          "projectTopics.topicTwo.status": "rejected",
          "projectTopics.topicThree.status": "rejected",
          "projectTopics.topicFour.status": "rejected",
          overallStatus: "rejected",
        },
      },
      { new: true }, // Return the updated project
    );

    if (!updatedProject) {
      throw new Error("Project not found for the student.");
    }

    return { success: true, message: "Student's project has been rejected." };
  } catch (error) {
    console.error("Error rejecting student project:", error);
    throw new Error("Failed to reject student project.");
  }
};
