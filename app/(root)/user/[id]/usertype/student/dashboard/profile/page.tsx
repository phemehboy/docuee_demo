import ProfilePage from "@/components/dashboard/ProfilePage";
import { getUserById } from "@/lib/actions/user.action";

const MyProfilePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const userProfile = await getUserById(id);

  return <ProfilePage initialProfile={userProfile} />;
};

export default MyProfilePage;
