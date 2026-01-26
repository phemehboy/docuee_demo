import SupportPage from "@/components/dashboard/SupportPage";
import { getUserById } from "@/lib/actions/user.action";

const SupervisorReferralsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const user = await getUserById(id);
  if (!user) return <p className="text-red-500">User not found</p>;

  return <SupportPage />;
};

export default SupervisorReferralsPage;
