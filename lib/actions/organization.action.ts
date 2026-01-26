"use server";

import { UpdateOrgProps } from "@/types";
import { connectToDatabase } from "../database";
import { handleError } from "../utils";
import { updateInvitation } from "./user.action";
import User from "../database/models/user.model";
import Organization from "../database/models/organization.model";

export async function createUserOrganization(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const orgName = `${fullName}'s Organization`;

  // 1. Create organization document in MongoDB
  const mongoOrg = await Organization.create({
    name: orgName,
    members: [
      {
        user: user._id,
        userClerkId: user.clerkId,
        joinedAt: new Date(),
      },
    ],
    createdBy: user._id,
  });

  // 2. Update the user to store organization reference
  user.organizationId = mongoOrg._id.toString();
  await user.save();

  return mongoOrg;
}

export async function updateOrganization(params: UpdateOrgProps) {
  try {
    await connectToDatabase();

    await Organization.updateOne(
      { clerkOrgId: params.clerkOrgId },
      { $set: { name: params.name, slug: params.slug } },
    );
  } catch (error) {
    handleError(error);
  }
}

export async function deleteOrganization(clerkOrgId: string) {
  try {
    await connectToDatabase();

    await Organization.updateOne(
      { clerkOrgId },
      { $set: { deletedAt: new Date() } },
    );

    // Or hard delete if you want:
    // await Organization.deleteOne({ clerkOrgId });
  } catch (error) {
    handleError(error);
  }
}

export async function handleOrganizationMembershipDeleted({
  email,
  clerkOrgId,
}: {
  email: string;
  clerkOrgId: string;
}) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`❌ User not found for ${email}`);
      return;
    }

    const org = await Organization.findOne({ clerkOrgId });
    if (!org) {
      console.warn(`❌ Organization not found for ${clerkOrgId}`);
      return;
    }

    await updateInvitation(email); // updates orgCount

    const wasInHistory = user.orgHistory.some(
      (orgId: string) => orgId.toString() === org._id.toString(),
    );

    if (wasInHistory) {
      user.orgHistory.push(org._id);
      await user.save();
      console.log(`📌 Added ${clerkOrgId} to ${email}'s orgHistory`);
    } else {
      console.log(
        `👋 User ${email} removed from org ${clerkOrgId} (not tracked in history)`,
      );
    }
  } catch (error) {
    console.error("🔥 Error in handleOrganizationMembershipDeleted:", error);
  }
}

export async function handleOrganizationMembershipUpdated({
  email,
  clerkOrgId,
}: {
  email: string;
  clerkOrgId: string;
}) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`❌ User not found for ${email}`);
      return;
    }

    await updateInvitation(email); // updates orgCount

    console.log(`🔄 Membership updated for ${email} in org ${clerkOrgId}`);
  } catch (error) {
    console.error("🔥 Error in handleOrganizationMembershipUpdated:", error);
  }
}
