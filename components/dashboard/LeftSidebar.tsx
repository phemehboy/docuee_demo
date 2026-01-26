"use client";

import { getSidebar } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { motion, MotionProps } from "framer-motion";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { UserType } from "@/lib/database/models/user.model";
import { cn } from "@/lib/utils";

interface SidebarProps {
  usertype: UserType;
  hasPremium?: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  userId: string;
  firstName?: string;
  lastName?: string;
  invited?: boolean;
  className?: string;
}

interface SidebarLinkProps {
  name: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  fullRoute: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarLinkComponent: React.FC<SidebarLinkProps> = ({
  name,
  Icon,
  fullRoute,
  isActive,
  onClick,
}) => (
  <Link
    href={fullRoute}
    onClick={onClick}
    className={`flex items-center gap-4 my-2 p-4 rounded-lg transition-all ${
      isActive ? "gradient-blue text-white font-bold" : "bg-transparent"
    } hover:bg-gray-700/15 hover:text-white`}
  >
    <Icon className="size-5" />
    <span
      className={`capitalize ${
        isActive
          ? "text-[16px] sm:text-[18px] font-bold leading-[140%]"
          : "text-[16px] sm:text-[18px] font-medium leading-6"
      }`}
    >
      {name}
    </span>
  </Link>
);

// Wrap in React.memo and give it a displayName
export const SidebarLink = React.memo(SidebarLinkComponent);
SidebarLink.displayName = "SidebarLink";

const LeftSidebar = ({
  usertype,
  sidebarOpen,
  setSidebarOpen,
  userId,
  firstName,
  lastName,
  invited,
  className,
}: SidebarProps) => {
  const pathName = usePathname();

  console.log({ userId });
  // Control body scroll
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const memoizedSidebar = useMemo(() => getSidebar(), []);

  const processedSidebar = useMemo(
    () =>
      memoizedSidebar.map(({ section, items }) => ({
        section,
        items: items.map(({ name, route, icon }) => {
          let fullRoute = `/user/${userId}/usertype/student/dashboard${
            route ? `/${route}` : ""
          }`;
          const queryParams = new URLSearchParams();
          if (invited) queryParams.set("invited", "true");
          if (queryParams.toString()) fullRoute += `?${queryParams.toString()}`;
          const decodedFullRoute = decodeURIComponent(fullRoute);
          const decodedPath = decodeURIComponent(pathName || "");

          const isActive =
            decodedPath === decodedFullRoute ||
            (route === "courses" &&
              decodedPath.startsWith(
                `/user/${userId}/usertype/student/dashboard/courses`,
              )) ||
            (route === "promotion" &&
              decodedPath.startsWith(
                `/user/${userId}/usertype/student/dashboard/promotion`,
              ));

          return { name, Icon: icon, fullRoute, isActive };
        }),
      })),
    [memoizedSidebar, userId, pathName, invited],
  );

  const handleCloseSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <section
        className={cn(
          "hidden lg:flex flex-col border-r border-gray-400/20 lg:w-66.5 py-6",
          className,
        )}
      >
        <div className="flex-1 overflow-y-auto px-4 py-6 subtle-scrollbar">
          {processedSidebar.map(({ section, items }) => (
            <div key={section} className="mb-6">
              <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2 max-lg:hidden">
                {section}
              </h4>
              {items.map((link) => (
                <SidebarLink key={link.name} {...link} />
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Sidebar */}
      <motion.div
        className="fixed top-0 left-0 w-full h-full z-50 lg:hidden"
        style={{ pointerEvents: sidebarOpen ? "auto" : "none" }}
        {...({} as MotionProps & React.HTMLAttributes<HTMLDivElement>)}
      >
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: sidebarOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute w-full h-full bg-black bg-opacity-50"
          onClick={handleCloseSidebar}
          {...({} as MotionProps & React.HTMLAttributes<HTMLDivElement>)}
        />

        {/* Panel */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: sidebarOpen ? 0 : "-100%" }}
          transition={{ type: "tween", duration: 0.25 }}
          className="fixed top-0 left-0 w-64 h-full bg-black-900 shadow-lg flex flex-col"
          {...({} as MotionProps & React.HTMLAttributes<HTMLDivElement>)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 bg-gray-800 text-white p-1.5 rounded-full hover:bg-gray-700 transition z-10"
            onClick={handleCloseSidebar}
          >
            <X className="size-5" />
          </button>

          {/* Logo */}
          <Link href="" className="w-full flex justify-center p-2">
            <Image
              src="/assets/images/white-logo.png"
              alt="Logo"
              width={36}
              height={36}
            />
          </Link>
          <p className="w-full h-px border" />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-2 py-4 mt-2">
            {processedSidebar.map(({ section, items }) => (
              <div key={section} className="mb-4">
                <h4 className="text-xs text-gray-400 uppercase px-4 mb-1 tracking-wide">
                  {section}
                </h4>
                {items.map((link) => (
                  <SidebarLink
                    key={link.name}
                    {...link}
                    onClick={handleCloseSidebar}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Sticky footer */}
          <div className="px-3 py-4 bg-black-800 shrink-0">
            <div className="w-full flex gap-1 items-center mt-3">
              <UserButton
                appearance={{
                  elements: { userButtonTrigger: "w-8 h-8 rounded-full" },
                }}
              />
              <span className="text-sm">
                {firstName} {lastName}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default LeftSidebar;
