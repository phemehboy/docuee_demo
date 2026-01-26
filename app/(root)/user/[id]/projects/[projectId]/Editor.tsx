"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { useEditor, EditorContent } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import { useLiveblocksExtension } from "@liveblocks/react-tiptap";
import { useStorage } from "@liveblocks/react";
import { useOthers, useMyPresence } from "@liveblocks/react";

import { LEFT_MARGIN_DEFAULT, RIGHT_MARGIN_DEFAULT } from "@/constants/margins";
import { FontSizeExtension } from "../extensions/font-size";
import { LineHeightExtension } from "../extensions/line-height";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import Underline from "@tiptap/extension-underline";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";

import { Ruler } from "./Ruler";
import { Threads } from "./Threads";
import { SubmitStageDialog } from "./SubmitStageDialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useEditorStore } from "@/app/(root)/store/use-Editor-store";
import { useRouter } from "next/navigation";
import { keyToLabel } from "@/lib/stages";
import { toast } from "sonner";
import { Loader } from "@/components/ui/Loader";
import { Table } from "@tiptap/extension-table";
import { TextStyle } from "@tiptap/extension-text-style";
import clsx from "clsx";

function debounce(fn: (...args: any[]) => void, delay = 1000) {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

interface EditorProps {
  onTypingStart?: () => void;
  projectId: Id<"projects">;
  isPro: boolean;
  currentStage: { key: string; label: string };
  setCurrentStage: (stage: { key: string; label: string }) => void;
  stageKey: string;
}

const Editor = ({
  onTypingStart,
  projectId,
  currentStage,
  setCurrentStage,
}: EditorProps) => {
  const autosaveRef = useRef<(html: string) => void>(() => {});
  const lastHTMLRef = useRef<string>("");

  const others = useOthers();
  const [myPresence, updateMyPresence] = useMyPresence();

  const { user: currentUser } = useUser();

  const router = useRouter();

  const leftMargin =
    useStorage((root) => root.leftMargin) ?? LEFT_MARGIN_DEFAULT;
  const rightMargin =
    useStorage((root) => root.rightMargin) ?? RIGHT_MARGIN_DEFAULT;

  const project = useQuery(api.projects.getProjectById, { id: projectId });
  const autosaveStageContent = useMutation(api.projects.autosaveStageContent);

  const updateAIContentState = useMutation(
    api.ai.aiInsertions.updateAIContentState,
  );

  const projectType = project?.projectType ?? "project";
  const isJournal = projectType === "journal";

  const stages = project?.submissionStages
    ? Object.entries(project.submissionStages)
        .sort(
          ([_, stageA], [__, stageB]) =>
            (stageA.order ?? 0) - (stageB.order ?? 0),
        )
        .map(([key, value]: [string, any]) => ({
          key,
          label: value?.label || keyToLabel(key),
        }))
    : [];

  const completeStageWithContent = useMutation(
    api.projects.completeStageWithContent,
  );

  const markStageSubmitted = useMutation(api.projects.markStageSubmitted);
  const allowEditing = useMutation(api.projects.allowEditing);

  const liveblocks = useLiveblocksExtension({
    // Don't preload from Convex — let Liveblocks handle persistence
    initialContent: "",
    // offlineSupport_experimental: true,
  });

  const { setEditor } = useEditorStore();

  const hasStartedTyping = useRef(false);

  const currentStageData = project?.submissionStages?.[currentStage.key];

  const isGroupProject =
    Array.isArray(project?.group?.groupStudents) &&
    project.group.groupStudents.length > 0;

  // ✅ Works for both single and group projects
  const isStudent = !!(
    currentUser &&
    (currentUser.id === project?.studentClerkId ||
      project?.group?.groupStudents?.some(
        (student) => student.clerkId === currentUser.id,
      ))
  );

  const editor = useEditor({
    autofocus: true,
    immediatelyRender: false,
    // editable: canEdit,
    extensions: [
      liveblocks,
      // StarterKit.configure({ history: false }),
      StarterKit,
      FontSizeExtension,
      LineHeightExtension,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      ImageResize,
      Underline,
      FontFamily,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Color,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
    ],
    editorProps: {
      attributes: {
        style: `padding-left: ${leftMargin}px; padding-right: ${rightMargin}px;`,
        class:
          "focus:outline-none print:border-0 bg-white border border-[#C7C7C7] flex flex-col min-h-[1054px] w-[816px] pt-10 pr-14 pb-10 cursor-text text-black",
      },
    },
    onTransaction: ({ editor }) => {
      setEditor(editor);

      if (!hasStartedTyping.current && onTypingStart) {
        hasStartedTyping.current = true;
        onTypingStart();
      }
    },
    onDestroy() {
      setEditor(null);
    },
    onUpdate({ editor }) {
      if (!isJournal) return;

      const html = editor.getHTML();
      autosaveRef.current(html);
    },
  });

  const handleStageChange = async (newStage: {
    key: string;
    label: string;
  }) => {
    if (!editor) return;

    setCurrentStage(newStage);
  };

  // Add this at the top of your component
  const DEMO_MODE = true;
  const [completedStages, setCompletedStages] = useState<string[]>([]);

  // Demo handle stage submit
  const handleStageSubmit = async () => {
    if (!editor) return;

    const html = editor.getHTML();
    const isEffectivelyEmpty = html.trim() === "";

    if (isEffectivelyEmpty) {
      toast.error("Cannot submit empty content.");
      return;
    }

    if (DEMO_MODE) {
      // Simulate realistic submission delay
      await new Promise((res) => setTimeout(res, 500));

      // Mark stage as completed in memory
      setCompletedStages((prev) => [...prev, currentStage.key]);

      toast.success(`${currentStage.label} submitted (demo)`);

      // Move to the next stage if any
      const stageIndex = stages.findIndex((s) => s.key === currentStage.key);
      if (stageIndex + 1 < stages.length) {
        const nextStage = stages[stageIndex + 1];
        setCurrentStage(nextStage);

        // Reset editor for next stage
        editor.commands.setContent("<p></p>");
      } else {
        toast.success("🎉 All stages completed!");
      }
    }
  };

  // Keep track of last HTML to avoid redundant saves

  useEffect(() => {
    if (!isJournal || !currentStage?.key) return;

    const autosave = debounce(async (html: string) => {
      if (html === lastHTMLRef.current) return; // skip if no change
      lastHTMLRef.current = html;

      try {
        await autosaveStageContent({
          projectId,
          stage: currentStage.key,
          content: html,
        });
      } catch (err) {
        console.error("Failed to auto-save journal:", err);
      }
    }, 1200);

    autosaveRef.current = autosave;
  }, [isJournal, currentStage?.key, projectId]);

  useEffect(() => {
    if (!editor || !project) return;

    const content = project.submissionStages?.[currentStage.key]?.content ?? "";
    requestAnimationFrame(() => {
      editor.commands.setContent(content || "<p></p>");
    });
  }, [editor, currentStage.key]);

  // Example: mark when user is in this stage
  useEffect(() => {
    updateMyPresence({ stage: currentStage.key });
  }, [currentStage, updateMyPresence]);

  // Detect when a supervisor joins the same stage
  useEffect(() => {
    const supervisorOnStage = others.some(
      (other) =>
        other.info?.userType === "supervisor" &&
        other.presence?.stage === currentStage.key,
    );

    if (supervisorOnStage && isStudent) {
      toast("👀 Your supervisor just joined this stage!");
    }
  }, [others, currentStage, isStudent]);

  const lastStageKey = stages.length > 0 ? stages[stages.length - 1].key : null;
  const lastStageCompleted = lastStageKey
    ? project?.submissionStages?.[lastStageKey]?.completed
    : false;

  const stageIndex = stages.findIndex((s) => s.key === currentStage.key);
  const nextStageKey = stages[stageIndex + 1]?.key || currentStage.key; // keep current if last stage

  if (!editor || !project || !currentUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div
      className="relative size-full overflow-x-auto px-4 "
      style={{ minHeight: "100vh" }}
    >
      <Ruler />
      <div className="flex flex-col sm:flex-row justify-center items-center sm:items-start w-full py-4 mx-auto">
        <div className="w-full max-w-[90vw] sm:max-w-204 mx-auto">
          <div className="flex gap-2 mb-4 print:hidden overflow-x-auto">
            {stages.map((stage, index) => {
              return (
                <div key={stage.key} className="relative flex items-center">
                  <Button
                    onClick={() => handleStageChange(stage)}
                    disabled={(() => {
                      const stageIndex = stages.findIndex(
                        (s) => s.key === stage.key,
                      );

                      // ✅ Always enable completed stages
                      if (completedStages.includes(stage.key)) return false;

                      // ✅ Always enable the current stage
                      if (currentStage.key === stage.key) return false;

                      // ✅ Always enable the first stage
                      if (stageIndex === 0) return false;

                      // ✅ Disable future stages if previous stage is NOT completed
                      const prevStageKey = stages[stageIndex - 1].key;
                      return !completedStages.includes(prevStageKey);
                    })()}
                    className={clsx(
                      "px-3 py-2 rounded-md text-sm cursor-pointer",
                      currentStage.key === stage.key
                        ? "bg-blue-100 text-blue-700"
                        : completedStages.includes(stage.key)
                          ? "bg-green-100 text-green-700"
                          : "bg-white text-gray-700",
                    )}
                  >
                    {stage.label}
                  </Button>
                </div>
              );
            })}
          </div>
          <div className="w-full max-w-[90vw] sm:max-w-204 mx-auto relative">
            <div className="editor-print-wrapper">
              <EditorContent editor={editor} />
            </div>
          </div>

          <div className="w-full flex gap-2 items-center print:hidden overflow-x-auto whitespace-nowrap p-2">
            {/* ✅ Only show action buttons if finalsubmission is NOT completed */}

            <>
              <div className="flex gap-2 items-center mt-4 whitespace-nowrap">
                <div className="text-sm text-center space-y-2">
                  {currentStageData?.completed ? (
                    <span className="bg-green-600 text-white font-medium px-4 py-2 rounded-md">
                      ✅ {currentStage.label} Completed
                    </span>
                  ) : currentStageData?.submitted &&
                    !currentStageData?.resubmitted ? (
                    currentStageData?.editableByStudent ? (
                      <span className="bg-yellow-600 text-white font-medium px-4 py-2 rounded-md">
                        ✏️ {currentStage.label} — Editing Allowed
                      </span>
                    ) : (
                      <span className="bg-blue-800 text-white font-medium px-4 py-2 rounded-md">
                        📨 {currentStage.label} Submitted
                      </span>
                    )
                  ) : !currentStageData?.resubmitted ? (
                    <span className="bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-md whitespace-nowrap">
                      📝 {currentStage.label} In Progress
                    </span>
                  ) : null}

                  {/* ✅ Show resubmission status only if stage is resubmitted AND not completed */}
                  {currentStageData?.resubmitted &&
                    !currentStageData?.completed && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-md block mx-auto w-fit">
                        🔄 Resubmission in progress
                      </span>
                    )}
                </div>
              </div>

              {!isJournal && isStudent && (
                <SubmitStageDialog
                  onConfirm={handleStageSubmit}
                  stageLabel={currentStage.label}
                  isResubmission={
                    !!currentStageData?.submitted &&
                    !currentStageData?.completed
                  }
                />
              )}
            </>
          </div>
        </div>
      </div>

      <Threads editor={editor} />
    </div>
  );
};

export { Editor };
