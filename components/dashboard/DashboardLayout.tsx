"use client";

import React, { useEffect, useState } from "react";

import { UserButton, useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import DashboardBanner from "./DashboardBanner";
import { IUser } from "@/lib/database/models/user.model";
import { FullScreenLoader } from "../FullScreenLoader";
import { NotificationDropdown } from "./NotificationDropdown";
import LeftSidebar from "./LeftSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  mongoUser: IUser;
}

export default function DashboardLayout({
  children,
  mongoUser,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [mounted, setMounted] = useState(false);
  const { isLoaded } = useUser();

  // useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [sidebarOpen]);

  if (!isLoaded || !mongoUser) return <FullScreenLoader label="Loading..." />;

  return (
    <>
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full flex justify-between items-center gap-2 p-2 md:px-5 z-50 bg-black-100 shadow-md border-b border-gray-400/20">
        {/* Left: Sidebar toggle + Logo */}
        <div className="flex justify-between items-center gap-2">
          <button
            className="lg:hidden rounded focus:outline-none focus:ring"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <Link href="" className="w-fit">
            <Image
              src="/assets/images/white-logo.png"
              alt="Logo with name"
              width={60}
              height={60}
              className="hidden lg:block"
            />
          </Link>
        </div>

        {/* Middle: Banner */}

        <div className="hidden md:block">
          <DashboardBanner user={mongoUser} />
        </div>
        <div className="block md:hidden">
          <DashboardBanner user={mongoUser} isMobile />
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-4 relative">
          <NotificationDropdown />

          <div className="hidden lg:flex">
            {!isLoaded ? (
              // 👇 Skeleton while Clerk is loading
              <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
            ) : (
              <UserButton />
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <main className="relative pt-15 h-[calc(100dvh-60px)]">
        <div className="flex h-full">
          {/* Sidebar - pinned, doesn’t scroll with content */}
          <LeftSidebar
            usertype={mongoUser.userType}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            userId={mongoUser._id.toString()}
            firstName={mongoUser.firstName}
            lastName={mongoUser.lastName}
            className="sticky top-15 h-[calc(100dvh-60px)] shrink-0"
          />

          {/* Scrollable Content */}
          <div className="flex-1 w-full px-2 md:px-4 overflow-y-auto subtle-scrollbar h-[calc(100dvh-60px)]">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
