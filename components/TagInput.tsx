"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export default function TagInput({
  value,
  onChange,
  placeholder,
}: TagInputProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = input.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInput("");
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border rounded-md p-2">
        {value.map((tag, idx) => (
          <span
            key={idx}
            className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}

        <Input
          className="border-none focus:ring-0 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type an expertise and press Enter"}
        />
      </div>

      {/* Optional small helper text */}
      <p className="text-xs text-gray-400 mt-1">
        Type an expertise and press <strong>Enter</strong> to add it.
      </p>
    </div>
  );
}
