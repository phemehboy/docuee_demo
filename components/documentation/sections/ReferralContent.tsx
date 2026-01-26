export default function ReferralContent() {
  return (
    <>
      <h2 className="text-xl font-semibold mb-2">🎁 Referral Program</h2>
      <p className="text-gray-400 mb-4">
        Earn credits by inviting others to join Docuee! When someone signs up
        using your referral link and upgrades their account, you’ll receive
        reward credits that can be applied to future subscriptions.
      </p>

      <h2 className="text-xl font-semibold mb-2">👤 Who Can Refer?</h2>
      <p className="text-gray-400 mb-4">
        All user types —{" "}
        <strong>students, instructors, supervisors, and school admins</strong> —
        can share their referral links and earn credits. Currently, only
        students receive monetary value for successful referrals.
      </p>

      <h2 className="text-xl font-semibold mb-2">📌 How It Works</h2>
      <ul className="list-disc list-inside ml-4 text-gray-300 mb-4">
        <li>
          <strong>All users:</strong> Earn{" "}
          <span className="text-white font-semibold">1,000 credits</span> for
          each referral that upgrades. Students can use{" "}
          <span className="text-white font-semibold">3,000 credits</span> to pay
          for their next subscription.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">🔁 Auto-Apply Credits</h2>
      <p className="text-gray-400 mb-4">
        To automatically apply referral credits to your monthly subscription,
        toggle the{" "}
        <span className="text-white font-medium">
          “Use credits automatically for subscription payments”
        </span>{" "}
        switch in your{" "}
        <span className="text-white font-medium">
          <strong>Settings</strong>
        </span>{" "}
        page.
      </p>

      <h2 className="text-xl font-semibold mb-2">
        🏦 For Instructors, Supervisors & Admins
      </h2>
      <p className="text-gray-400 mb-4">
        Referral credit redemption for{" "}
        <strong>instructors, supervisors, and school admins</strong> is coming
        soon. For now, you can accumulate credits that will be redeemable for
        future platform features or benefits.
      </p>

      <h2 className="text-xl font-semibold mb-2">💡 Pro Tip</h2>
      <p className="text-gray-400 mb-4">
        The more referrals you make, the more credits you earn. Think of them as
        “gold” to unlock more value on the platform — start sharing your
        referral link today!
      </p>
    </>
  );
}
