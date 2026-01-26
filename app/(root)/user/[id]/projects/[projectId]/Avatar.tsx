"use client";

import { Separator } from "@/components/ui/separator";
import { useOthers, useSelf } from "@liveblocks/react/suspense";
import { ClientSideSuspense } from "@liveblocks/react";
import Image from "next/image";
import React from "react";

const AvatarsComponent = () => {
  return (
    <ClientSideSuspense fallback={<AvatarLoader />}>
      <AvatarStack />
    </ClientSideSuspense>
  );
};

export const Avatars = React.memo(AvatarsComponent);
Avatars.displayName = "Avatars";

const AvatarStack = () => {
  const users = useOthers();
  const currentUser = useSelf();

  if (!users) return null;

  return (
    <>
      <div className="flex items-center">
        {currentUser && (
          <div className="relative ml-2">
            <Avatar src={currentUser.info.avatar} name="You" />
          </div>
        )}
        <div className="flex">
          {users.map(({ connectionId, info }) => {
            return (
              <Avatar
                key={connectionId}
                src={info.avatar}
                name={`${info.name}`}
              />
            );
          })}
        </div>
      </div>
      <Separator
        orientation="vertical"
        className="h-6 bg-black-600/20 hidden md:flex"
      />
    </>
  );
};

interface AvatarProps {
  src: string;
  name: string;
}

const Avatar = ({ src, name }: AvatarProps) => {
  return (
    <div
      // style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
      className="group -ml-2 flex shrink-0 place-content-center relative border-4 border-white rounded-full bg-gray-400 w-[24px] h-[24px] md:w-[36px] md:h-[36px]"
    >
      <div className="opacity-0 group-hover:opacity-100 absolute top-full py-1 px-2 text-black text-xs rounded-lg mt-2.5 z-10 bg-white whitespace-nowrap transition-opacity">
        {name}
      </div>
      <img
        src={src}
        alt={name}
        loading="eager"
        decoding="async"
        className="size-full rounded-full"
      />
    </div>
  );
};

const AvatarLoader = () => (
  <div className="flex items-center gap-2">
    {/* Circular skeleton for avatar */}
    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    {/* Rectangle skeleton for name */}
    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
  </div>
);
