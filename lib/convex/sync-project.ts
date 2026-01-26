import {
  IProject,
  ProjectType,
  SubmissionStage,
} from "../database/models/project.model";
import { IUser } from "../database/models/user.model";
import Organization, {
  MemberEntry,
} from "../database/models/organization.model";
import { IStudent } from "../database/models/student.model";
import Group from "../database/models/group.model";

function normalizeStage(stage: any) {
  if (!stage)
    return {
      content: "",
      submitted: false,
      editableByStudent: true,
      completed: false,
    };

  return {
    content: String(stage.content ?? ""),
    submitted: Boolean(stage.submitted ?? false),
    editableByStudent:
      stage.editableByStudent === undefined
        ? true
        : Boolean(stage.editableByStudent),
    completed: stage.completed === undefined ? false : Boolean(stage.completed),
    submittedAt: stage.submittedAt
      ? new Date(stage.submittedAt).toISOString()
      : undefined,
    approvedAt: stage.approvedAt
      ? new Date(stage.approvedAt).toISOString()
      : undefined,
    deadline: stage.deadline
      ? new Date(stage.deadline).toISOString()
      : undefined,
    fine: stage.fine
      ? {
          amount: Number(stage.fine.amount ?? 0),
          isPaid: Boolean(stage.fine.isPaid ?? false),
          applied: Boolean(stage.fine.applied ?? false),
          reason: stage.fine.reason ? String(stage.fine.reason) : undefined,
          paidAt: stage.fine.paidAt
            ? new Date(stage.fine.paidAt).toISOString()
            : undefined,
        }
      : undefined,
    grade: stage.grade
      ? {
          score:
            stage.grade.score === undefined
              ? undefined
              : Number(stage.grade.score),
          comment: stage.grade.comment
            ? String(stage.grade.comment)
            : undefined,
          gradedAt: stage.grade.gradedAt
            ? new Date(stage.grade.gradedAt).toISOString()
            : undefined,
        }
      : undefined,
    order: stage.order ?? 0, // ensure order is always present
  };
}

