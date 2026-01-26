import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  createStudent,
  getStudentByUserId,
} from "@/lib/actions/student.action";
import { getUserById } from "@/lib/actions/user.action";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { userId } = await auth();
  const { id } = await params;
  const userDoc = await getUserById(id);
  const mongoUser = userDoc ? JSON.parse(JSON.stringify(userDoc)) : null;

  if (!mongoUser || mongoUser.clerkId !== userId) {
    redirect("/unauthorized");
  }

  // ✅ Only create student if it doesn't exist yet
  const existingStudent = await getStudentByUserId(mongoUser._id);
  if (!existingStudent) {
    await createStudent(mongoUser._id, { school: null });
  }

  return <DashboardLayout mongoUser={mongoUser}>{children}</DashboardLayout>;
}
