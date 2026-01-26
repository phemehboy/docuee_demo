"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Card } from "@/components/ui/card";

export default function WordLikeEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start typing your project here...</p>",
  });

  if (!editor) return null;

  return (
    <div className="flex justify-center w-full bg-gray-100 py-8">
      <div className="space-y-6">
        {/* Simulate multiple pages */}
        <Card
          className="mx-auto shadow-lg bg-white border border-gray-300 page"
          style={{
            width: "816px", // ≈ A4 width in px
            minHeight: "1054px", // ≈ A4 height in px
            padding: "2rem",
            boxSizing: "border-box",
          }}
        >
          <EditorContent editor={editor} className="prose prose-lg w-full" />
        </Card>
      </div>
    </div>
  );
}
