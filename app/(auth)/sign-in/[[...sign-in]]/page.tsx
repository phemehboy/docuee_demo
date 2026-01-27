"use client";

import { useEffect } from "react";
import { SignIn, useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const { signOut } = useClerk();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("demo_only") === "true") {
      signOut(); // 🔥 kill the session immediately
    }
  }, [params, signOut]);
  return (
    <div className="min-h-screen flex w-full bg-black-100 justify-center items-center">
      <SignIn />
    </div>
  );
}
