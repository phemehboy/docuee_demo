"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "@/components/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Props {
  open: boolean;
  onClose: () => void;
  score?: number;
  comment?: string;
  isSupervisor: boolean;
  stageLabel: string;
  projectId: Id<"projects">;
  stageKey: string;
}

export const GradeDetailsModal = ({
  open,
  onClose,
  score,
  comment,
  isSupervisor,
  stageLabel,
  projectId,
  stageKey,
}: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [newScore, setNewScore] = useState(score?.toString() ?? "0");
  const [newComment, setNewComment] = useState(comment || "");

  const gradeStage = useMutation(api.projects.gradeStage);

  const handleUpdate = async () => {
    try {
      await gradeStage({
        projectId,
        stage: stageKey,
        score: Number(newScore),
        comment: newComment,
      });
      toast({ description: "✅ Grade updated successfully." });
      onClose();
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to update grade. Try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black-900 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            📊 Grade Details - {stageLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Score</Label>
            <Input
              type="number"
              min={0}
              max={100}
              disabled={!editMode}
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
            />
          </div>
          <div>
            <Label>Feedback</Label>
            <Textarea
              disabled={!editMode}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            onClick={onClose}
            variant="ghost"
            className="hover:text-blue-300"
          >
            Close
          </Button>

          {isSupervisor && (
            <>
              {editMode ? (
                <Button
                  onClick={handleUpdate}
                  disabled={
                    !newScore || Number(newScore) > 100 || Number(newScore) < 0
                  }
                  className="bg-blue-700 text-white hover:bg-blue-800"
                >
                  Save Changes
                </Button>
              ) : (
                <Button
                  onClick={() => setEditMode(true)}
                  className="bg-yellow-700 text-white hover:bg-yellow-800"
                >
                  ✏️ Edit Grade
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
