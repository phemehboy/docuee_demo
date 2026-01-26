import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const updateReadonlyFlag = mutation({
  args: { id: v.id("documents"), readonly: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      readonly: args.readonly,
    });
  },
});

export const getDocumentByIds = query({
  args: { ids: v.array(v.id("documents")) },
  handler: async (ctx, { ids }) => {
    const documents = [];

    for (const id of ids) {
      const document = await ctx.db.get(id);

      if (document) {
        documents.push({ id: document._id, name: document.title });
      } else {
        documents.push({ id, name: "[Deleted]" });
      }
    }

    return documents;
  },
});

export const getUserDocumentsByOwnerId = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    initialContent: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;

    const documentId = await ctx.db.insert("documents", {
      title: args.title ?? "Untitled Document",
      name: user.name,
      ownerId: user.subject,
      organizationId,
      initialContent: args.initialContent,
      isOfficial: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return documentId;
  },
});

export const deleteDocumentById = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;

    const document = await ctx.db.get(args.id);

    if (!document) {
      throw new ConvexError("No Document Found");
    }

    const isOwner = document.ownerId === user.subject;

    const isOrganizationMember = !!(
      document.organizationId && document.organizationId === organizationId
    );

    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db.delete(args.id);
  },
});

export const updateDocumentById = mutation({
  args: {
    id: v.id("documents"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const document = await ctx.db.get(args.id);

    if (!document) {
      throw new ConvexError("No Document Found");
    }

    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;

    const isOwner = document.ownerId === user.subject;
    const isOrganizationMember = !!(
      document.organizationId && document.organizationId === organizationId
    );

    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized");
    }

    // if (!isOwner) {
    //   throw new ConvexError("Unauthorized");
    // }

    return await ctx.db.patch(args.id, { title: args.title });
  },
});

export const getDocumentById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const document = await ctx.db.get(id);

    if (!document) {
      throw new ConvexError("0 document found");
    }

    return document;
  },
});

export const checkIfOfficialDocumentExists = query({
  args: {
    projectId: v.optional(v.id("projects")), // Project ID to check for an official document
  },
  handler: async (ctx, { projectId }) => {
    // Query the documents collection to check if an official document exists for the project
    const officialDocument = await ctx.db
      .query("documents")
      .withIndex("by_project_and_official", (q) =>
        q.eq("projectId", projectId).eq("isOfficial", true)
      )
      .first(); // Return the first matching document (if exists)

    // If an official document exists, return true, otherwise false
    return officialDocument ? true : false;
  },
});

export const checkIfOfficialDocumentExistsForOrg = query({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, { organizationId }) => {
    try {
      console.log("➡️ Checking official doc for org:", organizationId);

      const project = await ctx.db
        .query("projects")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", organizationId)
        )
        .first();

      if (!project) {
        console.warn("⚠️ No project found for organization:", organizationId);
        return false;
      }

      console.log("✅ Project found:", project._id);

      const officialDocument = await ctx.db
        .query("documents")
        .withIndex("by_project_and_official", (q) =>
          q.eq("projectId", project._id).eq("isOfficial", true)
        )
        .first();

      if (!officialDocument) {
        console.warn("❌ No official document found for project:", project._id);
        return false;
      }

      console.log("✅ Official document found:", officialDocument._id);
      return true;
    } catch (err) {
      console.error("🚨 Error in checkIfOfficialDocumentExistsForOrg:", err);
      // Optional: If you're using Sentry or another tracker
      // captureException(err);
      return false;
    }
  },
});

