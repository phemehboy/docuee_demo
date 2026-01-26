"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { FullScreenLoader } from "@/components/FullScreenLoader";
import { getClerkUsers, getProjects } from "@/lib/actions/user.action";
import { Id } from "@/convex/_generated/dataModel";
import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margins";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  avatar: string;
  color: string;
  userType:
    | "instructor"
    | "supervisor"
    | "student"
    | "owner"
    | "member"
    | "guest";
};

export function Room({
  children,
  stageKey,
  projectId,
}: {
  children: ReactNode;
  stageKey: string;
  projectId?: Id<"projects">;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const room = `${projectId}_${stageKey}`;

  // 🧩 Fetch Clerk users
  const fetchUsers = useMemo(
    () => async () => {
      try {
        const list = await getClerkUsers();
        setUsers(list);
      } catch {
        toast.error("Error", { description: "Failed to fetch users" });
      }
    },
    [],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 🕒 Helper: refresh Liveblocks session periodically (every 25 minutes)
  useEffect(() => {
    const interval = setInterval(
      () => {
        reauthorizeLiveblocks(room);
      },
      25 * 60 * 1000,
    ); // 25 minutes
    return () => clearInterval(interval);
  }, [room]);

  // 👁️ Refresh when user switches tab or wakes from sleep
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        reauthorizeLiveblocks(room);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [room]);

  // 🔑 Function: safely reauthorize Liveblocks
  async function reauthorizeLiveblocks(room: string) {
    try {
      const response = await fetch("/api/liveblocks-auth", {
        method: "POST",
        body: JSON.stringify({ room }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) {
        // Don't force login
        toast.success("Your session has expired. Attempting to reconnect…");
        // Optionally retry automatically
        setTimeout(() => reauthorizeLiveblocks(room), 3000);
        return;
      }

      if (!response.ok) throw new Error("Failed to reauthorize");
    } catch (err) {
      console.error("Liveblocks reauth failed:", err);
      toast.error("Error", {
        description: "Connection lost. Reconnecting…",
      });
    }
  }

  return (
    <LiveblocksProvider
      key={room}
      throttle={16}
      authEndpoint={async () => {
        const attempt = async (retries = 3) => {
          try {
            const response = await fetch("/api/liveblocks-auth", {
              method: "POST",
              body: JSON.stringify({ room }),
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });

            if (response.status === 401 || response.status === 403) {
              toast.success("Session expired. Retrying…");
              if (retries > 0) {
                await new Promise((res) => setTimeout(res, 2000));
                return attempt(retries - 1);
              }
              return { error: "Session expired" }; // don't open Clerk
            }

            if (!response.ok)
              throw new Error(`Auth failed: ${response.statusText}`);

            return await response.json();
          } catch (err: any) {
            if (retries > 0) {
              await new Promise((res) => setTimeout(res, 2000));
              return attempt(retries - 1);
            }
            toast.error("Error", {
              description: err.message || "Failed to connect to project.",
            });
            throw err;
          }
        };

        return attempt();
      }}
      resolveUsers={({ userIds }) =>
        userIds.map(
          (userId) => users.find((user) => user.id === userId) ?? undefined,
        )
      }
      resolveMentionSuggestions={({ text }) => {
        let filteredUsers = users;
        if (text) {
          filteredUsers = users.filter((user) =>
            user.name.toLowerCase().includes(text.toLowerCase()),
          );
        }
        return filteredUsers.map((user) => user.id);
      }}
      resolveRoomsInfo={async ({ roomIds }) => {
        const projectIds = roomIds.map((r) => r.split("_")[0]);
        const projects = await getProjects(projectIds as Id<"projects">[]);
        return projects.map((project) => ({
          id: `${project.id}`,
          name: project.name,
        }));
      }}
    >
      <RoomProvider
        key={room}
        id={room}
        initialStorage={{
          leftMargin: LEFT_MARGIN_DEFAULT,
          rightMargin: RIGHT_MARGIN_DEFAULT,
        }}
      >
        <ClientSideSuspense
          fallback={<FullScreenLoader label="Project Loading..." />}
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
