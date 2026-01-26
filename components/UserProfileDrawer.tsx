"use client";

import { formatStudyMode } from "@/lib/formatStudyMode/formatStudyMode";
import { normalizeStringOrObjectArray } from "@/lib/utils";
import { motion, AnimatePresence, MotionProps } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import { useRef } from "react";

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    fullName: string;
    picture?: string;
    role?: string;
    email?: string;
    phone?: string;
    program?: string | string[] | null;
    studyMode?: string;
    expertise?: string[];
    experience?: number;
    group?: string;
  };
  showMessageButton?: boolean;
  onMessageClick?: () => void;
}

export default function UserProfileDrawer({
  isOpen,
  onClose,
  user,
  showMessageButton = false,
  onMessageClick,
}: UserProfileDrawerProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  console.log("UserProfileDrawer USER", user);

  // ✅ Detect click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleMessageClick = () => {
    if (onMessageClick) onMessageClick();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          {...({} as MotionProps & React.HTMLAttributes<HTMLDivElement>)}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...({} as MotionProps & React.HTMLAttributes<HTMLDivElement>)}
          />

          {/* Drawer modal */}
          <motion.div
            ref={modalRef}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col z-50"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            {...({} as MotionProps & React.HTMLAttributes<HTMLDivElement>)}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-600 hover:text-black transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Scrollable content */}
            <div className="overflow-y-auto">
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                <img
                  src={user.picture || "/default-profile.jpg"}
                  alt="profile"
                  className="w-44 h-44 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>

              <div className="px-6 py-4 text-center space-y-2">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {user.fullName}
                </h2>
                <p className="text-sm text-gray-500">{user.role || "User"}</p>

                <div className="mt-4 text-left space-y-2 text-gray-700 text-sm">
                  <p>
                    <strong>Email:</strong> {user.email || "N/A"}
                  </p>
                  {user.phone && (
                    <p>
                      <strong>Phone:</strong> {user.phone}
                    </p>
                  )}
                  {(() => {
                    const programs = normalizeStringOrObjectArray(user.program);

                    return programs.length ? (
                      <div>
                        <strong>Programs:</strong>
                        <div className="mt-1">
                          {programs.length > 1 ? (
                            <ul className="list-disc list-inside">
                              {programs.map((p, i) => (
                                <li key={i}>{p}</li>
                              ))}
                            </ul>
                          ) : (
                            programs[0]
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {(() => {
                    const studyModes = normalizeStringOrObjectArray(
                      user.studyMode,
                    );
                    return studyModes.length ? (
                      <p>
                        <strong>Study Mode:</strong>{" "}
                        {formatStudyMode(studyModes.join(", "))}
                      </p>
                    ) : null;
                  })()}

                  {user.group && (
                    <p>
                      <strong>Group:</strong> {user.group}
                    </p>
                  )}

                  {/* ✅ Show Years of Experience only for instructors or supervisors */}
                  {(user.role === "instructor" || user.role === "supervisor") &&
                    user.experience !== undefined && (
                      <p>
                        <strong>Years of Experience:</strong>{" "}
                        {user.experience || 0}
                      </p>
                    )}

                  {user.expertise && user.expertise.length > 0 && (
                    <p>
                      <strong>Expertise:</strong> {user.expertise.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Floating chat button */}
            {showMessageButton && (
              <div className="absolute bottom-6 right-6">
                <motion.button
                  onClick={handleMessageClick}
                  className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition cursor-pointer"
                  whileTap={{ scale: 0.9 }}
                >
                  <MessageCircle className="w-6 h-6" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
