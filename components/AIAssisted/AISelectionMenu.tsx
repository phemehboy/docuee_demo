"use client";

import { BubbleMenu } from "@tiptap/react/menus";

import { Bot } from "lucide-react";
import { Editor } from "@tiptap/core";
import { useState } from "react";
import { actions } from "@/constants";

interface Props {
  editor: Editor;
  onAction: (action: string) => void;
  stageKey: string;
}

export function AISelectionMenu({ editor, onAction }: Props) {
  const [open, setOpen] = useState(false);

  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) => {
        const selection = editor.state.selection;
        const shouldShow =
          !selection.empty && editor.isEditable && editor.view.hasFocus();

        if (open) {
          setOpen(false);
        }

        return shouldShow;
      }}
    >
      <div className="relative">
        {/* AI Button */}
        <button
          onMouseDown={(e) => {
            e.preventDefault(); // 👈 keeps selection intact
            setOpen((v) => !v);
          }}
          className="flex items-center gap-1 bg-black text-white px-2 py-1 rounded-md text-xs hover:bg-gray-800 cursor-pointer"
        >
          <Bot className="w-4 h-4" />
          AI
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full mt-1 w-64 bg-white border shadow-lg rounded-md z-50 origin-top scale-95 animate-in fade-in zoom-in-95">
            {actions.map(({ action, label, icon: Icon }) => (
              <button
                key={action}
                onClick={() => {
                  console.log("Clicked action:", action); // ✅ debug log
                  onAction(action);
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full text-black text-left px-3 py-2 text-xs hover:bg-gray-200 cursor-pointer"
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </BubbleMenu>
  );
}
