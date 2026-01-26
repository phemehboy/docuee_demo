export function ProjectsContent() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <p className="text-gray-400 mb-4">
        Docuee provides a structured and guided approach for students to
        complete their academic projects. From topic submission to final
        documentation, every step is designed for collaboration, feedback, and
        accountability.
      </p>

      <h2 className="text-xl font-semibold mb-2">
        🧠 Topic Submission and Approval
      </h2>
      <p className="text-gray-400 mb-4">
        Students are required to submit four different project topics. Their
        assigned supervisor will review these and either approve one or reject
        all. If one topic is approved, the others are automatically hidden, and
        the overall status is marked as{" "}
        <span className="text-green-500">
          <strong>approved</strong>
        </span>
        . However, if the supervisor rejects all four, the overall status
        changes to{" "}
        <span className="text-red-500">
          <strong>rejected</strong>
        </span>
        , allowing the student to resubmit a new set of topics.
      </p>

      <h2 className="text-xl font-semibold mb-2">📊 Project Stages</h2>
      <p className="text-gray-400 mb-4">
        Once a project topic is approved, it is divided into stages for
        structured writing. The default stages include:
      </p>
      <ul className="list-disc list-inside text-gray-400 mb-4">
        <li>Stage 1: Proposal</li>
        <li>Stage 2: Chapter 1</li>
        <li>Stage 3: Chapter 2</li>
        <li>Stage 4: Chapter 3</li>
        <li>
          Final Stage: Final Submission (includes chapters, appendices,
          references, and any additional requirements set by the school)
        </li>
      </ul>
      <p className="text-gray-400 mb-4">
        Schools can customize project stages to fit their own requirements, so
        the workflow may vary.
      </p>
      <p className="text-gray-400 mb-4">
        Each stage must be completed before moving on to the next, ensuring a
        logical progression and allowing supervisors to provide oversight at
        every step.
      </p>

      <h2 className="text-xl font-semibold mb-2">
        ⏰ Submission Deadlines & Fines
      </h2>
      <p className="text-gray-400 mb-4">
        Each stage has a submission deadline. If a student fails to submit a
        stage on time, a fine will be required before they can continue writing.
        This encourages timely progress and accountability.
      </p>

      <h2 className="text-xl font-semibold mb-2">
        👥 Supervisor Collaboration
      </h2>
      <p className="text-gray-400 mb-4">
        Supervisors can monitor the student&apos;s progress in real time,
        provide feedback, approve chapters, and communicate directly within the
        document editor.
      </p>

      <h2 className="text-xl font-semibold mb-2">
        📌 Single Project Limitation
      </h2>
      <p className="text-gray-400 mb-4">
        Currently, students can work on only one project at a time. Support for
        multiple simultaneous projects will be available in future updates.
      </p>

      <h2 className="text-xl font-semibold mb-2">🔒 Visibility & Access</h2>
      <p className="text-gray-400 mb-4">
        For individual projects, only the assigned student and supervisor can
        view and work on the project. For group projects, all students in the
        group along with their supervisor can collaborate and access the project
        content. Other roles or users do not have access.
      </p>
    </>
  );
}
