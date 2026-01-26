export function PaymentsContent() {
  return (
    <>
      <h2 className="text-xl font-semibold mb-2">💳 Student Subscription</h2>
      <p className="text-gray-400 mb-4">
        Access to the platform is{" "}
        <span className="font-medium text-white">completely free</span> for
        instructors, supervisors, and school administrators. However, students
        are required to subscribe monthly to access project creation, coursework
        (tests, quizzes, exams), and collaboration features.
      </p>

      <p className="text-gray-400">The subscription fee is:</p>
      <ul className="list-disc list-inside ml-4 mt-2 text-gray-300 mb-4">
        <li>₦3,000/month for Nigerian students</li>
        <li>$2/month for international students</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">🧾 No Refund Policy</h2>
      <p className="text-gray-400 mb-4">
        Students may unsubscribe at any time via the{" "}
        <strong>Manage Subscription</strong> page. However,{" "}
        <span className="text-destructive font-medium">no refund</span> will be
        issued for the current month. It is recommended to fully utilize the
        platform until the subscription period ends.
      </p>

      <h2 className="text-xl font-semibold mb-2">📅 Manage Subscription</h2>
      <p className="text-gray-400 mb-4">
        Students can manage or cancel their subscription through the{" "}
        <strong>Manage Subscription</strong> section on their dashboard, which
        provides visibility into their current plan and renewal status.
      </p>

      <h2 className="text-xl font-semibold mb-2">💡 Transparent Billing</h2>
      <p className="text-gray-400 mb-4">
        All charges are clearly displayed before payment. Students receive email
        confirmations and downloadable receipts after each successful
        transaction.
      </p>
    </>
  );
}
