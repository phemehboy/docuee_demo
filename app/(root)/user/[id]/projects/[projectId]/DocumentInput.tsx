import React, { useRef, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { BsCloudCheck } from "react-icons/bs";

interface DocumentInputProps {
  id: Id<"projects">;
  title: string;
}

const DocumentInput = ({ title }: DocumentInputProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <form className="relative w-fit max-w-[25ch] md:max-w-[50ch]">
          <span className="invisible whitespace-pre px-1.5 text-lg">
            {title || ""}
          </span>
          <input
            ref={inputRef}
            value={title}
            onBlur={() => setIsEditing(false)}
            className="absolute inset-0 text-lg text-white px-1.5 bg-transparent truncate"
            readOnly
          />
        </form>
      ) : (
        <span
          onClick={() => {
            setIsEditing(true);
            setTimeout(() => {
              inputRef?.current?.focus();
            }, 0);
          }}
          className="text-lg px-1.5 truncate max-w-[25ch] md:max-w-[50ch] cursor-pointer"
        >
          {title}
        </span>
      )}

      <BsCloudCheck className="size-4" />
    </div>
  );
};

export default DocumentInput;