export const getDocumentsForProject = query({
  args: {
    projectId: v.id("projects"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { projectId, paginationOpts }) => {
    const project = await ctx.db.get(projectId);

    if (!project) {
      throw new ConvexError("Project not found.");
    }

    // Fetch the official document
    const officialDocument = await ctx.db
      .query("documents")
      .withIndex("by_project_and_official", (q) =>
        q.eq("projectId", projectId).eq("isOfficial", true)
      )
      .first();

    // Fetch other documents for the project
    const otherDocuments = await ctx.db
      .query("documents")
      .withIndex("by_project_and_official", (q) =>
        q.eq("projectId", projectId).eq("isOfficial", false)
      )
      .paginate(paginationOpts);

    return {
      officialDocument,
      otherDocuments,
    };
  },
});

export const get = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    isOfficial: v.optional(v.boolean()), // Add `isOfficial` as an argument
  },
  handler: async (ctx, { search, paginationOpts, isOfficial }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;

    // Build base query with isOfficial filter
    const applyIsOfficialFilter = (q: any) =>
      isOfficial !== undefined ? q.eq("isOfficial", isOfficial) : q;

    // Search within Organization
    if (search && organizationId) {
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          applyIsOfficialFilter(
            q.search("title", search).eq("organizationId", organizationId)
          )
        )
        .paginate(paginationOpts);
    }

    // Search within Personal account
    if (search) {
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          applyIsOfficialFilter(
            q.search("title", search).eq("ownerId", user.subject)
          )
        )
        .paginate(paginationOpts);
    }

    // All documents inside Organization
    if (organizationId) {
      return await ctx.db
        .query("documents")
        .withIndex("by_organization_id", (q) =>
          applyIsOfficialFilter(q.eq("organizationId", organizationId))
        )
        .paginate(paginationOpts);
    }

    // All Personal documents
    return await ctx.db
      .query("documents")
      .withIndex("by_owner_id", (q) =>
        applyIsOfficialFilter(q.eq("ownerId", user.subject))
      )
      .paginate(paginationOpts);
  },
});

export const getDocumentsBySupervisorEmail = query({
  args: {
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { search, paginationOpts }) => {
    const user = await ctx.auth.getUserIdentity();
    const supervisorEmail = user?.email;

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;

    if (search && organizationId) {
      // Search within Organization
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          q.search("title", search).eq("organizationId", organizationId)
        )
        .paginate(paginationOpts);
    }

    if (search) {
      // Search within Personal account
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          q.search("title", search).eq("ownerId", user.subject)
        )
        .paginate(paginationOpts);
    }

    if (organizationId) {
      // All documents inside Organization
      return await ctx.db
        .query("documents")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", organizationId)
        )
        .paginate(paginationOpts);
    }

    // Query documents with the supervisorEmail filter directly
    return await ctx.db
      .query("documents")
      .withIndex("by_supervisor_and_official", (q) =>
        q.eq("supervisorEmail", supervisorEmail).eq("isOfficial", true)
      ) // Filter documents that are "official"
      .paginate(paginationOpts);
  },
});

export const updateDocumentContentById = mutation({
  args: {
    id: v.id("documents"),
    content: v.string(), // assuming you're storing JSON or stringified editor content
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized");
    }

    const document = await ctx.db.get(args.id);

    if (!document) {
      throw new ConvexError("Document not found");
    }

    const organizationId = (user.organization_id ?? undefined) as
      | string
      | undefined;
    const isOwner = document.ownerId === user.subject;
    const isOrganizationMember = !!(
      document.organizationId && document.organizationId === organizationId
    );

    if (!isOwner && !isOrganizationMember) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db.patch(args.id, {
      initialContent: args.content, // You are already using initialContent for storage
      updatedAt: Date.now(),
    });
  },
});

export const updateOverallStatusToCompleted = mutation({
  args: {
    id: v.id("documents"),
    newStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("rejected")
    ),
  },
  handler: async ({ db }, { id, newStatus }) => {
    try {
      const document = await db.get(id);

      if (!document) {
        throw new Error(`Document with ID ${id} not found`);
      }

      // Update document
      await db.patch(id, {
        overallStatus: newStatus,
        updatedAt: Date.now(),
      });

      let projectMongoId: string | null = null;

      // Update project if projectId exists
      if (document.projectId) {
        const project = await db.get(document.projectId);
        if (project) {
          await db.patch(project._id, {
            overallStatus: newStatus,
            updatedAt: Date.now(),
          });

          projectMongoId = project.projectId ?? null;
        }
      }

      return {
        documentId: id,
        documentStatus: newStatus,
        supervisorEmail: document.supervisorEmail ?? null,
        projectMongoId,
        updatedAt: Date.now(),
      };
    } catch (error) {
      console.error(
        "Error occurred in updateOverallStatus mutation:",
        error instanceof Error ? error.message : error
      );
      throw new Error("Failed to update document and/or project status");
    }
  },
});
