"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { motion, MotionProps } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import ChatDrawer from "@/components/chat/ChatDrawer";
import { ProjectDTO } from "@/types/project";
import { IStudent } from "@/lib/database/models/student.model";
import { IUser } from "@/lib/database/models/user.model";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckCheck, Clock } from "lucide-react";
import UserProfileDrawer from "@/components/UserProfileDrawer";

function MessageStatusIcon({
  status,
}: {
  status: "sent" | "delivered" | "read";
}) {
  if (status === "sent") return <Clock className="w-4 h-4 text-gray-400" />;
  if (status === "delivered")
    return <CheckCheck className="w-4 h-4 text-gray-400" />;
  if (status === "read")
    return <CheckCheck className="w-4 h-4 text-blue-500" />;
  return null;
}

interface ProjectOverviewCardProps {
  project: ProjectDTO;
  student: IStudent;
  getApprovedProjectTitle: () => string;
  disableChat?: boolean;
}

export const ProjectOverviewCard = ({
  project,
  student,
  getApprovedProjectTitle,
}: ProjectOverviewCardProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isGroupProject = !!project.groupId;

  const supervisor =
    typeof project.projectCreator === "object" &&
    project.projectCreator.supervisor
      ? project.projectCreator.supervisor
      : null;

  const studentsInGroup: IStudent[] = isGroupProject
    ? ((project.groupId?.students as IStudent[]) ?? [student])
    : [student];

  const conversations = useQuery(
    api.messages.sendMessage.listConversationsWithMeta,
    {
      userId: student.userId._id.toString(),
      contextType: "project",
      contextId: project._id.toString(),
    },
  );

  const allChatUsers = useMemo(() => {
    if (!supervisor) return [] as IUser[];

    const isIUser = (u: any): u is IUser =>
      u && typeof u.firstName === "string" && typeof u._id === "string";

    const users: any[] = isGroupProject
      ? [supervisor, ...studentsInGroup.map((s) => s.userId)]
      : [supervisor];

    // Filter users and assert the type explicitly
    return users
      .filter(isIUser)
      .filter((u) => u._id !== student.userId._id) as IUser[];
  }, [supervisor, isGroupProject, studentsInGroup, student.userId._id]);

  // Filter users based on search query
  const filteredChatUsers = useMemo(() => {
    if (!searchQuery.trim()) return allChatUsers;

    const q = searchQuery.trim().toLowerCase();
    return allChatUsers.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email?.toLowerCase() || "";
      const conv = conversations?.find(
        (c) =>
          (c.from === user._id.toString() &&
            c.to === student.userId._id.toString()) ||
          (c.to === user._id.toString() &&
            c.from === student.userId._id.toString()),
      );
      const lastMessage = conv?.lastMessage?.toLowerCase() || "";
      return (
        fullName.includes(q) || email.includes(q) || lastMessage.includes(q)
      );
    });
  }, [searchQuery, allChatUsers, conversations, student.userId._id]);

  const openChat = (user: IUser) => {
    setSelectedUser(user);
    setChatOpen(true);
  };

  const getConversation = (userId: string) =>
    conversations?.find(
      (c) =>
        (c.from === userId && c.to === student.userId._id.toString()) ||
        (c.to === userId && c.from === student.userId._id.toString()),
    );

  const statusColorMap: Record<string, string> = {
    completed: "text-green-500",
    approved: "text-blue-500",
    rejected: "text-red-500",
    "in-progress": "text-yellow-500",
    pending: "text-yellow-500",
  };
  const statusColor = statusColorMap[project?.overallStatus] || "text-white";

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    return format(new Date(timestamp), "MMM d, HH:mm");
  };

  const renderMessagePreview = (text?: string) => {
    if (!text) return "No messages yet";
    const stripped = text.trim();
    return stripped.length > 30 ? stripped.slice(0, 30) + "…" : stripped;
  };

  return (
    <>
      <div className="p-4 bg-black-900 shadow-md rounded-lg">
        <h3 className="capitalize text-lg font-semibold text-blue-400">
          {project.projectType} Overview
        </h3>
        <p className="text-sm text-gray-300 mt-2">
          View the details of your current {project.projectType}, including
          status and recent updates.
        </p>

        {/* Project Info */}
        <div className="mt-4 space-y-3">
          <div>
            <span className="capitalize text-sm font-medium text-gray-400">
              {project.projectType} Title:
            </span>
            <div className="text-sm mt-1 uppercase font-semibold text-gray-200">
              {getApprovedProjectTitle()}
            </div>
          </div>
          <div>
            <span className="capitalize text-sm font-medium text-gray-400">
              {project.projectType} Status:
            </span>
            <div className={`text-sm mt-1 font-medium ${statusColor}`}>
              {project?.overallStatus
                ? project.overallStatus.charAt(0).toUpperCase() +
                  project.overallStatus.slice(1)
                : "Not available"}
            </div>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-400">
              Last Updated:
            </span>
            <div className="text-sm text-gray-300 mt-1">
              {project?.updatedAt
                ? format(new Date(project.updatedAt), "PPP")
                : "No update date available"}
            </div>
          </div>
        </div>
      </div>
      {/* Search Input */}
      {/* Only render search input if there are users */}
      {project.projectType !== "journal" && (
        <>
          {allChatUsers.length > 0 && (
            <input
              type="text"
              placeholder="Search users by name, email, or message..."
              className="w-full my-4 px-3 py-2 rounded-lg text-sm border border-blue-500 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
          {/* Chat Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
            {filteredChatUsers.length > 0 ? (
              filteredChatUsers.map((user) => {
                const conv = getConversation(user._id.toString());
                const unreadCount =
                  conv && conv.to === student.userId._id.toString()
                    ? conv.unreadCount
                    : 0;

                return (
                  <motion.div
                    key={user._id.toString()}
                    whileHover={{ scale: 1.02 }}
                    className="relative cursor-pointer"
                    onClick={() => openChat(user)}
                    {...({} as MotionProps &
                      React.HTMLAttributes<HTMLDivElement>)}
                  >
                    <Card className="bg-black-100 border border-gray-800 hover:border-blue-500 rounded-2xl shadow-lg">
                      <CardContent className="flex items-center gap-3 p-4">
                        <Image
                          src={
                            user.picture || "/assets/images/default-avatar.png"
                          }
                          alt={`${user.firstName} ${user.lastName}`}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setProfileOpen(true);
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-white font-medium truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <span className="text-xs text-gray-400">
                              {formatTime(conv?.lastTimestamp)}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs mb-1">
                            {user._id === supervisor?._id
                              ? "Supervisor"
                              : "Peer"}
                          </p>
                          <div className="flex justify-between items-center text-sm text-gray-300">
                            {/* <span className="truncate">
                          {renderMessagePreview(conv?.lastMessage)}
                        </span> */}
                            <div className="flex items-center gap-1 min-w-0">
                              {conv &&
                                conv.from === student.userId._id.toString() && (
                                  <div className="shrink-0">
                                    <MessageStatusIcon
                                      status={conv.lastStatus}
                                    />
                                  </div>
                                )}
                              <span className="truncate block flex-1">
                                {renderMessagePreview(conv?.lastMessage)}
                              </span>
                            </div>
                            {unreadCount > 0 && (
                              <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {unreadCount > 9 ? "9+" : unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-gray-400 col-span-full text-center mt-4">
                {allChatUsers.length === 0
                  ? "No users available."
                  : "No users found matching your search."}
              </p>
            )}
          </div>
          {/* Chat Drawer */}
          {selectedUser && (
            <ChatDrawer
              isOpen={chatOpen}
              onClose={() => setChatOpen(false)}
              userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
              userPicture={selectedUser.picture}
              senderId={student.userId._id.toString()}
              recipientId={selectedUser._id.toString()}
              userType="student"
              recipientUserType={selectedUser.userType}
              page="projects"
              contextType="project"
              contextId={project._id.toString()}
              getApprovedProjectTitle={getApprovedProjectTitle}
            />
          )}
          {/* Profile Drawer */}
          {selectedUser && profileOpen && (
            <UserProfileDrawer
              isOpen={profileOpen}
              onClose={() => setProfileOpen(false)}
              user={{
                fullName: `${selectedUser.firstName} ${selectedUser.lastName}`,
                picture: selectedUser.picture,
                role: selectedUser.userType,
                email: selectedUser.email,
                phone: selectedUser.phone,
                program: (selectedUser as any).program.type,
                studyMode: (selectedUser as any).studyMode.name || "",
                expertise: (selectedUser as any).expertise,
                experience: (selectedUser as any).yearsOfExperience,
              }}
              showMessageButton
              onMessageClick={() => {
                setProfileOpen(false);
                setChatOpen(true);
              }}
            />
          )}{" "}
        </>
      )}
    </>
  );
};
