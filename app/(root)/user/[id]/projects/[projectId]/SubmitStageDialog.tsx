"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface SubmitStageDialogProps {
  onConfirm: () => Promise<void> | void;
  stageLabel: string;
  isResubmission?: boolean; // ✅ new prop
}

export const SubmitStageDialog = ({
  onConfirm,
  stageLabel,
  isResubmission = false,
}: SubmitStageDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`mt-4 flex items-center gap-2 cursor-pointer ${
            isResubmission
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={loading}
        >
          {loading && (
            <Loader2 className="size-3.5 sm:size-4 text-muted-foreground animate-spin" />
          )}
          {loading
            ? isResubmission
              ? "Resubmitting..."
              : "Submitting..."
            : isResubmission
              ? `Resubmit ${stageLabel}`
              : `Submit ${stageLabel}`}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="bg-black-900"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isResubmission
              ? `Resubmit ${stageLabel}?`
              : `Submit ${stageLabel}?`}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-400">
          {isResubmission
            ? "Are you sure you want to resubmit this stage? This will replace your previous submission. You’ll need to wait for your supervisor to review it again."
            : "Are you sure you want to submit this stage? You won’t be able to edit it again until your supervisor enables editing."}
        </p>

        <DialogFooter className="mt-4 flex flex-col-reverse gap-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="border cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex items-center gap-2 cursor-pointer ${
              isResubmission
                ? "bg-yellow-700 text-yellow-100 hover:bg-yellow-800"
                : "bg-green-800 text-green-200 hover:bg-green-900"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading
              ? isResubmission
                ? "Resubmitting..."
                : "Submitting..."
              : isResubmission
                ? "Yes, Resubmit"
                : "Yes, Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
