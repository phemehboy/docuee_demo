"use client";

import { useEffect } from "react";
import { SignIn, useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
  const { signOut } = useClerk();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("demo_only") === "true") {
      // Show toast before signing out
      toast.error("Error", {
        description: "Invalid credentials. You have been logged out.",
      });

      // Sign out immediately
      signOut();
    }
  }, [params, signOut]);

  return (
    <div className="min-h-screen flex w-full bg-black-100 justify-center items-center">
      <SignIn
        appearance={{
          elements: {
            footer: {
              display: "none",
            },
          },
        }}
      />
    </div>
  );
}
