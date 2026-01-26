"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onConfirm: (score: number, comment: string) => void;
  stageLabel: string;
  children: React.ReactNode;
}

export const MarkAndGradeDialog = ({
  onConfirm,
  stageLabel,
  children,
}: Props) => {
  const [open, setOpen] = React.useState(false);
  const [score, setScore] = React.useState("");
  const [comment, setComment] = React.useState("");

  const handleConfirm = () => {
    onConfirm(Number(score), comment);
    setOpen(false);
    setScore("");
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="bg-black-900 max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Mark & Grade: {stageLabel}</DialogTitle>
          <DialogDescription className="text-gray-400 text-left">
            You are marking <strong className="text-white">{stageLabel}</strong>{" "}
            as completed and grading it. The student will proceed to the next
            stage after this.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Input
            placeholder="Score out of 100"
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
          <Textarea
            placeholder="Supervisor feedback (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <DialogFooter className="w-full flex flex-col gap-2 md:flex-row-reverse">
          <Button
            onClick={handleConfirm}
            disabled={!score || Number(score) > 100 || Number(score) < 0}
            className="bg-green-800 text-green-200 hover:bg-green-900 order-1 md:order-1"
          >
            Yes, Mark as Completed & Grade
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="order-2 md:order-2"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
