import { IUser } from "./database/models/user.model";

export function getBannerMessage(user: IUser, isMobile: boolean = false) {
  const userType = user?.userType;
  const hod = user?.isHOD;

  if (userType === "student") {
    return isMobile
      ? "📘 Assignments, projects & messages"
      : `📘 You have access to your courses and assignments. Keep learning, ${user.firstName}!`;
  }

  if (userType === "instructor" && hod) {
    return isMobile
      ? "📊 Dept courses & collaboration"
      : "📊 Monitor your department, give assignments, and supervise projects.";
  }

  if (userType === "instructor") {
    return isMobile
      ? "📚 Review submissions & engage"
      : "📚 Review pending submissions and track student progress.";
  }

  if (userType === "supervisor") {
    return isMobile
      ? "📂 Guide & track student projects"
      : "📂 Oversee student projects and guide them through collaboration.";
  }

  if (userType === "schoolAdmin") {
    return isMobile
      ? "🏫 Manage school operations"
      : "🏫 Oversee all school operations, users, and academic activities.";
  }

  return "Welcome back!";
}
