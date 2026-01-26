import ProjectDashboard from "@/components/ProjectDashboard";
import { getProjectForStudent } from "@/lib/actions/project.action";
import { getStudentByUserId } from "@/lib/actions/student.action";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await getStudentByUserId(id);

  if (!student) {
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        Student record not found.
      </div>
    );
  }

  const initialProject = await getProjectForStudent(student._id);

  return (
    <ProjectDashboard
      initialStudent={student}
      initialProject={initialProject}
      id={id}
      usertype="student"
    />
  );
}
