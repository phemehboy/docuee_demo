"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ChevronDownIcon,
  ChevronLeft,
  ChevronRight,
  HighlighterIcon,
  ImageIcon,
  ItalicIcon,
  Link2Icon,
  List,
  ListCollapseIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  LucideIcon,
  MessageSquarePlusIcon,
  MinusIcon,
  PlusIcon,
  PrinterIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  SpellCheckIcon,
  UnderlineIcon,
  Undo2Icon,
  XIcon,
} from "lucide-react";
import { SketchPicker, type ColorResult } from "react-color";
import { type Level } from "@tiptap/extension-heading";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { useSearchParams } from "next/navigation";

import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useEditorStore } from "@/app/(root)/store/use-Editor-store";
import Tooltip from "./Tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
interface ToolbarButtonProps {
  onClick?: () => void;
  isActive?: boolean;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  callbackUrl?: string;
  isAssignedSupervisor?: boolean;
}

const LineHeightButton = () => {
  const { editor } = useEditorStore();

  const lineHeights = [
    {
      label: "Default",
      value: "normal",
    },
    {
      label: "Single",
      value: "1",
    },
    {
      label: "1.15",
      value: "1.15",
    },
    {
      label: "1.5",
      value: "1.5",
    },
    {
      label: "Double",
      value: "2",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Tooltip text="Line spacing">
            <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:!bg-black-600 px-1.5 overflow-hidden text-sm">
              <ListCollapseIcon className="size-4" />
            </button>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1 flex flex-col gap-y-1 !bg-gray-50 text-black-100 shadow-subtle outline-none border-none">
        {lineHeights.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => editor?.chain().focus().setLineHeight(value).run()}
            className={cn(
              "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:!bg-gray-300",
              editor?.getAttributes("paragraph").lineHeight === value &&
                "!bg-gray-300",
            )}
          >
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FontSizeButton = () => {
  const { editor } = useEditorStore();

  const currentFontSize = editor?.getAttributes("textStyle").fontSize
    ? editor?.getAttributes("textStyle").fontSize.replace("px", "")
    : "16";

  const [fontSize, setFontSize] = useState(currentFontSize);
  const [inputValue, setInputValue] = useState(fontSize);
  const [isEditing, setIsEditing] = useState(false);

  const updateFontSize = (newFontSize: string) => {
    const size = parseInt(newFontSize);

    if (!isNaN(size) && size > 0) {
      editor?.chain().focus().setFontSize(`${size}px`).run();
      setFontSize(newFontSize);
      setInputValue(newFontSize);
      setIsEditing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    updateFontSize(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      updateFontSize(inputValue);
      editor?.commands.focus();
    }
  };

  const increment = () => {
    const newSize = parseInt(fontSize) + 1;
    updateFontSize(newSize.toString());
  };

  const decrement = () => {
    const newSize = parseInt(fontSize) - 1;

    if (newSize > 0) {
      updateFontSize(newSize.toString());
    }
  };

  return (
    <div className="flex items-center gap-x-0.5">
      <Tooltip text="Decrement">
        <button
          onClick={decrement}
          className="h-7 w-7 shrink-0 flex items-center justify-center rounded-sm hover:!bg-black-600"
        >
          <MinusIcon className="size-4" />
        </button>
      </Tooltip>
      {isEditing ? (
        <input
          type="text"
          value={inputValue}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="h-7 w-10 text-sm text-center border border-neutral-400 rounded-sm bg-transparent focus:outline-none focus:ring-0"
        />
      ) : (
        <button
          onClick={() => {
            setIsEditing(true);
            setFontSize(currentFontSize);
          }}
          className="h-7 w-10 text-sm text-center border border-neutral-400 rounded-sm hover:!bg-black-600 cursor-text"
        >
          {currentFontSize}
        </button>
      )}
      <Tooltip text="Increment">
        <button
          onClick={increment}
          className="h-7 w-7 shrink-0 flex items-center justify-center rounded-sm hover:!bg-black-600"
        >
          <PlusIcon className="size-4" />
        </button>
      </Tooltip>
    </div>
  );
};

const ListButton = () => {
  const { editor } = useEditorStore();

  const alignments = [
    {
      label: "Bullet List",
      icon: ListIcon,
      isActive: () => editor?.isActive("bulletList"),
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Ordered List",
      icon: ListOrderedIcon,
      isActive: () => editor?.isActive("orderedList"),
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Tooltip text="List">
            <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:!bg-black-600 px-1.5 overflow-hidden text-sm">
              <List className="size-4" />
            </button>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1 flex flex-col gap-y-1 bg-gray-50 text-black-100 shadow-subtle outline-none border-none">
        {alignments.map(({ label, icon: Icon, onClick, isActive }) => (
          <button
            key={label}
            onClick={onClick}
            className={cn(
              "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:!bg-gray-300",
              isActive() && "!bg-black-600",
            )}
          >
            <Icon className="size-4" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AlignButton = () => {
  const { editor } = useEditorStore();

  const alignments = [
    {
      label: "Align Left",
      value: "left",
      icon: AlignLeftIcon,
    },
    {
      label: "Align Center",
      value: "center",
      icon: AlignCenterIcon,
    },
    {
      label: "Align Right",
      value: "right",
      icon: AlignRightIcon,
    },
    {
      label: "Align Justify",
      value: "justify",
      icon: AlignJustifyIcon,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Tooltip text="Align text">
            <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:!bg-black-600 px-1.5 overflow-hidden text-sm">
              <AlignLeftIcon className="size-4" />
            </button>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1 flex flex-col gap-y-1 !bg-gray-50 text-black-100 shadow-subtle outline-none border-none">
        {alignments.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => editor?.chain().focus().setTextAlign(value).run()}
            className={cn(
              "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:!bg-gray-300",
              editor?.isActive({ TextAlign: value }) && "!bg-black-600",
            )}
          >
            <Icon className="size-4" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ImageButton = ({
  //   isFreePlan,
  callbackUrl,
}: {
  //   isFreePlan: boolean;
  callbackUrl: string;
}) => {
  const { editor } = useEditorStore();
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [isChoiceDialogOpen, setIsChoiceDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (src: string) => {
    editor?.chain().focus().setImage({ src }).run();
  };

  const onUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (data?.result?.secure_url) {
            const imageUrl = data.result.secure_url;
            onChange(imageUrl); // Insert image into editor
          }
        } catch (err) {
          console.error("Upload failed:", err);
        }
      }
    };

    input.click();
  };

  const handleImageUrlSubmit = () => {
    if (imageUrl) {
      onChange(imageUrl);
      setImageUrl("");
      setIsDialogueOpen(false);
    }
  };

  useEffect(() => {
    if (isDialogueOpen) {
      inputRef.current?.focus();
    }
  }, [isDialogueOpen]);

  return (
    <>
      {/* ==============================
          CHOICE DIALOG: Upload / URL 
      ============================== */}
      <AlertDialog
        open={isChoiceDialogOpen}
        onOpenChange={setIsChoiceDialogOpen}
      >
        <AlertDialogTrigger asChild>
          <div className="relative">
            <Tooltip text="Insert image">
              <div onClick={(e) => {}}>
                <button
                  type="button"
                  className={`h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm px-1.5 overflow-hidden text-sm hover:bg-black-600 cursor-pointer
                    // isFreePlan
                    //   ? "text-gray-400 cursor-not-allowed"
                    //   : "hover:!bg-black-600 cursor-pointer"
                //   }
                  `}
                  // Remove disabled attribute to allow onClick to work
                >
                  <ImageIcon className="size-4" />
                </button>
              </div>
            </Tooltip>
          </div>
        </AlertDialogTrigger>

        <AlertDialogContent className="bg-black-900 outline-none border-none">
          <button
            onClick={() => setIsChoiceDialogOpen(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-black"
          >
            <XIcon className="size-4" /> {/* Using Lucide's XIcon */}
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle>Insert Image</AlertDialogTitle>
            <AlertDialogDescription>
              Choose how you want to insert the image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2">
            <AlertDialogAction
              onClick={() => {
                setIsChoiceDialogOpen(false);
                onUpload(); // File picker function
              }}
              className="gradient-blue w-full"
            >
              Upload from Device
            </AlertDialogAction>

            <AlertDialogAction
              onClick={() => {
                setIsChoiceDialogOpen(false);
                setTimeout(() => setIsDialogueOpen(true), 100); // Delay to prevent conflict
              }}
              className="gradient-blue w-full"
            >
              Insert Image URL
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ==============================
          URL INPUT DIALOG
      ============================== */}
      <AlertDialog open={isDialogueOpen} onOpenChange={setIsDialogueOpen}>
        <AlertDialogContent className="bg-black-900 outline-none border-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Insert Image URL</AlertDialogTitle>
            <AlertDialogDescription>
              <Input
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleImageUrlSubmit();
                  }
                }}
                ref={inputRef}
                className="placeholder:text-gray-400 placeholder:py-1 text-white bg-black-800 "
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogueOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleImageUrlSubmit}
              className="gradient-blue"
            >
              Insert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const LinkButton = () => {
  const { editor } = useEditorStore();

  const [value, setValue] = useState("");

  const onChange = (href: string) => {
    editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setValue("");
  };

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          setValue(editor?.getAttributes("link").href || "");
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Tooltip text="Link">
            <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-black-600 px-1.5 overflow-hidden text-sm">
              <Link2Icon className="size-4" />
            </button>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2.5 flex items-center gap-x-2 bg-black-900 shadow-subtle border-none outline-none">
        <Input
          placeholder="https://docuee.example"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button onClick={() => onChange(value)} className="gradient-blue">
          Apply
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TextColorButton = () => {
  const { editor } = useEditorStore();

  const value = editor?.getAttributes("textStyle").color || "#000000";

  const onChange = (color: ColorResult) => {
    editor?.chain().focus().setColor(color.hex).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Tooltip text="Change text color">
            <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-black-600 px-1.5 overflow-hidden text-sm">
              <span className="text-xs">A</span>
              <div
                className="h-0.5 w-full"
                style={{ backgroundColor: value }}
              />
            </button>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2.5 bg-black-900 shadow-subtle outline-none border-none">
        <SketchPicker color={value} onChange={onChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
const HighlightColorButton = () => {
  const { editor } = useEditorStore();

  const value = editor?.getAttributes("highlight").color || "#000000";

  const onChange = (color: ColorResult) => {
    editor?.chain().focus().setHighlight({ color: color.hex }).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Tooltip text="Change background color">
            <button className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-black-600 px-1.5 overflow-hidden text-sm">
              <HighlighterIcon className="size-4" />
            </button>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2.5 bg-black-900 shadow-subtle outline-none border-none">
        <SketchPicker onChange={onChange} color={value} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const HeadingLevelButton = () => {
  const { editor } = useEditorStore();

  const headings = [
    { label: "Normal Text", value: 0, fontSize: "16px" },
    { label: "Heading 1", value: 1, fontSize: "32px" },
    { label: "Heading 2", value: 2, fontSize: "24px" },
    { label: "Heading 3", value: 3, fontSize: "20px" },
    { label: "Heading 4", value: 4, fontSize: "18px" },
    { label: "Heading 5", value: 5, fontSize: "16px" },
  ];

  const getCurrentHeading = () => {
    for (let level = 1; level <= 5; level++) {
      if (editor?.isActive("heading", { level })) {
        return `Heading ${level}`;
      }
    }

    return "Normal Text";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Tooltip text="Format headings">
            <button className="h-7 min-w-7 shrink-0 flex items-center justify-center rounded-sm px-1.5 overflow-hidden text-sm">
              <span className="truncate">{getCurrentHeading()}</span>
              <ChevronDownIcon className="ml-2 size-4 shrink-0" />
            </button>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1 flex flex-col gap-y-1 bg-gray-50 text-black-100 shadow-subtle outline-none border-none min-w-45">
        {headings.map(({ label, value, fontSize }) => (
          <button
            key={value}
            style={{ fontSize }}
            className={cn(
              "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-gray-300 w-full text-left",
              (value === 0 && !editor?.isActive("heading")) ||
                (editor?.isActive("heading", { level: value }) &&
                  "bg-black-600"),
            )}
            onClick={() => {
              if (value === 0) {
                editor?.chain().focus().setParagraph().run();
              } else {
                editor
                  ?.chain()
                  .focus()
                  .toggleHeading({ level: value as Level })
                  .run();
              }
            }}
          >
            {label}
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FontFamilyButton = () => {
  const { editor } = useEditorStore();

  const fonts = [
    { label: "Arial", value: "Arial" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Courier New", value: "Courier New" },
    { label: "Georgia", value: "Georgia" },
    { label: "Verdana", value: "Verdana" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Tooltip text="Change font">
            <button className="h-7 w-30 shrink-0 flex items-center justify-between rounded-sm px-1.5 overflow-hidden text-sm">
              <span className="truncate">
                {editor?.getAttributes("textStyle").FontFamily || "Arial"}
              </span>
              <ChevronDownIcon className="ml-2 size-4 shrink-0" />
            </button>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1 flex flex-col gap-y-1 bg-gray-50 text-black-100 shadow-subtle outline-none border-none min-w-45">
        {fonts.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => editor?.chain().focus().setFontFamily(value).run()}
            className={cn(
              "flex items-center gap-x-2 px-2 py-1 rounded-sm hover:bg-gray-300 w-full text-left",
              editor?.getAttributes("textStyle").fontFamily === value &&
                "bg-black-600",
            )}
            style={{ fontFamily: value }}
          >
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ToolbarButton = ({
  onClick,
  isActive,
  icon: Icon,
  label,
  disabled,
  callbackUrl,
  isAssignedSupervisor,
}: ToolbarButtonProps) => {
  const handleClick = () => {
    if (disabled && !isAssignedSupervisor) {
      toast.error("Error", {
        description: (
          <div className="flex flex-col gap-y-2">
            <span className="text-sm lg:text-base">
              This feature requires a Premium plan.
            </span>
            {callbackUrl && (
              <Link
                href={callbackUrl}
                className="underline text-sm lg:text-base"
              >
                Upgrade Now
              </Link>
            )}
          </div>
        ),
      });
      return;
    }
    onClick?.();
  };

  return (
    <Tooltip text={label}>
      <div onClick={handleClick} className="relative">
        <Button
          disabled={disabled && !isAssignedSupervisor}
          className={cn(
            "text-sm h-7 min-w-7 flex items-center justify-center rounded-sm transition-colors duration-150",
            isActive
              ? "!bg-black-600 text-white"
              : "bg-black-900 text-gray-300",
            disabled && !isAssignedSupervisor
              ? "text-gray-400 cursor-not-allowed"
              : "cursor-pointer hover:!bg-black-600",
          )}
        >
          <Icon className="w-4 h-4" />
        </Button>
      </div>
    </Tooltip>
  );
};

export const Toolbar = ({
  data,
  stageKey,
  isPro,
}: {
  data: Doc<"projects">;
  stageKey: string;
  isPro: boolean;
}) => {
  const { editor } = useEditorStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const searchParams = useSearchParams();

  const { user } = useUser();
  const loggedInId = user?.id;

  const isAssignedSupervisor = data?.supervisorClerkId === loggedInId;
  const isProjectOwner = data?.studentClerkId === loggedInId;

  const projectId = searchParams.get("projectId");
  const ownerId = searchParams.get("ownerId");

  const queryParams = new URLSearchParams();
  if (projectId) queryParams.set("projectId", projectId);
  if (ownerId) queryParams.set("ownerId", ownerId);

  const callbackUrl = `/documents/${data._id}${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 150; // Adjust scroll speed
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      // Give it some time before updating visibility
      setTimeout(checkScroll, 300);
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0);
      setCanScrollRight(
        scrollRef.current.scrollLeft + scrollRef.current.clientWidth <
          scrollRef.current.scrollWidth,
      );
    }
  };

  // Run on mount & whenever user scrolls
  useEffect(() => {
    checkScroll();
    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", checkScroll);
    }
    return () => {
      scrollRef.current?.removeEventListener("scroll", checkScroll);
    };
  }, []);

  const sections: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    isAssignedSupervisor?: boolean;
  }[][] = [
    [
      {
        label: "Undo",
        icon: Undo2Icon,
        onClick: () => editor?.chain().focus().undo().run(),
      },
      {
        label: "Redo",
        icon: Redo2Icon,
        onClick: () => editor?.chain().focus().redo().run(),
      },
      {
        label: "Print",
        icon: PrinterIcon,
        onClick: () => window.print(),
      },
      {
        label: "Spell Check",
        icon: SpellCheckIcon,
        onClick: () => {
          const current = editor?.view.dom.getAttribute("spellcheck");
          editor?.view.dom.setAttribute(
            "spellcheck",
            current === "false" ? "true" : "false",
          );
        },
      },
    ],
    [
      {
        label: "Bold",
        isActive: editor?.isActive("bold"),
        icon: BoldIcon,
        onClick: () => editor?.chain().focus().toggleBold().run(),
      },
      {
        label: "Italic",
        isActive: editor?.isActive("italic"),
        icon: ItalicIcon,
        onClick: () => editor?.chain().focus().toggleItalic().run(),
      },
      {
        label: "Underline",
        isActive: editor?.isActive("underline"),
        icon: UnderlineIcon,
        onClick: () => editor?.chain().focus().toggleUnderline().run(),
      },
    ],
    [
      {
        label: "Comment",
        icon: MessageSquarePlusIcon,
        onClick: () => editor?.chain().focus().addPendingComment().run(),
        isActive: editor?.isActive("liveblocksCommentMark"),
        // disabled: isFreePlan,
        isAssignedSupervisor: isAssignedSupervisor,
      },
      {
        label: "List Todo",
        icon: ListTodoIcon,
        onClick: () => editor?.chain().focus().toggleTaskList().run(),
        isActive: editor?.isActive("taskList"),
      },
      {
        label: "Remove Formatting",
        icon: RemoveFormattingIcon,
        onClick: () => editor?.chain().focus().unsetAllMarks().run(),
      },
    ],
  ];
  return (
    <div
      className="relative bg-black-900 px-2.5 py-1 min-h-10 flex items-center gap-x-0.5"
      //   className={`relative bg-black-900 px-2.5 py-1 lg:rounded-[24px] min-h-[40px] flex items-center gap-x-0.5 ${isReadonly ? "pointer-events-none opacity-50" : ""}`}
    >
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 bg-linear-to-r from-black-900 to-transparent px-2 py-1 text-white flex"
          //   disabled={isReadonly}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      <div
        ref={scrollRef}
        className="flex items-center gap-x-0.5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-8"
      >
        {sections[0].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}

        <Separator orientation="vertical" className="h-6 bg-neutral-300" />
        <FontFamilyButton />
        <Separator orientation="vertical" className="h-6 bg-neutral-300" />
        <HeadingLevelButton />
        <Separator orientation="vertical" className="h-6 bg-neutral-300" />
        <FontSizeButton />
        <Separator orientation="vertical" className="h-6 bg-neutral-300" />
        {sections[1].map((item) => (
          <ToolbarButton key={item.label} {...item} />
        ))}
        <TextColorButton />
        <HighlightColorButton />
        <Separator orientation="vertical" className="h-6 bg-neutral-300" />
        {/* <LinkButton /> */}
        <ImageButton
          // isFreePlan={isFreePlan}
          callbackUrl={callbackUrl}
        />
        <AlignButton />
        <LineHeightButton />
        <ListButton />
        {sections[2].map((item) => (
          <ToolbarButton
            key={item.label}
            {...item}
            callbackUrl={callbackUrl}
            isAssignedSupervisor={isAssignedSupervisor}
          />
        ))}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 bg-gradient-to-l from-black-900 to-transparent px-2 py-1 text-white flex"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Toolbar;
