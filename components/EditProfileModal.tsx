"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IUser } from "@/lib/database/models/user.model";
import { updateUserById } from "@/lib/actions/user.action";

import { ISchool } from "@/lib/database/models/school.model";
import { countryOptions } from "@/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import TagInput from "./TagInput";
import { toast } from "sonner";

type Gender = "male" | "female" | "other" | "";

interface FormState {
  username: string;
  email: string;
  phone: string;
  country: string;
  gender: Gender;
  expertise: string[];
  yearsOfExperience: string;
  timeZone?: string;
}

export default function EditProfileModal({
  profile,
  open,
  onClose,
  onUpdated,
}: {
  profile: IUser;
  open: boolean;
  onClose: () => void;
  onUpdated: (updatedProfile: IUser) => void;
}) {
  const [form, setForm] = useState<FormState>({
    username: profile.username || "",
    email: profile.email || "",
    phone: profile.phone || "",
    country: profile.country || "",
    gender: (profile.gender as Gender) || "",
    expertise: profile.expertise || [],
    yearsOfExperience: profile.yearsOfExperience?.toString() || "",
    timeZone: profile.timeZone || "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // === DEMO: simulate saving without updating anything ===
      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1 second
      const updatedProfile = { ...profile, ...form }; // just merge form locally

      toast.success("Profile updated! (demo mode)");
      onUpdated(updatedProfile); // still call callback so UI updates
      onClose();
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black-900 max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle asChild>
            <button type="button" className="cursor-pointer hover:underline">
              Edit Profile
            </button>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {/* Editable fields */}
          <div>
            <Label>Username</Label>
            <Input
              name="username"
              value={form.username}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div>
            <Label>Country</Label>
            <Input
              value={
                countryOptions.find((c) => c.value === form.country)?.label ||
                form.country ||
                "—"
              }
              disabled
            />
            <p className="text-xs text-gray-400 mt-1">
              Need to change your country or having issues? Please contact
              support.
            </p>
          </div>

          <div>
            <Label>Gender</Label>
            <Select
              name="gender"
              value={form.gender}
              onValueChange={(value: Gender) =>
                setForm({ ...form, gender: value })
              }
            >
              <SelectTrigger className="w-full select-trigger">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent className="select-content">
                <SelectItem value="male" className="select-item">
                  Male
                </SelectItem>
                <SelectItem value="female" className="select-item">
                  Female
                </SelectItem>
                <SelectItem value="other" className="select-item">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show expertise + years only for instructor & supervisor */}
          {(profile.userType === "instructor" ||
            profile.userType === "supervisor") && (
            <>
              <div>
                <Label>Expertise</Label>
                <TagInput
                  value={form.expertise}
                  onChange={(tags) => setForm({ ...form, expertise: tags })}
                  placeholder="e.g. AI, Machine Learning, Data Science"
                />
              </div>
              <div>
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  name="yearsOfExperience"
                  value={form.yearsOfExperience}
                  onChange={(e) =>
                    setForm({ ...form, yearsOfExperience: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {/* Non-editable fields */}
          <div>
            <Label>School</Label>
            <Input value={(profile.school as ISchool)?.name || "—"} disabled />
          </div>
          <div>
            <Label>User Type</Label>
            <Input value={profile.userType} disabled />
          </div>

          {/* Department/Level/Study Mode conditions */}
          {profile.userType !== "schoolAdmin" && (
            <>
              {profile.userType === "student" ? (
                <>
                  <div>
                    <Label>Department</Label>
                    <Input
                      value={
                        Array.isArray(profile.department) &&
                        profile.department.length > 0
                          ? profile.department
                              .map((dept) =>
                                typeof dept === "object" && "name" in dept
                                  ? dept.name
                                  : "",
                              )
                              .filter(Boolean) // remove empty strings
                              .join(", ") // convert array -> "Dept1, Dept2"
                          : "—"
                      }
                      disabled
                    />
                  </div>

                  <div>
                    <Label>Level</Label>
                    <Input
                      value={
                        Array.isArray(profile.level) && profile.level.length > 0
                          ? profile.level
                              .map((lvl) =>
                                typeof lvl === "object" && "name" in lvl
                                  ? lvl.name
                                  : "",
                              )
                              .filter(Boolean)
                              .join(", ") // if multiple levels exist, show them as "Level1, Level2"
                          : "—"
                      }
                      disabled
                    />
                  </div>

                  <div>
                    <Label>Study Mode</Label>
                    <Input
                      value={
                        Array.isArray(profile.studyMode) &&
                        profile.studyMode.length > 0
                          ? profile.studyMode
                              .map((mode) =>
                                typeof mode === "object" && "name" in mode
                                  ? mode.name
                                  : "",
                              )
                              .filter(Boolean)
                              .join(", ") // display multiple as "Mode1, Mode2"
                          : "—"
                      }
                      disabled
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Department(s)</Label>
                    <Input
                      value={
                        Array.isArray(profile.department)
                          ? profile.department
                              .map((d: any) => d.name)
                              .join(", ")
                          : "—"
                      }
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Level(s)</Label>
                    <Input
                      value={
                        Array.isArray(profile.level)
                          ? profile.level.map((l: any) => l.name).join(", ")
                          : "—"
                      }
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Study Mode(s)</Label>
                    <Input
                      value={
                        Array.isArray(profile.studyMode)
                          ? profile.studyMode.map((m: any) => m.name).join(", ")
                          : "—"
                      }
                      disabled
                    />
                  </div>
                </>
              )}
            </>
          )}

          {profile.userType !== "student" && (
            <div>
              <Label>Designation</Label>
              <Input
                value={(profile.designation as any)?.name || "—"}
                disabled
              />
            </div>
          )}

          <div>
            <Label>Time Zone</Label>
            <Select
              value={form.timeZone || ""}
              onValueChange={(value: string) =>
                setForm({ ...form, timeZone: value })
              }
            >
              <SelectTrigger className="select-trigger">
                <SelectValue placeholder="Select Time Zone" />
              </SelectTrigger>
              <SelectContent className="select-content">
                {Intl.supportedValuesOf("timeZone").map((tz) => (
                  <SelectItem key={tz} value={tz} className="select-item">
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