export async function buildConvexProjectPayload(
  project: IProject,
  options: { requireSupervisor?: boolean } = {}
) {
  const creator = project.projectCreator as IStudent | undefined;
  const student = creator && (creator.userId as IUser | undefined);
  const supervisor = project.supervisorId as IUser | undefined;

  const { requireSupervisor = true } = options;

  console.log("Student user:", student);
  console.log("Student clerkId:", student?.clerkId);
  console.log("Project context:", project.context);
  console.log("Supervisor:", supervisor);

  // Only use school if the project is institutional
  const school =
    project.context === "institutional" ? (project.schoolId as any) : undefined;

  // ✅ Only require supervisor if the project is institutional
  if (
    !project._id ||
    !creator ||
    !student?.clerkId ||
    (requireSupervisor && !supervisor?.clerkId)
  ) {
    throw new Error(
      "Missing required project, supervisor, or creator fields for Convex sync."
    );
  }

  // Fetch organization members
  let organizationMembers: Array<{ userClerkId: string; joinedAt: string }> =
    [];
  let ownerClerkId: string | undefined = undefined;

  if (project.organizationId) {
    const organization = await Organization.findById(
      project.organizationId
    ).populate("createdBy", "clerkId");

    if (organization) {
      ownerClerkId = organization.createdBy
        ? (organization.createdBy as IUser).clerkId
        : undefined;

      organizationMembers = organization.members.map((member: MemberEntry) => ({
        userClerkId: member.userClerkId,
        joinedAt: member.joinedAt.toISOString(),
      }));
    }
  }

  let groupData: {
    groupId?: string;
    groupName?: string;
    groupSupervisor?: {
      clerkId?: string;
      mongoId?: string;
      name?: string;
      email?: string;
    };
    groupStudents?: Array<{
      clerkId?: string;
      mongoId?: string;
      studentId?: string;
      name?: string;
      email?: string;
    }>;
  } = {};

  if (project.groupId) {
    const group = await Group.findById(project.groupId)
      .populate("supervisor")
      .populate({
        path: "students",
        populate: { path: "userId" }, // to get user details from Student
      });

    if (group) {
      // 🧑‍🏫 Supervisor of the group
      const groupSupervisor = group.supervisor as any;

      // 👩‍🎓 Group students
      const groupStudents = (group.students || []).map((student: any) => {
        const user = student.userId;
        return {
          clerkId: user?.clerkId,
          mongoId: user?._id?.toString(),
          studentId: student?._id?.toString(),
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email,
        };
      });

      groupData = {
        groupId: group._id.toString(),
        groupName: group.name,
        groupSupervisor: groupSupervisor
          ? {
              clerkId: groupSupervisor.clerkId,
              mongoId: groupSupervisor._id.toString(),
              name: `${groupSupervisor.firstName || ""} ${groupSupervisor.lastName || ""}`.trim(),
              email: groupSupervisor.email,
            }
          : undefined,
        groupStudents,
      };
    }
  }

  const approvedTopic =
    Object.values(project.projectTopics).find(
      (topic) => topic.status === "approved"
    )?.topic || "Untitled Project";

  // Convert Mongo stages to array and normalize
  const rawStages =
    project.submissionStages && typeof project.submissionStages === "object"
      ? project.submissionStages instanceof Map
        ? Object.fromEntries(project.submissionStages)
        : project.submissionStages
      : {};

  const submissionStagesArray = Object.entries(rawStages)
    .map(([stageName, stageData], index) => {
      const stage = stageData as Partial<SubmissionStage>; // ← cast to proper type
      const normalized = normalizeStage(stage);
      return {
        stageName,
        order: stage.order ?? index, // fallback to index if order missing
        ...normalized,
      };
    })
    .sort((a, b) => a.order - b.order);

  // Transform back into record keyed by stageName
  const submissionStages: Record<string, any> = {};
  submissionStagesArray.forEach((stage) => {
    const { stageName, order, ...rest } = stage;
    submissionStages[stageName] = { ...rest, order }; // keep order in payload
  });

  // Determine currentStage
  const currentStage = project.currentStage
    ? String(project.currentStage)
    : Object.keys(submissionStages)[0] || "proposal";

  // Supervisor payload only for institutional projects
  let supervisorPayload: {
    supervisorClerkId?: string;
    supervisorEmail?: string;
    supervisorMongoId?: string;
    supervisorUserType?: string;
    supervisorName?: string;
  } = {};

  if (supervisor) {
    supervisorPayload = {
      supervisorClerkId: supervisor.clerkId,
      supervisorEmail: supervisor.email,
      supervisorMongoId: supervisor._id.toString(),
      supervisorUserType: supervisor.userType || "supervisor",
      supervisorName:
        `${supervisor.firstName || ""} ${supervisor.lastName || ""}`.trim(),
    };
  }

  // Build payload
  return {
    projectId: project._id.toString(),
    title: approvedTopic,
    organizationId: project.organizationId?.toString() || undefined,

    studentClerkId: student.clerkId,
    studentMongoId: creator._id.toString(),
    studentName: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
    studentUserId: student._id.toString(),
    studentUserType: student.userType || "student",
    studentEmail: student.email,
    studentSubscriptionType: student.subscriptionType,
    studentCountry: student.country,

    overallStatus: project.overallStatus,

    schoolId: school?._id?.toString() || undefined,
    schoolName: school?.name?.toString() ?? undefined,
    session: school?.currentSession ?? undefined, // ✅ optional chaining
    semesterId: school?.currentSemester?._id?.toString() ?? undefined, // ✅ optional chaining
    creditUnits: school?.projectCreditUnit ?? undefined, // ✅ optional chaining

    currentStage,
    submissionStages,
    organizationMembers,
    organizationOwnerClerkId: ownerClerkId,
    // ✅ Group project data
    group: groupData,
    context: project.context,
    projectType:
      project.projectType === "journal"
        ? "journal"
        : ("project" as ProjectType),

    ...supervisorPayload,
  };
}
