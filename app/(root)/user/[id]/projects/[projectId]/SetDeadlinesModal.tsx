"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "@/components/hooks/use-toast";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { keyToLabel } from "@/lib/stages";
import { StageEditor } from "@/components/StageEditor";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type ModalStep = "stages" | "deadlines";

export const SetDeadlinesModal = ({
  open,
  setOpen,
  project,
  selectedStage,
  onDeadlineSaved,
}: {
  open: boolean;
  setOpen: (b: boolean) => void;
  project?: Doc<"projects">;
  selectedStage?: string;
  onDeadlineSaved?: (stage: string) => void;
}) => {
  // if (selectedStage && onDeadlineSaved) {
  //   onDeadlineSaved(selectedStage);
  // }

  const finalizeStagesAndDeadlines = useMutation(
    api.projects.finalizeStagesAndDeadlines
  );

  const [stages, setStages] = useState<
    { key: string; label: string; order: number }[]
  >([]);
  const [deadlines, setDeadlines] = useState<Record<string, Date | undefined>>(
    {}
  );
  const [fines, setFines] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [stagesLoading, setStagesLoading] = useState(false);
  const stageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stepRef = useRef<ModalStep>("stages");
  const [step, setStep] = useState<ModalStep>(stepRef.current);

  const goToStep = (newStep: ModalStep) => {
    stepRef.current = newStep;
    setStep(newStep);
  };

  // Get stage keys from Convex and sort by `order`
  const stageKeys = Object.keys(project?.submissionStages ?? {}).sort(
    (a, b) => {
      const stageA = project!.submissionStages![a]; // `!` because we know it's not undefined here
      const stageB = project!.submissionStages![b];
      return (stageA.order ?? 0) - (stageB.order ?? 0);
    }
  );

  // const stageKeys = projectFromConvex?.submissionStages
  //   ? Object.keys(projectFromConvex.submissionStages)
  //   : [];
  const fallbackStages = [
    "proposal",
    "chapter1",
    "chapter2",
    "chapter3",
    "finalsubmission",
  ];
  const effectiveStages = stageKeys.length ? stageKeys : fallbackStages;

  const visibleStages = selectedStage
    ? [selectedStage]
    : stages.map((s) => s.key);

  const hasInitializedStages = useRef(false);

  useEffect(() => {
    if (!open) return;

    if (selectedStage) {
      // ✅ Single-stage update → skip stages
      stepRef.current = "deadlines";
      setStep("deadlines");
    } else {
      // ✅ Full setup → start from stages
      stepRef.current = "stages";
      setStep("stages");
    }
  }, [open, selectedStage]);

  useEffect(() => {
    if (!open || !project?.submissionStages) return;

    const stageArray = Object.entries(project.submissionStages)
      .map(([key, value]) => ({
        key,
        label: keyToLabel(key),
        order: value.order ?? 0,
      }))
      .sort((a, b) => a.order - b.order);

    setStages(stageArray);

    const newDeadlines: Record<string, Date | undefined> = {};
    const newFines: Record<string, number> = {};

    const stages = project?.submissionStages;
    if (!stages) return;

    stageArray.forEach(({ key }) => {
      const data = stages[key];
      newDeadlines[key] = data?.deadline ? new Date(data.deadline) : undefined;
      newFines[key] = data?.fine?.amount ?? getMinFine();
    });

    setDeadlines(newDeadlines);
    setFines(newFines);
  }, [open, project]);

  useEffect(() => {
    if (!project?.submissionStages) return;

    const newDeadlines: Record<string, Date | undefined> = {};
    const newFines: Record<string, number> = {};

    effectiveStages.forEach((stage) => {
      const data = project.submissionStages?.[stage];

      // Always set a number for fine, even if missing
      newFines[stage] = data?.fine?.amount ?? 0;

      newDeadlines[stage] = data?.deadline
        ? new Date(data.deadline)
        : undefined;
    });

    setDeadlines(newDeadlines);
    setFines(newFines);
  }, [project?._id]);

  useEffect(() => {
    if (open && selectedStage && stageRefs.current[selectedStage]) {
      stageRefs.current[selectedStage]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [open, selectedStage]);

  useEffect(() => {
    if (!hasInitializedStages.current && project?.submissionStages) {
      // Initialize stages only, do NOT touch `step` here
      hasInitializedStages.current = true;
    }
  }, [project?.submissionStages]);

  const handleDateChange = (stage: string, date: Date | undefined) => {
    if (!date) return;
    setDeadlines((prev) => ({ ...prev, [stage]: date }));
  };

  const getMinFine = () =>
    project?.studentCountry?.toLowerCase() === "ng" ? 1500 : 1;

  const currencySymbol =
    project?.studentCountry?.toLowerCase() === "ng" ? "₦" : "$";

  const handleSave = async () => {
    setLoading(true);

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // ✅ Validate deadlines not in the past
      for (const stage of visibleStages) {
        const date = deadlines[stage];
        if (!date) {
          toast({
            variant: "destructive",
            description: `Please set a deadline for ${keyToLabel(stage)}.`,
          });
          setLoading(false);
          return;
        }

        if (date < today) {
          toast({
            variant: "destructive",
            description: `Deadline for ${keyToLabel(stage)} cannot be in the past.`,
          });
          setLoading(false);
          return;
        }
      }

      // ✅ Enforce stage order consistency
      const orderedStages = stages
        .map((s) => ({
          stage: s.key,
          order: s.order ?? 0,
          date: deadlines[s.key],
        }))
        .sort((a, b) => a.order - b.order);

      // ✅ If updating a single stage, check only its neighbors
      if (selectedStage) {
        const currentIndex = orderedStages.findIndex(
          (s) => s.stage === selectedStage
        );
        const current = orderedStages[currentIndex];
        const prev = orderedStages[currentIndex - 1];
        const next = orderedStages[currentIndex + 1];

        if (prev?.date && current.date && current.date <= prev.date) {
          toast({
            variant: "destructive",
            description: `Deadline for ${keyToLabel(
              current.stage
            )} must be AFTER ${keyToLabel(prev.stage)}.`,
          });
          setLoading(false);
          return;
        }

        if (next?.date && current.date && current.date >= next.date) {
          toast({
            variant: "destructive",
            description: `Deadline for ${keyToLabel(
              current.stage
            )} must be BEFORE ${keyToLabel(next.stage)}.`,
          });
          setLoading(false);
          return;
        }
      } else {
        // ✅ If setting all deadlines, ensure full ascending order
        for (let i = 0; i < orderedStages.length - 1; i++) {
          const current = orderedStages[i];
          const next = orderedStages[i + 1];
          if (current.date && next.date && current.date > next.date) {
            toast({
              variant: "destructive",
              description: `Deadline for ${keyToLabel(
                current.stage
              )} cannot be after ${keyToLabel(next.stage)}.`,
            });
            setLoading(false);
            return;
          }
        }
      }

      // ✅ Enforce minimum fine
      const minFine = getMinFine();
      for (const stage of visibleStages) {
        const fineAmount = fines[stage];
        if (fineAmount == null || fineAmount < minFine) {
          toast({
            variant: "destructive",
            description: `Please set a fine of at least ${currencySymbol}${minFine} for ${keyToLabel(stage)}.`,
          });
          setLoading(false);
          return;
        }
      }
      const adjustedFines = { ...fines };
      visibleStages.forEach((stage) => {
        if (!adjustedFines[stage] || adjustedFines[stage] < minFine) {
          adjustedFines[stage] = minFine;
        }
      });

      // ✅ Prepare deadlines for saving
      const formattedDeadlines = visibleStages.map((stage) => ({
        stage,
        deadline: deadlines[stage] ? formatDate(deadlines[stage]!) : null,
        fine: {
          amount: adjustedFines[stage],
          isPaid: false,
        },
      }));

      await finalizeStagesAndDeadlines({
        projectId: project?._id as Id<"projects">,
        stages,
        deadlines: formattedDeadlines,
      });

      // ✅ Update in Mongo
      const mongoRes = await fetch("/api/projects/update-deadlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project?.projectId,
          stages,
          deadlines: formattedDeadlines.map((item) => ({
            ...item,
            fine: {
              ...item.fine,
              currency:
                project?.studentCountry?.toLowerCase() === "ng" ? "NGN" : "USD",
            },
          })),
        }),
      });

      if (!mongoRes.ok) throw new Error("Mongo update failed");

      // ✅ Notify student
      if (project?.studentEmail) {
        const emailBody = `
        <p>Your supervisor has ${
          selectedStage ? "updated a deadline" : "set deadlines"
        } for your project:</p>
        <ul>
          ${formattedDeadlines
            .map(
              (d) =>
                `<li><strong>${keyToLabel(d.stage)}</strong>: ${
                  d.deadline
                    ? new Date(d.deadline).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "No date set"
                }</li>`
            )
            .join("")}
        </ul>
      `;

        await fetch("/api/email/send-docuee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: project?.studentEmail,
            subject: "Project Deadlines Updated",
            title: "📘 Project Deadline Update",
            body: emailBody,
            buttonText: "View Deadlines",
            buttonUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/user/${project?.studentMongoId}/projects/${project?.projectId}`,
            note: "Check your timeline regularly to stay on track.",
            theme: "blue",
          }),
        });
      }

      toast({
        description: selectedStage
          ? "Deadline updated successfully."
          : "Deadlines saved successfully.",
      });

      if (selectedStage && onDeadlineSaved) {
        onDeadlineSaved(selectedStage); // ✅ OK HERE
      }

      setOpen(false);

      // ✅ Reload the page to reflect changes
      window.location.reload();
    } catch (error: any) {
      console.error("Error saving deadlines:", error);

      const message =
        typeof error?.message === "string"
          ? error.message
          : "Something went wrong while saving deadlines.";

      toast({
        variant: "destructive",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmStages = async () => {
    setStagesLoading(true);
    try {
      if (project?.projectType === "journal") {
        // Journals finalize immediately
        await finalizeStagesAndDeadlines({
          projectId: project?._id as Id<"projects">,
          stages,
        });

        // Mongo sync
        await fetch("/api/projects/update-stages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project?.projectId,
            stages,
            stagesLockedBySupervisor: true,
          }),
        });

        toast({ description: "Stages saved successfully." });
        setOpen(false);

        // ✅ Reload the page to reflect changes
        window.location.reload();
      } else {
        // Non-journal → JUST move to next step
        goToStep("deadlines");
      }
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to confirm stages",
      });
    } finally {
      setStagesLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-h-[80vh] overflow-y-auto bg-black-900"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Always render a DialogTitle */}
        <DialogHeader>
          <DialogTitle>
            {step === "stages"
              ? "Review Project Stages"
              : step === "deadlines" && project?.projectType !== "journal"
                ? selectedStage
                  ? `Update Deadline for ${keyToLabel(selectedStage)}`
                  : "Set Deadlines for All Stages"
                : project?.projectType === "journal"
                  ? "Journal Project"
                  : "Dialog"}
          </DialogTitle>
        </DialogHeader>

        {/* Stages step */}
        {step === "stages" && (
          <>
            <DialogDescription>
              You can adjust project stages if necessary. Once you continue,
              stages will be locked.
            </DialogDescription>

            <StageEditor stages={stages} setStages={setStages} />

            <Button
              onClick={handleConfirmStages}
              disabled={stagesLoading}
              className="bg-blue-500 hover:bg-blue-700 w-full mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {stagesLoading
                ? "Saving stages..."
                : `${project?.projectType === "project" ? "Confirm Stages & Continue" : "Update Stages"}`}
            </Button>
          </>
        )}

        {/* Deadlines step for non-journal */}
        {step === "deadlines" && project?.projectType !== "journal" && (
          <>
            <DialogDescription className="text-sm text-gray-400 mt-1 text-left">
              {selectedStage
                ? "Choose a new deadline and fine for this stage."
                : "Choose deadlines for each project stage. A fine will apply if a stage is not submitted before its deadline."}
            </DialogDescription>

            <div className="grid gap-4">
              {visibleStages.map((stage) => (
                <div
                  key={stage}
                  ref={(el) => {
                    stageRefs.current[stage] = el;
                  }}
                  className={`flex flex-col md:flex-row md:items-center gap-2 md:justify-between items-center text-center md:text-left ${
                    selectedStage === stage
                      ? "border border-blue-500 rounded-lg p-2 bg-blue-500/10"
                      : ""
                  }`}
                >
                  <span className="capitalize font-medium w-full md:w-auto">
                    {keyToLabel(stage)}
                  </span>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Calendar
                      showOutsideDays={false}
                      mode="single"
                      selected={deadlines[stage]}
                      onSelect={(date) => handleDateChange(stage, date)}
                      className="rounded-md border"
                      modifiers={{
                        disabled: (date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        },
                      }}
                      modifiersClassNames={{
                        selected: "bg-blue-500 hover:bg-blue-700 text-white",
                        disabled: "opacity-40 cursor-not-allowed",
                      }}
                    />

                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        min={getMinFine()}
                        value={fines[stage] ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setFines((prev) => ({
                            ...prev,
                            [stage]: isNaN(val) ? getMinFine() : val,
                          }));
                        }}
                        onBlur={() =>
                          setFines((prev) => ({
                            ...prev,
                            [stage]:
                              !prev[stage] || prev[stage] < getMinFine()
                                ? getMinFine()
                                : prev[stage],
                          }))
                        }
                        className="w-24 placeholder:text-gray-400 placeholder:text-sm"
                        placeholder={`Min ${currencySymbol}${getMinFine()}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="mt-4 w-full bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
            >
              {loading
                ? "Saving..."
                : selectedStage
                  ? "Update Deadline"
                  : "Save Deadlines"}
            </Button>
          </>
        )}

        {/* Optional: Journal-specific content */}
        {step === "deadlines" && project?.projectType === "journal" && (
          <div className="p-4 text-center text-white">
            ✍️ Start your journal project by clicking on a stage above.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
