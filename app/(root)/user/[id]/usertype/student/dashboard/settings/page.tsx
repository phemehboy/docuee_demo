import React from "react";
import SettingsPage from "@/components/SettingsPage";
import { getUserById } from "@/lib/actions/user.action";

async function fetchChangeRequest(userId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/change-request/check?userId=${userId}`,
    { cache: "no-store" } // always fetch fresh data
  );
  if (!res.ok) return { exists: false, requests: [] };
  return res.json();
}

const SettingsServerPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  console.log("ID from SERVER", id);

  const user = await getUserById(id);
  if (!user) return <p className="text-red-500">User not found</p>;

  const changeData = await fetchChangeRequest(user.clerkId);

  return (
    <SettingsPage
      initialUser={user}
      existingRequest={changeData.exists}
      requestHistory={changeData.requests}
    />
  );
};

export default SettingsServerPage;
