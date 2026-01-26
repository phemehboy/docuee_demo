"use client";

import { useState } from "react";
import { Megaphone, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAnnouncements } from "../hooks/useAnnouncements";
import { motion, AnimatePresence, MotionProps } from "framer-motion";

function formatRole(role: string): string {
  switch (role) {
    case "schoolAdmin":
      return "School Admin";
    case "supervisor":
      return "Supervisor";
    case "instructor":
      return "Instructor";
    case "student":
      return "Student";
    default:
      return role;
  }
}

type AnnouncementListProps = {
  role?: "student" | "supervisor" | "instructor" | "all";
  destination:
    | "projects"
    | "courses"
    | "billing"
    | "resources"
    | "dashboard"
    | "custom";
  schoolId?: string;
  department?: string | string[];
};

export function Announcements({
  role = "all",
  destination,
  schoolId,
  department,
}: AnnouncementListProps) {
  const { data: announcements, isLoading } = useAnnouncements(
    role,
    destination,
    schoolId,
    department
  );
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(
    null
  );

  const validAnnouncements = announcements?.filter((a) => {
    return !a.expiryDate || new Date(a.expiryDate) > new Date();
  });

  if (isLoading || !announcements?.length) return null;

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {validAnnouncements?.map((a, index) => {
          const isExternal = a.actionLink && /^https?:\/\//.test(a.actionLink);
          const linkTarget = isExternal ? "_blank" : "_self";
          const showViewMore = a.message?.length > 150;

          return (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 
                           text-white rounded-2xl shadow-lg border-0 hover:scale-[1.02] hover:shadow-2xl transition-transform duration-300"
              >
                <CardContent className="p-5 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-2 relative">
                    <motion.div
                      className="relative"
                      animate={{ rotate: [0, 5, -5, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      {...({} as MotionProps &
                        React.HTMLAttributes<HTMLDivElement>)}
                    >
                      <Megaphone className="w-6 h-6 text-yellow-300" />
                      <motion.span
                        className="absolute top-1 left-6 w-2 h-2 rounded-full bg-yellow-400"
                        animate={{
                          scale: [0.8, 1.5, 0.8],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          ease: "easeInOut",
                          repeatDelay: 0.3,
                        }}
                        {...({} as MotionProps &
                          React.HTMLAttributes<HTMLDivElement>)}
                      />
                      <motion.span
                        className="absolute top-1 left-8 w-2 h-2 rounded-full bg-yellow-300"
                        animate={{
                          scale: [0.8, 1.5, 0.8],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          ease: "easeInOut",
                          repeatDelay: 0.5,
                        }}
                        {...({} as MotionProps &
                          React.HTMLAttributes<HTMLDivElement>)}
                      />
                    </motion.div>
                    <h2 className="text-lg font-bold">{a.title}</h2>
                  </div>

                  {/* Author info */}
                  {(a.createdByName || a.userType) && (
                    <p className="text-xs text-white/90 italic">
                      Announcement from{" "}
                      <span className="font-semibold text-yellow-200">
                        {a.createdByName || "Unknown"}
                      </span>{" "}
                      {a.department && a.userType === "instructor"
                        ? "(HOD)"
                        : a.userType
                          ? `(${formatRole(a.userType)})`
                          : ""}
                    </p>

                    // <p className="text-xs text-white/90 italic">
                    //   Announcement from{" "}
                    //   <span className="font-semibold text-yellow-200">
                    //     {a.createdByName || "Unknown"}
                    //   </span>{" "}
                    //   {a.userType ? `(${formatRole(a.userType)})` : ""}
                    // </p>
                  )}

                  {/* Message (truncated) */}
                  <p className="text-sm text-blue-50 leading-relaxed line-clamp-2">
                    {a.message}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-500">
                      {new Date(a.date).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {showViewMore && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-white border-white/50 hover:bg-white/10"
                          onClick={() => setSelectedAnnouncement(a)}
                        >
                          View More
                        </Button>
                      )}

                      {destination === "custom" && a.actionLink && (
                        <Button
                          asChild
                          size="sm"
                          className="bg-white text-blue-700 hover:bg-blue-100 rounded-full"
                        >
                          <Link
                            href={a.actionLink}
                            target={linkTarget}
                            rel="noopener noreferrer"
                          >
                            View <ExternalLink className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Dialog for full view */}
      <Dialog
        open={!!selectedAnnouncement}
        onOpenChange={() => setSelectedAnnouncement(null)}
      >
        <DialogContent
          className="
            bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 
            text-white max-w-lg max-h-[80vh] overflow-y-auto 
            rounded-2xl shadow-2xl p-6
            flex flex-col text-left
          "
        >
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-bold text-yellow-300 mb-2">
              {selectedAnnouncement?.title}
            </DialogTitle>

            <DialogDescription className="text-sm text-blue-50 whitespace-pre-wrap leading-relaxed mb-4">
              {selectedAnnouncement?.message}
            </DialogDescription>

            <div className="flex flex-col text-xs text-white/90 mb-4">
              <p>
                From:{" "}
                <span className="font-semibold text-yellow-200">
                  {selectedAnnouncement?.createdByName || "Unknown"}{" "}
                  {selectedAnnouncement?.userType
                    ? `(${formatRole(selectedAnnouncement.userType)})`
                    : ""}
                </span>
              </p>
              <p>
                Date: {new Date(selectedAnnouncement?.date).toLocaleString()}
              </p>
            </div>

            {selectedAnnouncement?.actionLink &&
              /^https?:\/\//.test(selectedAnnouncement.actionLink) && (
                <Button
                  asChild
                  size="sm"
                  className="mb-4 bg-white text-blue-700 hover:bg-blue-100 rounded-full"
                >
                  <Link
                    href={selectedAnnouncement.actionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Link <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                className="text-white border-white/50 hover:bg-white/10"
                onClick={() => setSelectedAnnouncement(null)}
              >
                Close
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
