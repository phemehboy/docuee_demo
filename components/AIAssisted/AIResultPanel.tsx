"use client";

import { useEffect, useState } from "react";
import { useAIPanelStore } from "@/app/(root)/store/use-AI-panel-store";
import { useEditorStore } from "@/app/(root)/store/use-Editor-store";
import { XIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const AIResultPanel = () => {
  const { editor } = useEditorStore();
  const { isOpen, result, closePanel } = useAIPanelStore();

  const [editableText, setEditableText] = useState(result?.suggestedText || "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setTimeout(() => setEditableText(result?.suggestedText ?? ""), 0);
  }, [result]);

  if (!isOpen || !result || !editor) return null;

  const handleInsert = () => {
    if (!editableText) return;

    const aiId = crypto.randomUUID();

    const content = editableText.split("\n").flatMap((line, idx, arr) => {
      const nodes: any[] = [];

      if (line.length > 0) {
        nodes.push({
          type: "text",
          text: line,
          marks: [
            {
              type: "aiContent",
              attrs: {
                aiId,
                originalHash: "", // optional
                originalLength: line.length,
              },
            },
          ],
        });
      }

      if (idx < arr.length - 1) {
        nodes.push({ type: "hardBreak" });
      }

      return nodes;
    });

    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: "paragraph",
          attrs: {
            "data-ai-assisted": "true",
            editorNodeId: aiId,
            "data-ai-action": result.action,
          },
          content,
        },
      ])
      .run();

    closePanel();
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white border-l shadow-lg z-50 flex flex-col transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold text-sm text-black">AI Assistance</h3>
        <button onClick={closePanel} className="cursor-pointer">
          <XIcon className="text-black w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-xs font-medium text-gray-600 mb-1">
            What the AI did
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">
            {result.explanation}
          </p>
        </div>

        {result.suggestedText && (
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-xs font-medium text-gray-600 mb-2">
              Suggested text
            </p>

            {!isEditing ? (
              <div
                className="prose prose-sm max-w-none text-black cursor-text hover:bg-gray-50 p-2 rounded-md transition"
                onClick={() => setIsEditing(true)}
              >
                <ReactMarkdown>{editableText}</ReactMarkdown>
                <p className="text-xs text-gray-400 mt-2 cursor-pointer">
                  Click to edit
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3 text-sm text-black bg-white resize-none focus:outline-none focus:ring-2 focus:ring-black"
                  rows={6}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-black text-xs px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Insert button */}
      <div className="border-t bg-gray-50 p-3 flex gap-2">
        <button
          disabled={!editableText}
          onClick={handleInsert}
          className="flex-1 text-sm bg-black text-white rounded-md px-3 py-2 hover:opacity-90 transition cursor-pointer"
        >
          Insert
        </button>
      </div>
    </div>
  );
};
