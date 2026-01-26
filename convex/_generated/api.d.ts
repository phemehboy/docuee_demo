/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activeChats from "../activeChats.js";
import type * as ai_aiActions from "../ai/aiActions.js";
import type * as ai_aiInsertions from "../ai/aiInsertions.js";
import type * as ai_getAiSupervisorSummary from "../ai/getAiSupervisorSummary.js";
import type * as ai_queries from "../ai/queries.js";
import type * as courseUpdates_markAllAsReadByCourse from "../courseUpdates/markAllAsReadByCourse.js";
import type * as courseUpdates_markAsRead from "../courseUpdates/markAsRead.js";
import type * as courseUpdates_unreadByCourse from "../courseUpdates/unreadByCourse.js";
import type * as courses from "../courses.js";
import type * as documents from "../documents.js";
import type * as enforceFines from "../enforceFines.js";
import type * as internal_enforceFines from "../internal/enforceFines.js";
import type * as internal_notifications from "../internal/notifications.js";
import type * as messages_markAsRead from "../messages/markAsRead.js";
import type * as messages_sendMessage from "../messages/sendMessage.js";
import type * as messages_unreadByCourse from "../messages/unreadByCourse.js";
import type * as notifications from "../notifications.js";
import type * as projects from "../projects.js";
import type * as schools from "../schools.js";
import type * as slides from "../slides.js";
import type * as students from "../students.js";
import type * as submissions from "../submissions.js";
import type * as task_assignments from "../task_assignments.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activeChats: typeof activeChats;
  "ai/aiActions": typeof ai_aiActions;
  "ai/aiInsertions": typeof ai_aiInsertions;
  "ai/getAiSupervisorSummary": typeof ai_getAiSupervisorSummary;
  "ai/queries": typeof ai_queries;
  "courseUpdates/markAllAsReadByCourse": typeof courseUpdates_markAllAsReadByCourse;
  "courseUpdates/markAsRead": typeof courseUpdates_markAsRead;
  "courseUpdates/unreadByCourse": typeof courseUpdates_unreadByCourse;
  courses: typeof courses;
  documents: typeof documents;
  enforceFines: typeof enforceFines;
  "internal/enforceFines": typeof internal_enforceFines;
  "internal/notifications": typeof internal_notifications;
  "messages/markAsRead": typeof messages_markAsRead;
  "messages/sendMessage": typeof messages_sendMessage;
  "messages/unreadByCourse": typeof messages_unreadByCourse;
  notifications: typeof notifications;
  projects: typeof projects;
  schools: typeof schools;
  slides: typeof slides;
  students: typeof students;
  submissions: typeof submissions;
  task_assignments: typeof task_assignments;
  tasks: typeof tasks;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
