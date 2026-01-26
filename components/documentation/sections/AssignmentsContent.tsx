export function AssignmentsContent() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Coursework</h1>
      <p className="text-gray-400 mb-4">
        Courseworks on Docuee include assignments, tests, quizzes, exams, and
        other academic tasks created by instructors. The system ensures a clear
        separation between projects and coursework for better focus and
        accountability.
      </p>

      <h2 className="text-xl font-semibold mb-2">🎓 Instructor-Led Only</h2>
      <p className="text-gray-400 mb-4">
        Only users with the <strong>instructor</strong> role can create and
        manage coursework. Supervisors do <strong>not</strong> have access to
        these features, keeping academic supervision and teaching
        responsibilities distinct.
      </p>

      <h2 className="text-xl font-semibold mb-2">📝 Student Submissions</h2>
      <p className="text-gray-400 mb-4">
        Instructors can assign coursework to individual students or entire
        classes. Once published, students see their tasks on the dashboard and
        can submit their work directly through the platform, whether it&apos;s
        an assignment, quiz, test, or exam.
      </p>

      <h2 className="text-xl font-semibold mb-2">📊 Instructor Grading</h2>
      <p className="text-gray-400 mb-4">
        Instructors can grade and provide feedback on submitted coursework using
        the interactive editor. Once grading starts, the submission becomes
        read-only for students. Grades and feedback are visible on the student
        dashboard, and printable copies are available for reference.
      </p>

      <h2 className="text-xl font-semibold mb-2">⚡ Real-Time Updates</h2>
      <p className="text-gray-400 mb-4">
        The platform supports near-instant updates powered by our real-time
        database. Students and instructors can see changes and feedback almost
        immediately during the review process.
      </p>

      <h2 className="text-xl font-semibold mb-2">
        🔐 Role Enforcement & Visibility
      </h2>
      <p className="text-gray-400 mb-4">
        Only instructors and their assigned students can view or interact with
        specific coursework. Supervisors, admins, or other students outside the
        assigned relationship do not have access.
      </p>

      <h2 className="text-xl font-semibold mb-2">🚫 One Role Per User</h2>
      <p className="text-gray-400 mb-4">
        Each user can hold only one role at a time. Users must choose to be a
        student, instructor, supervisor, or admin during registration or
        onboarding.
      </p>

      <h2 className="text-xl font-semibold mb-2">
        📌 School Admins and Onboarding
      </h2>
      <p className="text-gray-400 mb-4">
        Users who want to become <strong>school admins</strong> must go through
        a verification process, which can take up to 2 working days. Once
        verified, they proceed with onboarding by entering school details,
        departments, levels, and more. Currently, only one admin is allowed per
        school.
      </p>
    </>
  );
}
