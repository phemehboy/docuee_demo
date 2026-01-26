import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import queryString from "query-string";
import sanitizeHtml from "sanitize-html";

import { IProject, ProjectTopics } from "./database/models/project.model";
import { AssessmentCard } from "@/types";
import { ProjectDTO } from "@/types/project";
import { keyToLabel } from "./stages";

export const getCurrentStageKey = (stages: Record<string, any>) => {
  // Convert to array and sort by order
  const sortedStages = Object.entries(stages).sort(
    ([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0),
  );

  // Return the first incomplete stage, or last stage if all completed
  for (const [key, value] of sortedStages) {
    if (!value.completed) return { key, label: value.label || keyToLabel(key) };
  }

  // If all completed, return last stage
  const lastStage = sortedStages[sortedStages.length - 1];
  return {
    key: lastStage[0],
    label: lastStage[1].label || keyToLabel(lastStage[0]),
  };
};

export function hashText(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

export function convertFileToUrl(file: File | string) {
  return typeof file === "string" ? file : URL.createObjectURL(file);
}

export const getProjectApprovedTitle = (project: ProjectDTO) => {
  if (!project?.projectTopics) return "No project topics available";

  const approvedTopic = Object.values(project.projectTopics).find(
    (topic: any) => topic.status === "approved",
  );

  return approvedTopic?.topic || "No approved project topic available";
};

export function isPopulatedProgram(p: any): p is {
  _id: string;
  type: string;
  department?: { _id: string; name: string };
} {
  return (
    p && typeof p === "object" && "_id" in p && "type" in p && "department" in p
  );
}

export function getOrdinal(n: number): string {
  if (n >= 11 && n <= 13) return n + "th"; // special case for 11,12,13
  switch (n % 10) {
    case 1:
      return n + "st";
    case 2:
      return n + "nd";
    case 3:
      return n + "rd";
    default:
      return n + "th";
  }
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export function normalizeStringOrObjectArray(value?: any): string[] {
  if (!value) return [];

  // Case 1: Already strings
  if (Array.isArray(value) && typeof value[0] === "string") return value;

  // Case 2: Array of objects like { name: "Full-time" }
  if (Array.isArray(value) && typeof value[0] === "object")
    return value.map((v) => v.name || "").filter(Boolean);

  // Case 3: Single string
  if (typeof value === "string") return [value];

  return [];
}

// utils/normalizeUser.ts
export function normalizeUser(user: any) {
  /**
   * Cases we must handle:
   * - Plain user: { firstName, lastName, program: string[], level: string[], studyMode: string[] }
   * - Convex normalUser wrapper: { _id, userId: { ...base user... }, expertise, yearsOfExperience }
   * - Mongo wrapper (older shape): { _id, userId: {...}, ... } where userId contains nested level/program objects
   *
   * Strategy:
   * - If user.userId && (user.expertise !== undefined || user.yearsOfExperience !== undefined) =>
   *    treat as Convex wrapper: base = user.userId; meta = user (expertise/yearsOfExperience live on outer)
   * - Else if user.userId => treat as wrapper but prefer to inspect base shape to decide nested vs flat
   * - Else: base = user (plain)
   */

  const looksLikeConvexWrapper =
    !!user &&
    typeof user === "object" &&
    !!user.userId &&
    (user.expertise !== undefined || user.yearsOfExperience !== undefined);

  const looksLikeAnyWrapper =
    !!user && typeof user === "object" && !!user.userId;

  let base: any;
  let meta: any = {}; // optional outer metadata (expertise, yearsOfExperience, etc)

  if (looksLikeConvexWrapper) {
    base = user.userId;
    meta = user; // contains expertise, yearsOfExperience, maybe others
  } else if (looksLikeAnyWrapper) {
    // Could be Mongo wrapper or other wrapper. Use the inner object as base,
    // but still capture outer meta if present.
    base = user.userId;
    meta = user;
  } else {
    base = user;
    meta = {};
  }

  // Helper: if `val` is array of objects with `.name`, convert to strings; if array of strings, pass through.
  const normalizeStringArray = (val: any): string[] | undefined => {
    if (!val) return undefined;
    if (Array.isArray(val)) {
      if (val.length === 0) return undefined;
      if (typeof val[0] === "string") return val.map((s) => String(s).trim());
      if (typeof val[0] === "object" && val[0] !== null) {
        // try .name first, then fallback to string conversion
        return val
          .map((o) => (o && (o.name ?? o.type ?? o)) as any)
          .map((v) => (v === undefined || v === null ? "" : String(v).trim()))
          .filter(Boolean);
      }
    }
    if (typeof val === "string") return [val.trim()];
    return undefined;
  };

  // Program / level / studyMode extraction with several fallbacks
  // 1) If base.level is array of objects (Mongo): use object mapping
  // 2) If base.program is array of strings: use that
  // 3) If outer meta has program/level (rare): pick that
  const programFromBase =
    // Mongo shape: base.level may be objects with program inside
    Array.isArray(base.level) &&
    base.level.length &&
    typeof base.level[0] === "object"
      ? base.level
          .map((lvl: any) => {
            const program = lvl.program;
            if (!program) return lvl.name ?? undefined;
            const programType = program.type || "Program";
            const departmentName = program.department?.name || "Department";
            return `${programType} - ${departmentName} (${lvl.name ?? ""})`.trim();
          })
          .filter(Boolean)
      : (normalizeStringArray(base.program) ?? undefined);

  const program =
    programFromBase ||
    normalizeStringArray(meta.program) ||
    normalizeStringArray(base.department) || // fallback to department if program missing
    undefined;

  // studyMode: could be array of objects, array of strings or single string
  const studyMode =
    normalizeStringArray(base.studyMode) ||
    normalizeStringArray(meta.studyMode) ||
    undefined;

  // level simple fallback: if base.level is array of strings
  const level =
    Array.isArray(base.level) &&
    base.level.length &&
    typeof base.level[0] === "string"
      ? (base.level as string[])
      : undefined;

  // Determine role/designation:
  // Mongo nested: base.designation?.name
  // Flat Convex: base.designation may be string
  // Outer meta might also carry designation in some shapes
  const role =
    (base && (base.designation?.name || base.designation)) ||
    meta.designation ||
    "USER";

  // Expertise & experience may be on meta (wrapper) or base
  const expertise = meta.expertise ?? base.expertise ?? [];
  const experience = meta.yearsOfExperience ?? base.yearsOfExperience ?? 0;

  // Build normalized program string for display (same shape as before: single string or undefined)
  const programDisplay = Array.isArray(program) ? program.join(", ") : program;
  const studyModeDisplay = Array.isArray(studyMode)
    ? studyMode.join(", ")
    : studyMode;
  const levelDisplay = Array.isArray(level) ? level.join(", ") : level;

  return {
    fullName:
      `${(base.firstName || "").trim()} ${(base.lastName || "").trim()}`.trim(),
    picture: base.picture,
    role: role || "USER",
    email: base.email,
    phone: base.phone,
    // keep program/studyMode/level as strings (same UI contract as UserProfileDrawer)
    program: programDisplay,
    studyMode: studyModeDisplay,
    level: levelDisplay,
    expertise,
    experience,
  };
}

export function getDashboardPath(
  userId: string,
  userType: string,
  subPage?: string, // e.g., "students", "projects", "notifications"
) {
  const trimmedSubPage = subPage ? `/${subPage.replace(/^\/|\/$/g, "")}` : "";
  return `/user/${userId}/usertype/${userType}/dashboard${trimmedSubPage}`;
}

export function stripHtmlTags(html: string): string {
  if (typeof window !== "undefined") {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  } else {
    return html.replace(/<[^>]*>/g, ""); // fallback on server
  }
}

export function safeHtml(input: string) {
  return sanitizeHtml(input, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt"],
    },
  });
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleError = (error: unknown) => {
  console.error(error);

  if (error instanceof Error) {
    throw error; // preserve the original message
  } else if (typeof error === "string") {
    throw new Error(error);
  } else {
    throw new Error("An unknown error occurred");
  }
};

export function encryptKey(passkey: string) {
  return btoa(passkey);
}

export function decryptKey(passkey: string) {
  return atob(passkey);
}

// Helper function to check if any topic is already approved
export const isAnyTopicApproved = (
  projectTopics: IProject["projectTopics"],
) => {
  return Object.values(projectTopics).some(
    (topic) => topic.status === "approved",
  );
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string | "" | null;
}

export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  const currentUrl = queryString.parse(params);

  currentUrl[key] = value;

  return queryString.stringifyUrl(
    { url: window.location.pathname, query: currentUrl },
    { skipNull: true },
  );
};

interface removeUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export const removeKeysFromQuery = ({
  params,
  keysToRemove,
}: removeUrlQueryParams) => {
  const currentUrl = queryString.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return queryString.stringifyUrl(
    { url: window.location.pathname, query: currentUrl },
    { skipNull: true },
  );
};

export const findApprovedTopic = (projectTopics: ProjectTopics) => {
  const approvedTopic = Object.values(projectTopics).find(
    (topic) => topic.status === "approved",
  );

  // If an approved topic exists, return it
  return approvedTopic ? approvedTopic.topic : null; // Return null if no approved topic found
};

export const capitalizeFirstLetter = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

// Function to generate a random color in hex format, excluding specified colors
export function getRandomColor() {
  const avoidColors = ["#000000", "#FFFFFF", "#8B4513"]; // Black, White, Brown in hex format

  let randomColor;
  do {
    // Generate random RGB values
    const r = Math.floor(Math.random() * 256); // Random number between 0-255
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    // Convert RGB to hex format
    randomColor = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
  } while (avoidColors.includes(randomColor));

  return randomColor;
}

export const brightColors = [
  "#2E8B57", // Darker Neon Green
  "#FF6EB4", // Darker Neon Pink
  "#00CDCD", // Darker Cyan
  "#FF00FF", // Darker Neon Magenta
  "#FF007F", // Darker Bright Pink
  "#FFD700", // Darker Neon Yellow
  "#00CED1", // Darker Neon Mint Green
  "#FF1493", // Darker Neon Red
  "#00CED1", // Darker Bright Aqua
  "#FF7F50", // Darker Neon Coral
  "#9ACD32", // Darker Neon Lime
  "#FFA500", // Darker Neon Orange
  "#32CD32", // Darker Neon Chartreuse
  "#ADFF2F", // Darker Neon Yellow Green
  "#DB7093", // Darker Neon Fuchsia
  "#00FF7F", // Darker Spring Green
  "#FFD700", // Darker Electric Lime
  "#FF007F", // Darker Bright Magenta
  "#FF6347", // Darker Neon Vermilion
];

export function getUserColor(userId: string) {
  let sum = 0;
  for (let i = 0; i < userId.length; i++) {
    sum += userId.charCodeAt(i);
  }

  const colorIndex = sum % brightColors.length;
  return brightColors[colorIndex];
}

export const dateConverter = (timestamp: string): string => {
  const timestampNum = Math.round(new Date(timestamp).getTime() / 1000);
  const date: Date = new Date(timestampNum * 1000);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = diff / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  switch (true) {
    case diffInDays > 7:
      return `${Math.floor(diffInDays / 7)} weeks ago`;
    case diffInDays >= 1 && diffInDays <= 7:
      return `${Math.floor(diffInDays)} days ago`;
    case diffInHours >= 1:
      return `${Math.floor(diffInHours)} hours ago`;
    case diffInMinutes >= 1:
      return `${Math.floor(diffInMinutes)} minutes ago`;
    default:
      return "Just now";
  }
};

export const resizeHandleStyle = (
  vertical: "top" | "bottom",
  horizontal: "left" | "right",
) => ({
  width: 10,
  height: 10,
  backgroundColor: "blue",
  position: "absolute" as const,
  [vertical]: -5,
  [horizontal]: -5,
  cursor: `${vertical}-${horizontal}-resize`,
});

export function isTopicApproved(projectTopics: any): boolean {
  if (!projectTopics || typeof projectTopics !== "object") {
    return false; // Or handle it in a way that fits your logic
  }
  return Object.values(projectTopics).some(
    (topic: any) => topic.status === "approved",
  );
}

export function isAllTopicsPending(projectTopics: any): boolean {
  if (!projectTopics || typeof projectTopics !== "object") {
    return false; // Or handle it in a way that fits your logic
  }
  return Object.values(projectTopics).every(
    (topic: any) => topic.status === "pending",
  );
}

export const isAllTopicRejected = (
  projectTopics: IProject["projectTopics"],
) => {
  if (!projectTopics || typeof projectTopics !== "object") {
    return false; // or handle the error appropriately
  }
  return Object.values(projectTopics).every(
    (topic) => topic.status === "rejected",
  );
};

export const areAllTopicsRejected = (projectTopics: any) => {
  if (!projectTopics) return false;
  const statuses = Object.values(projectTopics).map(
    (topic: any) => topic.status,
  );
  return statuses.every((status: string) => status === "rejected");
};

export const getTimeStamp = (date: Date): string => {
  date = new Date(date);
  const currentTime = new Date();
  const milliseconds = currentTime.getTime() - date.getTime();
  const seconds = Math.floor(milliseconds / 1000);
  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  let counter;

  for (const key in intervals) {
    if (Object.prototype.hasOwnProperty.call(intervals, key)) {
      counter = Math.floor(seconds / intervals[key as keyof typeof intervals]);
      if (counter > 0) {
        if (counter === 1) {
          return `${counter} ${key} ago`;
        } else {
          return `${counter} ${key}s ago`;
        }
      }
    }
  }

  return "Just now";
};

export const isAssessmentEditable = (assessment: AssessmentCard) => {
  const now = new Date();

  // Convert proposedStart into a real Date at the beginning of that day (local time)
  const startRaw = assessment.deptAssessment.proposedStart
    ? new Date(assessment.deptAssessment.proposedStart)
    : null;

  const start = startRaw
    ? new Date(
        startRaw.getFullYear(),
        startRaw.getMonth(),
        startRaw.getDate(),
        0,
        0,
        0,
        0,
      )
    : null;

  // Convert proposedEnd into a Date at the end of that day (local time)
  const endRaw = assessment.deptAssessment.proposedEnd
    ? new Date(assessment.deptAssessment.proposedEnd)
    : null;

  const end = endRaw
    ? new Date(
        endRaw.getFullYear(),
        endRaw.getMonth(),
        endRaw.getDate(),
        23,
        59,
        59,
        999,
      )
    : null;

  // ❌ Cannot edit BEFORE start date
  if (start && now < start) return false;

  // ❌ Cannot edit AFTER end-of-day
  if (end && now > end) return false;

  return true;
};

export const pluralize = (word: string) => {
  if (word.toLowerCase() === "quiz") return "quizzes";
  return word.toLowerCase() + "s";
};

export function formatStartTime(start: Date) {
  const now = new Date();

  // Reset time portion to 0:00 for both dates
  const startDate = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round(
    (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // <-- show AM/PM
  };

  const timeString = new Intl.DateTimeFormat("en-US", options).format(start);

  if (diffDays === 0) return `Today at ${timeString}`;
  if (diffDays === 1) return `Tomorrow at ${timeString}`;
  if (diffDays <= 7) return `In ${diffDays} days at ${timeString}`;

  // Fallback: full date with AM/PM
  return start.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export const findNextDueDate = (assignments: any[]) => {
  if (assignments.length === 0) return null;
  const sortedAssignments = assignments
    .filter((a) => a.dueDate) // Only consider assignments with due dates
    .map((a) => new Date(a.dueDate)) // Convert to Date objects
    .sort((a, b) => a.getTime() - b.getTime()); // Sort by earliest due date
  return sortedAssignments.length > 0 ? sortedAssignments[0] : null;
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const getPricingRedirect = () => {
  const currentUrl = window.location.pathname + window.location.search;
  return `/pricing?callbackUrl=${encodeURIComponent(currentUrl)}`;
};
