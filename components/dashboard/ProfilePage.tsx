"use client";

import { useState } from "react";
import { IUser } from "@/lib/database/models/user.model";
import { format } from "date-fns";
import { UserCircle, Mail, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IDepartment } from "@/lib/database/models/department.model";
import { cn } from "@/lib/utils";
import { countryOptions } from "@/constants";
import { formatStudyMode } from "@/lib/formatStudyMode/formatStudyMode";
import SupportBanner from "@/components/SupportBanner";
import EditProfileModal from "../EditProfileModal";

interface ProfilePageProps {
  initialProfile: IUser; // IUser type
}

export default function ProfilePage({ initialProfile }: ProfilePageProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [editOpen, setEditOpen] = useState(false);

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const userType = profile.userType.toUpperCase();

  const renderArray = (
    items: any[] | undefined,
    fallbackField?: string,
    renderFn?: (item: any) => string,
    unique = false, // new param
  ) => {
    if (!items || items.length === 0) return "—";

    let values = items
      .map((item) => {
        if (!item) return "";
        if (typeof item === "string") return item;
        if (renderFn) return renderFn(item);
        if (fallbackField && item[fallbackField]) return item[fallbackField];
        if (item.name) return item.name;
        if (item.type) return item.type;
        return "";
      })
      .filter(Boolean);

    if (unique) {
      values = Array.from(new Set(values)); // ✅ dedupe
    }

    return values.join(", ");
  };

  const formatProgram = (prog: any) => {
    if (!prog || typeof prog !== "object" || !("type" in prog)) return "—";
    const dept =
      typeof prog.department === "object" && "name" in prog.department
        ? prog.department.name
        : "";
    return `${prog.type || "—"}${dept ? ` - ${dept}` : ""}`;
  };

  return (
    <main className="min-h-screen flex flex-col max-w-6xl mx-auto">
      <div className="flex-1 py-2 md:p-4 lg:mt-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-300">
            My Profile
          </h1>
          <Button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2 rounded-xl shadow-sm bg-blue-600 text-white hover:bg-blue-700 w-auto"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Summary */}
        <Card
          className={cn(
            "border-none bg-black-900", // default
            profile.userType === "schoolAdmin" &&
              "dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800",
          )}
        >
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-3 sm:gap-4 w-full">
              {/* Avatar */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0">
                {profile.picture ? (
                  <img
                    src={profile.picture}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-600 dark:text-gray-300" />
                )}
              </div>

              {/* User info */}
              <div className="text-center sm:text-left">
                <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                  {fullName}
                  {profile?.isHOD && profile?.hodDepartment && (
                    <span className="px-2 py-0.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-full">
                      HOD
                    </span>
                  )}
                </CardTitle>

                <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-1 text-sm sm:text-base">
                  <Mail className="w-4 h-4" /> {profile.email}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {userType} • Joined{" "}
                  {profile.joinedAt
                    ? format(new Date(profile.joinedAt), "PPP")
                    : "—"}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Details */}
        <Card
          className={cn(
            "border-none bg-black-900", // default classes
            profile.userType === "schoolAdmin" &&
              "dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800",
          )}
        >
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <Detail label="Username" value={profile.username} />
            <Detail
              label="School"
              value={(profile.school as any)?.name || "—"}
            />
            <Detail
              label="Country"
              value={
                countryOptions.find((c) => c.value === profile.country)
                  ?.label ||
                profile.country ||
                "—"
              }
            />
            <Detail label="Time Zone" value={profile.timeZone || ""} />
            <Detail
              label="Gender"
              value={
                profile.gender
                  ? profile.gender.charAt(0).toUpperCase() +
                    profile.gender.slice(1).toLowerCase()
                  : "—"
              }
            />

            {/* Student Section */}
            {profile.userType === "student" && (
              <>
                <Detail
                  label="Department"
                  value={renderArray(profile.department)}
                />
                <Detail label="Level" value={renderArray(profile.level)} />
                <Detail
                  label="Program"
                  value={
                    Array.isArray(profile.program)
                      ? profile.program.map(formatProgram).join(", ")
                      : formatProgram(profile.program)
                  }
                />
                <Detail
                  label="Study Mode"
                  value={renderArray(
                    Array.isArray(profile.studyMode)
                      ? profile.studyMode
                      : [profile.studyMode],
                    undefined, // fallbackField
                    formatStudyMode, // renderFn to format each study mode
                  )}
                />
              </>
            )}

            {/* Instructor / Supervisor Section */}
            {(profile.userType === "instructor" ||
              profile.userType === "supervisor") && (
              <>
                <Detail
                  label={`Departments ${
                    profile.userType === "supervisor"
                      ? "Supervising"
                      : "Teaching"
                  }`}
                  value={renderArray(profile.department)}
                />
                <Detail
                  label={`Levels ${
                    profile.userType === "supervisor"
                      ? "Supervising"
                      : "Teaching"
                  }`}
                  value={renderArray(profile.level, undefined, undefined, true)}
                />
                {profile?.isHOD && profile?.hodDepartment && (
                  <Detail
                    label="My Department"
                    value={(profile.hodDepartment as IDepartment).name}
                  />
                )}
                <Detail
                  label={`Programs ${
                    profile.userType === "supervisor"
                      ? "Supervising"
                      : "Teaching"
                  }`}
                  value={
                    Array.isArray(profile.program)
                      ? profile.program.map(formatProgram).join(", ")
                      : formatProgram(profile.program)
                  }
                />
                <Detail
                  label={`Study Modes ${
                    profile.userType === "supervisor"
                      ? "Supervising"
                      : "Teaching"
                  }`}
                  value={renderArray(
                    Array.isArray(profile.studyMode)
                      ? profile.studyMode
                      : [profile.studyMode],
                    undefined, // fallbackField, not needed here
                    formatStudyMode, // renderFn
                  )}
                />

                <Detail
                  label="Designation"
                  value={(profile.designation as any)?.name || "—"}
                />
                <Detail
                  label="Expertise"
                  value={renderArray(profile.expertise)}
                />
                <Detail
                  label="Experience"
                  value={`${profile.yearsOfExperience || "—"} years`}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        {editOpen && (
          <EditProfileModal
            profile={profile}
            open={editOpen}
            onClose={() => setEditOpen(false)}
            onUpdated={(updatedProfile: IUser) => setProfile(updatedProfile)}
          />
        )}
      </div>
      <SupportBanner
        link={`/user/${initialProfile._id}/usertype/${initialProfile.userType}/dashboard/support`}
      />
    </main>
  );
}

/* Small reusable detail component */
function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-sm md:text-base text-gray-900 dark:text-gray-100">
        {value || "—"}
      </p>
    </div>
  );
}
