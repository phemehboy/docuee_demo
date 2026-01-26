export function FAQsContent() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">
        🙋 Frequently Asked Questions
      </h2>

      <div className="space-y-4 text-gray-300">
        <div>
          <h3 className="font-semibold text-white">
            Who is required to pay for using Docuee?
          </h3>
          <p className="text-gray-400">
            Only students are required to pay a monthly subscription fee to
            access projects, tests, exams, quizzes, and other coursework.
            Instructors, supervisors, and school admins have free access.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white">
            Can a user have multiple roles?
          </h3>
          <p className="text-gray-400">
            No, each user can only hold one role at a time. For example, a user
            cannot be both a student and an instructor simultaneously.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white">
            Can supervisors see assignments or exams?
          </h3>
          <p className="text-gray-400">
            No. Supervisors handle project topic approvals and project
            collaboration only. Assignments, tests, exams, and quizzes are
            managed exclusively by instructors.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white">
            Can students submit more than one project?
          </h3>
          <p className="text-gray-400">
            Currently, each final-year student can only work on one project at a
            time. Support for multiple simultaneous projects will be added soon.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white">
            What happens if my project topic is rejected?
          </h3>
          <p className="text-gray-400">
            Students are required to submit up to four project topics. If all
            submitted topics are rejected by the supervisor, the overall status
            becomes <span className="text-red-500">&quot;Rejected&quot;</span>{" "}
            and the student can submit a new set of topics.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white">
            Is there a refund if I unsubscribe?
          </h3>
          <p className="text-gray-400">
            No, refunds are not issued when a student unsubscribes. Students are
            advised to fully utilize the platform until the end of their current
            subscription period.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white">
            How does the referral program work?
          </h3>
          <p className="text-gray-400">
            All users earn{" "}
            <span className="text-white">
              <strong>1,000 credits</strong>
            </span>{" "}
            for each referral that upgrades. Students can use{" "}
            <span className="text-white">
              <strong>3,000 credits</strong>
            </span>{" "}
            to pay for their next subscription. Credits can be accumulated over
            time and auto-applied via the settings page.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white">
            How long does admin verification take?
          </h3>
          <p className="text-gray-400">
            School admins are verified manually within 2 working days after
            submitting their documents. Once approved, they can proceed with
            school setup and onboarding.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white">
            What happens if I miss a submission deadline?
          </h3>
          <p className="text-gray-400">
            Each project stage, assignment, test, exam, and quiz has its own
            deadline. If a deadline is missed, students may need to follow
            platform guidelines, such as paying a fine or requesting extension,
            before continuing.
          </p>
        </div>
      </div>
    </div>
  );
}
