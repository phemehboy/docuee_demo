export function UserRolesContent() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">User Roles</h1>
      <p className="text-gray-400 mb-4">
        Docuee supports four distinct user roles, each with specific
        responsibilities to ensure a well-organized academic workflow:
      </p>

      <h2 className="text-xl font-semibold mb-2">🎓 Student</h2>
      <p className="text-gray-400 mb-4">
        Students are the primary users of Docuee. They submit project topics
        (final-year students), complete assignments, take tests, quizzes, and
        exams, collaborate on approved projects, and track their academic
        progress. Access requires a one-time or recurring payment depending on
        your location and plan.
      </p>

      <h2 className="text-xl font-semibold mb-2">🧑‍🏫 Supervisor</h2>
      <p className="text-gray-400 mb-4">
        Supervisors play a key role in guiding student projects. They review and
        approve project topics, provide feedback, and collaborate in real-time
        with students on project documents. However, supervisors do not have
        access to assignments.
      </p>

      <h2 className="text-xl font-semibold mb-2">👩‍🎓 Instructor</h2>
      <p className="text-gray-400 mb-4">
        Instructors oversee assignments, tests, quizzes, and exams by providing
        feedback and grading submissions. They are also automatically
        supervisors, which allows them to guide and collaborate with students on
        approved projects. Note that while all instructors are supervisors, not
        all supervisors are instructors.
      </p>

      <h2 className="text-xl font-semibold mb-2">🏛️ School Admin</h2>
      <p className="text-gray-400 mb-4">
        The School Admin manages the school’s presence on Docuee. To become an
        admin, a user must submit verification documents. If approved within 2
        working days, the admin can begin onboarding by supplying essential
        school information such as departments, levels, and other academic
        structures. Currently, each school is limited to one admin account.
      </p>

      <h2 className="text-xl font-semibold mb-2">⚠️ Role Limitations</h2>
      <p className="text-gray-400 mb-4">
        Each user account can only have one role at a time, and features are
        role-specific. For example, instructors can provide feedback and grade
        assignments, tests, quizzes, and exams, while supervisors primarily
        guide and collaborate on approved projects. Students have access to
        submit work and track progress.
      </p>
    </>
  );
}
