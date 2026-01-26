import { mutation, query } from "@/convex/_generated/server";
import { ConvexError, v } from "convex/values";

export const updateUserByClerkId = mutation({
  args: {
    clerkId: v.string(),
    department: v.optional(v.array(v.string())),
    level: v.optional(v.array(v.string())),
    studyMode: v.optional(v.array(v.string())),
    program: v.optional(v.array(v.string())),
    designation: v.optional(v.string()),
    updatedAt: v.number(),
  },
  //here
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return null;

    await ctx.db.patch(user._id, {
      department: args.department,
      level: args.level,
      studyMode: args.studyMode,
      program: args.program,
      designation: args.designation,
      updatedAt: args.updatedAt,
    });

    return { success: true };
  },
});

export const getUserByMongoUserId = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byMongoId", (q) => q.eq("mongoUserId", id))
      .first();

    if (!user) throw new Error("Project not found");

    return user;
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .unique();
  },
});

export const updateUserRole = mutation({
  args: {
    mongoId: v.string(),
    userType: v.string(), // required since role assignment should always have a value
  },
  handler: async (ctx, { mongoId, userType }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byMongoId", (q) => q.eq("mongoUserId", mongoId))
      .unique();

    if (!user) {
      throw new Error("User not found in Convex");
    }

    await ctx.db.patch(user._id, {
      userType,
      updatedAt: Date.now(),
    });

    return { status: "success", userId: user._id, userType };
  },
});

export const getUsersByIds = query({
  args: { userIds: v.array(v.string()) }, // array of Clerk IDs
  handler: async (ctx, { userIds }) => {
    const users: {
      _id: string;
      convexUserId: string;
      clerkId: string;
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      picture: string;
      organizationId: string;
      isAdmin: boolean;
      department: string[];
      level: string[];
      program: string[];
      studyMode: string[];
      designation: string;
      createdAt: number;
      updatedAt: number;
    }[] = [];

    for (const clerkId of userIds) {
      const user = await ctx.db
        .query("users")
        .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
        .unique();

      if (user) {
        users.push({
          convexUserId: user._id.toString(),
          _id: user.mongoUserId || "",
          clerkId: user.clerkId || "[Deleted]",
          firstName: user.firstName || "[Deleted]",
          lastName: user.lastName || "",
          username: user.username || "",
          email: user.email || "",
          picture: user.picture || "",
          organizationId: user.organizationId || "",
          isAdmin: user.isAdmin || false,
          department: user.department || [],
          level: user.level || [],
          program: user.program || [],
          studyMode: user.studyMode || [],
          designation: user.designation || "",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      }
    }

    return users;
  },
});

export const getUserByMongoId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("byMongoId", (q) => q.eq("mongoUserId", args.userId))
      .unique();
  },
});

export const syncUserToConvex = mutation({
  args: {
    mongoUserId: v.string(),
    clerkId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(),
    userType: v.optional(v.string()),
    email: v.string(),
    picture: v.string(),
    organizationId: v.string(),
    isAdmin: v.boolean(),
    timeZone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Use the index for lookup
    const existingUser = await ctx.db
      .query("users")
      .withIndex("byMongoId", (q) => q.eq("mongoUserId", args.mongoUserId))
      .first();

    if (existingUser) {
      // Update
      await ctx.db.patch(existingUser._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        username: args.username,
        userType: args.userType,
        email: args.email,
        picture: args.picture,
        organizationId: args.organizationId,
        isAdmin: args.isAdmin,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    // Insert new user
    const newUserId = await ctx.db.insert("users", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return newUserId;
  },
});

export const updateUserSubscriptionType = mutation({
  args: {
    clerkId: v.string(),
    subscriptionType: v.string(),
    subscriptionCoveredByCredit: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const convexUser = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!convexUser) {
      throw new ConvexError("User not found in Convex");
    }

    await ctx.db.patch(convexUser._id, {
      subscriptionType: args.subscriptionType,
      subscriptionCoveredByCredit: args.subscriptionCoveredByCredit,
      updatedAt: Date.now(),
    });

    return {
      status: "success",
      message: `User subscription updated to ${args.subscriptionType}`,
    };
  },
});

export const updateUserCreditsAndSubscription = mutation({
  args: {
    clerkId: v.string(),
    creditBalance: v.number(),
    userType: v.string(),
    subscriptionType: v.string(),
    subscriptionCoveredByCredit: v.boolean(),
    useCreditsAutomatically: v.boolean(),
    nextBillingDate: v.number(),
  },
  handler: async (ctx, args) => {
    const convexUser = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!convexUser) {
      throw new ConvexError("User not found in Convex");
    }

    await ctx.db.patch(convexUser._id, {
      creditBalance: args.creditBalance,
      userType: args.userType,
      subscriptionType: args.subscriptionType,
      subscriptionCoveredByCredit: args.subscriptionCoveredByCredit,
      useCreditsAutomatically: args.useCreditsAutomatically,
      nextBillingDate: args.nextBillingDate,
      updatedAt: Date.now(),
    });

    return {
      status: "success",
      message: "Credits and subscription updated in Convex",
    };
  },
});

export const updateConvexUserFromMongo = mutation({
  args: {
    clerkId: v.string(),
    timeZone: v.string(),
    phone: v.optional(v.string()),
    gender: v.optional(v.string()),
    school: v.optional(v.string()),
    expertise: v.optional(v.array(v.string())),
    yearsOfExperience: v.optional(v.number()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const convexUser = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!convexUser) {
      throw new ConvexError("User not found in Convex");
    }

    await ctx.db.patch(convexUser._id, {
      timeZone: args.timeZone,
      phone: args.phone,
      gender: args.gender,
      school: args.school,
      expertise: args.expertise,
      yearsOfExperience: args.yearsOfExperience,
      country: args.country,
      updatedAt: Date.now(),
    });

    return {
      status: "success",
      message: "Credits and subscription updated in Convex",
    };
  },
});
