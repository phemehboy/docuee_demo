import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    mongoUserId: v.optional(v.string()), // reference to MongoDB _id
    clerkId: v.optional(v.string()), // Clerk authentication ID
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    username: v.optional(v.string()),
    userType: v.optional(v.string()),
    subscriptionType: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    picture: v.optional(v.string()),
    gender: v.optional(v.string()),
    school: v.optional(v.string()),
    department: v.optional(v.array(v.string())),
    level: v.optional(v.array(v.string())),
    studyMode: v.optional(v.array(v.string())),
    program: v.optional(v.array(v.string())),
    designation: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    country: v.optional(v.string()),
    timeZone: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    creditBalance: v.optional(v.number()), // 👈 added
    subscriptionCoveredByCredit: v.optional(v.boolean()),
    useCreditsAutomatically: v.optional(v.boolean()),
    nextBillingDate: v.optional(v.number()), // store timestamp
    expertise: v.optional(v.array(v.string())),
    yearsOfExperience: v.optional(v.number()),
    createdAt: v.number(), // timestamp
    updatedAt: v.number(),
  })
    .index("byClerkId", ["clerkId"])
    .index("byMongoId", ["mongoUserId"]),

  students: defineTable({
    userId: v.string(),
    school: v.optional(v.string()),
    department: v.optional(v.string()),
    level: v.optional(v.string()),
    program: v.optional(v.string()),
    studyMode: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("graduated"))),
    admissionNumber: v.optional(v.string()),
    cohortSerial: v.optional(v.number()),
    semester: v.optional(v.string()),
    session: v.optional(v.string()),
    createdAt: v.number(), // timestamp
    updatedAt: v.number(), // timestamp
  })
    .index("by_user_id", ["userId"])
    .index("by_school", ["school"])
    .index("by_course_match", [
      "school",
      "department",
      "level",
      "program",
      "semester",
      "session",
      "studyMode",
    ]),

  schools: defineTable({
    schoolMongoId: v.optional(v.string()), // reference to MongoDB _id
    name: v.optional(v.string()),
    adminId: v.string(),
    location: v.optional(v.string()),
    type: v.optional(v.string()),
    motto: v.optional(v.string()),
    projectCreditUnit: v.optional(v.number()),
    currentSemesterId: v.optional(v.string()),
    currentSemester: v.optional(v.string()),
    currentSession: v.optional(v.string()),
    promotionHistory: v.array(
      v.object({
        date: v.number(),
        promotedBy: v.id("users"),
        filters: v.object({
          department: v.optional(v.string()),
          program: v.optional(v.string()),
          level: v.optional(v.string()),
        }),
      })
    ),

    // ✅ Add this field
    projectStages: v.optional(v.array(v.string())),

    createdAt: v.number(), // timestamp
    updatedAt: v.number(), // timestamp
  })
    .index("by_school_mongo_id", ["schoolMongoId"])
    .index("by_admin_id", ["adminId"]),

  messages: defineTable({
    from: v.string(),
    to: v.string(),
    content: v.string(),
    timestamp: v.number(),
    read: v.boolean(),
    delivered: v.boolean(),

    // NEW
    contextType: v.optional(
      v.union(v.literal("direct"), v.literal("course"), v.literal("project"))
    ),
    contextId: v.optional(v.string()), // courseId or projectId
    senderRole: v.optional(
      v.union(
        v.literal("schoolAdmin"),
        v.literal("instructor"),
        v.literal("supervisor"),
        v.literal("student")
      )
    ),
  })
    .index("byConversation", ["from", "to"])
    .index("byRecipient", ["to", "from"])
    .index("byUnread", ["to", "read"])
    .index("byContext", ["contextType", "contextId"])
    .index("byRecipientContext", ["to", "contextType", "contextId"]),

  courseUpdates: defineTable({
    courseId: v.id("courses"),
    createdBy: v.string(),
    message: v.string(),
    timestamp: v.number(),
    readBy: v.array(v.string()), // Clerk IDs of users who have read it
  }).index("by_course", ["courseId"]),

  activeChats: defineTable({
    userId: v.string(), // current user
    otherUserId: v.string(), // user they are chatting with
    isActive: v.boolean(), // true if drawer open
    updatedAt: v.number(), // timestamp for last activity
  })
    .index("byUser", ["userId", "otherUserId"])
    .index("byOtherUser", ["otherUserId", "userId"]),

  typingStatus: defineTable({
    from: v.string(),
    to: v.string(),
    isTyping: v.boolean(),
    updatedAt: v.number(),
  }).index("byUsers", ["from", "to"]),

  courses: defineTable({
    title: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    courseId: v.string(),
    level: v.optional(v.string()),
    programType: v.optional(v.string()),
    levelId: v.optional(v.string()),
    department: v.optional(v.string()),
    program: v.optional(v.string()),
    departmentId: v.optional(v.string()),
    school: v.optional(v.string()),
    schoolId: v.optional(v.string()),
    semester: v.optional(v.string()),
    semesterId: v.optional(v.string()),
    session: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    createdBy: v.string(),
    instructors: v.optional(v.array(v.string())),
    students: v.optional(v.array(v.string())),
    studyMode: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
        })
      )
    ),
    creditUnits: v.optional(v.number()),
    courseType: v.union(v.literal("core"), v.literal("elective")),
  })
    .index("created_by", ["createdBy"])
    .index("level_Id", ["levelId"])
    .index("by_courseId", ["courseId"])
    .searchIndex("search_course_title", {
      searchField: "title",
      filterFields: [
        "createdBy",
        "courseId",
        "school",
        "department",
        "levelId",
      ],
    }),

  tasks: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(), // Clerk ID of instructor
    createdAt: v.number(),
    dueDate: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
  })
    .index("by_courseId", ["courseId"])
    .index("by_instructor", ["createdBy"]),

  task_assignments: defineTable({
    courseId: v.id("courses"),
    instructorId: v.string(), // Clerk user ID
    assignmentTitle: v.string(),
    tasks: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        maxGrade: v.number(),
      })
    ),
    studentIds: v.array(v.string()),
    studyModes: v.optional(v.array(v.string())),

    readonly: v.optional(v.boolean()),

    deadline: v.optional(v.number()),
    firstSubmissionNotified: v.optional(v.boolean()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_instructor", ["instructorId"]),

  task_submissions: defineTable({
    taskAssignmentId: v.id("task_assignments"), // Link to the batch of tasks
    taskIndex: v.number(), // Index of task in the tasks[] array (0, 1, 2, ...)
    studentId: v.string(), // Clerk ID of student

    answerText: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
    maxGrade: v.optional(v.number()),
    submittedAt: v.optional(v.number()),

    status: v.optional(v.string()),
    grade: v.optional(v.number()),
    feedback: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    gradedAt: v.optional(v.number()),
  })
    .index("by_student", ["studentId"])
    .index("by_task", ["taskAssignmentId", "taskIndex"]),

  total_grades: defineTable({
    taskAssignmentId: v.id("task_assignments"),
    studentId: v.string(),
    totalGrade: v.number(),
    averageGrade: v.number(),
    gradedAt: v.number(),
  }).index("by_assignment_student", ["taskAssignmentId", "studentId"]),

  saved_answers: defineTable({
    taskAssignmentId: v.id("task_assignments"),
    taskIndex: v.number(),
    studentId: v.string(),
    answerText: v.string(), // HTML from editor
    updatedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_task", ["taskAssignmentId", "taskIndex", "studentId"]),

  comments: defineTable({
    taskId: v.id("tasks"),
    authorId: v.string(), // Clerk ID
    content: v.string(),
    createdAt: v.number(),
  }),

  documents: defineTable({
    title: v.string(),
    name: v.optional(v.string()),
    initialContent: v.optional(v.string()),
    ownerId: v.string(),
    roomId: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    isOfficial: v.boolean(),
    supervisorEmail: v.optional(v.string()),
    overallStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("in-progress"),
        v.literal("completed"),
        v.literal("rejected")
      )
    ),
    studentUserType: v.optional(v.string()),
    studentEmail: v.optional(v.string()),
    studentUserId: v.optional(v.string()),
    studentSubscriptionType: v.optional(v.string()),
    isFineUnpaid: v.optional(v.boolean()),
    readonly: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner_id", ["ownerId"])
    .index("by_organization_id", ["organizationId"])
    .index("by_project_and_official", ["projectId", "isOfficial"])
    .index("by_supervisor_and_official", ["supervisorEmail", "isOfficial"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["ownerId", "organizationId"],
    }),

  assignments: defineTable({
    title: v.string(),
    name: v.optional(v.string()),
    initialContent: v.optional(v.string()),
    ownerId: v.string(),
    roomId: v.optional(v.string()),
    organizationId: v.optional(v.string()),
  })
    .index("by_owner_id", ["ownerId"])
    .index("by_organization_id", ["organizationId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["ownerId", "organizationId"],
    }),

  projects: defineTable({
    projectId: v.string(), // MongoDB _id
    projectType: v.optional(
      v.union(v.literal("project"), v.literal("journal"))
    ),
    generatedSlides: v.optional(
      v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          content: v.string(),
          aiAssisted: v.optional(v.boolean()),
          slideType: v.optional(v.string()),
          lastEditedBy: v.optional(v.string()),
          timestamp: v.optional(v.string()),
          editable: v.optional(v.boolean()),
        })
      )
    ),
    title: v.string(), // Approved topic
    organizationId: v.optional(v.string()),
    organizationMembers: v.optional(
      v.array(
        v.object({
          userClerkId: v.string(),
          joinedAt: v.string(), // ISO date string
        })
      )
    ),

    organizationOwnerClerkId: v.optional(v.string()),

    supervisorClerkId: v.optional(v.string()),
    studentMongoId: v.optional(v.string()),
    studentName: v.optional(v.string()),
    supervisorName: v.optional(v.string()),
    supervisorEmail: v.optional(v.string()),
    supervisorMongoId: v.optional(v.string()),
    overallStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("rejected")
    ),
    context: v.optional(
      v.union(v.literal("independent"), v.literal("institutional"))
    ),
    studentUserId: v.optional(v.string()),
    studentUserType: v.optional(v.string()),
    supervisorUserType: v.optional(v.string()),
    studentEmail: v.optional(v.string()),
    studentClerkId: v.optional(v.string()),
    studentSubscriptionType: v.optional(v.string()),
    schoolId: v.optional(v.string()),
    schoolName: v.optional(v.string()),
    studentCountry: v.optional(v.string()),
    hasSeenProjectOnboardingBySupervisor: v.optional(v.boolean()),
    hasSeenProjectOnboardingByProjectOwner: v.optional(v.boolean()),
    congratulated: v.optional(v.boolean()),

    currentStage: v.optional(v.string()),

    submissionStages: v.optional(
      v.record(
        v.string(),
        v.object({
          order: v.optional(v.number()),
          content: v.string(),
          submitted: v.boolean(),
          submittedAt: v.optional(v.string()),
          editableByStudent: v.optional(v.boolean()),
          completed: v.optional(v.boolean()),
          approvedAt: v.optional(v.string()),
          deadline: v.optional(v.string()),
          resubmitted: v.optional(v.boolean()), // 🆕 add this
          resubmittedCount: v.optional(v.number()), // 🆕 optional: how many times
          fine: v.optional(
            v.object({
              amount: v.number(),
              isPaid: v.boolean(),
              applied: v.optional(v.boolean()),
              reason: v.optional(v.string()),
              paidAt: v.optional(v.string()),
            })
          ),
          grade: v.optional(
            v.object({
              score: v.optional(v.number()),
              comment: v.optional(v.string()),
              gradedAt: v.optional(v.number()),
            })
          ),
        })
      )
    ),
    stagesLockedBySupervisor: v.optional(v.boolean()),

    group: v.optional(
      v.object({
        groupId: v.optional(v.string()),
        groupName: v.optional(v.string()),
        groupSupervisor: v.optional(
          v.object({
            clerkId: v.optional(v.string()),
            mongoId: v.optional(v.string()),
            name: v.optional(v.string()),
            email: v.optional(v.string()),
          })
        ),
        groupStudents: v.optional(
          v.array(
            v.object({
              clerkId: v.optional(v.string()),
              mongoId: v.optional(v.string()),
              studentId: v.optional(v.string()),
              name: v.optional(v.string()),
              email: v.optional(v.string()),
            })
          )
        ),
      })
    ),

    session: v.optional(v.string()), // e.g. "2024/2025"
    semesterId: v.optional(v.string()),
    creditUnits: v.optional(v.number()), // e.g. 6

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("projectId", ["projectId"])
    .index("by_studentClerkId", ["studentClerkId"])
    .index("by_organization", ["organizationId"]),

  aiActions: defineTable({
    projectId: v.id("projects"), // Convex project reference
    projectMongoId: v.string(), // Mongo projectId (for cross-system joins)

    userClerkId: v.string(),
    userMongoId: v.optional(v.string()),

    actionType: v.union(
      v.literal("GENERATE_OUTLINE"),
      v.literal("SUMMARIZE_STAGE"),
      v.literal("FIND_STAGE_GAPS"),
      v.literal("CHECK_TONE"),
      v.literal("STRUCTURE_SECTION"),
      v.literal("EXPLAIN_SECTION"),
      v.literal("IMPROVE_CLARITY"),
      v.literal("FIND_GAPS")
    ),

    usedSelection: v.boolean(),
    selectionLength: v.optional(v.number()),
    documentLength: v.number(),

    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userClerkId"])
    .index("by_project_action", ["projectId", "actionType"]),

  aiInsertions: defineTable({
    projectId: v.id("projects"),
    projectMongoId: v.string(),

    userClerkId: v.optional(v.string()),
    userMongoId: v.optional(v.string()),

    actionType: v.union(
      v.literal("GENERATE_OUTLINE"),
      v.literal("SUMMARIZE_STAGE"),
      v.literal("FIND_STAGE_GAPS"),
      v.literal("CHECK_TONE"),
      v.literal("STRUCTURE_SECTION"),
      v.literal("EXPLAIN_SECTION"),
      v.literal("IMPROVE_CLARITY"),
      v.literal("FIND_GAPS")
    ),

    stageKey: v.string(),

    editorNodeId: v.string(), // data-ai-id attached to TipTap node

    originalTextHash: v.string(),
    originalTextLength: v.number(),

    insertedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_stage", ["projectId", "stageKey"])
    .index("by_editorNodeId", ["editorNodeId"])
    .index("by_user", ["userClerkId"]),

  aiContentState: defineTable({
    aiInsertionId: v.id("aiInsertions"),

    currentTextHash: v.string(),
    currentTextLength: v.number(),

    editCount: v.number(),
    wasDeleted: v.boolean(),

    editIntensity: v.union(
      v.literal("NONE"),
      v.literal("LOW"),
      v.literal("MEDIUM"),
      v.literal("HIGH")
    ),

    stageKey: v.string(),

    firstEditAt: v.optional(v.number()),
    lastEditAt: v.optional(v.number()),

    updatedAt: v.number(),
  }).index("by_insertion", ["aiInsertionId"]),

  notifications: defineTable({
    clerkId: v.string(),
    projectId: v.id("projects"),
    message: v.string(),
    type: v.string(), // e.g. "submission", "approval"
    read: v.boolean(),
    createdAt: v.number(),
  }).index("byClerk", ["clerkId"]),
});
