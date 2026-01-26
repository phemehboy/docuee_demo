"use client";

import Link from "next/link";

interface SupportBannerProps {
  message?: string;
  link?: string;
}

export default function SupportBanner({
  message = "Need help or have a question?",
  link = "/user/support",
}: SupportBannerProps) {
  return (
    <div className="pt-2">
      <div className="border-t border-gray-300 py-4 text-sm text-muted-foreground flex items-center justify-between gap-2">
        <p>{message}</p>

        <Link href={link} className="text-primary font-medium hover:underline">
          Contact Support →
        </Link>
      </div>
    </div>
  );
}
