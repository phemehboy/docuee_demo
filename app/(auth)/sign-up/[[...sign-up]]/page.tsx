import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex w-full bg-black-100 justify-center items-center">
      <SignUp />
    </div>
  );
}
