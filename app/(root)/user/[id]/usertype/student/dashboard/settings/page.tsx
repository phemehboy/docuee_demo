import SettingsPage from "@/components/SettingsPage";
import { getUserById } from "@/lib/actions/user.action";

const SettingsServerPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const user = await getUserById(id);
  if (!user) return <p className="text-red-500">User not found</p>;

  return <SettingsPage initialUser={user} />;
};

export default SettingsServerPage;
