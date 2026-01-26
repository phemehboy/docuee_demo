import { Liveblocks } from "@liveblocks/node";
import { currentUser } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { getUserColor } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex/convexClient";

type UserType =
  | "student"
  | "supervisor"
  | "instructor"
  | "owner"
  | "member"
  | "guest";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

const convexClient = getConvexClient();

export async function POST(req: Request) {
  console.log("LIVEBLOCKS_SECRET_KEY:", !!process.env.LIVEBLOCKS_SECRET_KEY);

  try {
    const user = await currentUser();
    console.log("Current user:", user?.fullName);

    if (!user) {
      console.log("No user session found");
      return new Response(
        JSON.stringify({ error: "Unauthorized: No user session" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { room } = await req.json();

    if (!room || typeof room !== "string") {
      console.log("Invalid or missing room:", room);
      return new Response(
        JSON.stringify({ error: "Bad Request: Missing or invalid room" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const [projectId] = room.split("_");

    // 🔍 Fetch project
    const project = await convexClient.query(api.projects.getProjectById, {
      id: projectId as Id<"projects">,
    });

    if (!project || typeof project === "string") {
      console.log("Project not found");
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 🔍 Fetch DB user
    const dbUser = await convexClient.query(api.users.getByClerkId, {
      clerkId: user.id,
    });

    console.log("DB user:", dbUser?.firstName);

    if (!dbUser) {
      console.log("User not found in DB");
      return new Response(JSON.stringify({ error: "User not found in DB" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 🧩 Extract group project data if available
    const group = project.group;
    const groupStudents = group?.groupStudents ?? [];
    const groupSupervisor = group?.groupSupervisor;
    const isGroupProject = !!group && groupStudents.length > 0;

    // 🔑 Role checks
    const isOwner = project.organizationOwnerClerkId === user.id;
    const isOrganizationMember =
      project.organizationMembers?.some(
        (member) => member.userClerkId === user.id
      ) ?? false;

    const isSupervisor =
      project.supervisorClerkId === user.id ||
      groupSupervisor?.clerkId === user.id;

    // ✅ Determine if user is a student
    const isStudent = isGroupProject
      ? groupStudents.some((s) => s.clerkId === user.id)
      : project.studentClerkId === user.id;

    // 🚫 Restrict students without subscription
    if (
      isStudent &&
      project.overallStatus !== "completed" &&
      !(
        ["premium", "pro"].includes(dbUser?.subscriptionType ?? "") ||
        dbUser.subscriptionCoveredByCredit === true
      )
    ) {
      console.log("Blocked: Student without premium subscription");
      return new Response(
        JSON.stringify({
          error: "Unauthorized: Premium subscription required",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🚫 Restrict if user has no role
    if (!isOwner && !isOrganizationMember && !isSupervisor && !isStudent) {
      console.log("Blocked: User has no role in project");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Access denied" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🧠 Determine display name and user type
    let name = "Anonymous";
    let usertype: UserType = "guest";

    if (isStudent) {
      if (isGroupProject) {
        const thisStudent = groupStudents.find((s) => s.clerkId === user.id);
        name = thisStudent?.name ?? "Group Student";
      } else {
        name = project.studentName ?? "Student";
      }
      usertype = "student";
    } else if (isSupervisor) {
      if (isGroupProject) {
        name = groupSupervisor?.name ?? "Group Supervisor";
      } else {
        name = project.supervisorName ?? "Supervisor";
      }
      usertype = "supervisor";
    } else if (isOwner) {
      name = "Organization Owner";
      usertype = "owner";
    } else if (isOrganizationMember) {
      name = "Organization Member";
      usertype = "member";
    }

    // 🧩 Create Liveblocks session
    const session = liveblocks.prepareSession(user.id, {
      userInfo: {
        name: `${name} (${usertype})`,
        avatar: user.imageUrl,
        color: getUserColor(user.id),
        userType: usertype,
      },
    });

    session.allow(room, session.FULL_ACCESS);

    const { body, status } = await session.authorize();

    console.log("Liveblocks session authorized:", { status });

    return new Response(body, { status });
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
