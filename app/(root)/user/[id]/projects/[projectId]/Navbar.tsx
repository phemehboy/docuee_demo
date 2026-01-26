"use client";

import React, { RefObject, useEffect, useState } from "react";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  ArrowLeftIcon,
  BoldIcon,
  FileIcon,
  FileJsonIcon,
  // FilePlusIcon,
  FileTextIcon,
  GlobeIcon,
  ItalicIcon,
  PrinterIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  StrikethroughIcon,
  TextIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react";
import { BsFilePdf } from "react-icons/bs";

import { Doc } from "@/convex/_generated/dataModel";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import DocumentInput from "./DocumentInput";
import { useEditorStore } from "@/app/(root)/store/use-Editor-store";
import { Avatars } from "./Avatar";
import { Inbox } from "./Inbox";

import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NavBarProps {
  user: Doc<"users">;
  project: Doc<"projects">;
  currentStage: { key: string; label: string };
  buttonRef?: RefObject<HTMLButtonElement | null>;
  allDeadlinesSet: boolean;
}

const Navbar = ({
  user,
  project,
  currentStage,
  buttonRef,
  allDeadlinesSet,
}: NavBarProps) => {
  const { editor } = useEditorStore();
  const router = useRouter();

  const [openCustomTable, setOpenCustomTable] = useState(false);
  const [rows, setRows] = useState<number | "">("");
  const [cols, setCols] = useState<number | "">("");

  const isSupervisor = user?.clerkId === project.supervisorClerkId;
  const isStudent = user?.clerkId === project.studentClerkId;

  async function handleBack() {
    if (!user) return router.back();

    if (isStudent) {
      router.push(
        `/user/${user.mongoUserId}/usertype/student/dashboard/project`,
      );
    } else if (isSupervisor) {
      router.push(
        `/user/${user.mongoUserId}/usertype/${project.supervisorUserType}/dashboard/projects`,
      );
    } else {
      router.back();
    }
  }

  const insertTable = ({ rows, cols }: { rows: number; cols: number }) => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: false })
      .run();
  };

  const onDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const onSaveJSON = () => {
    if (!editor) {
      return;
    }

    const content = editor.getJSON();
    const blob = new Blob([JSON.stringify(content)], {
      type: "application/json",
    });
    onDownload(blob, `${project.title}.json`);
  };

  const onSaveHTML = () => {
    if (!editor) {
      return;
    }

    const content = editor.getHTML();
    const blob = new Blob([content], {
      type: "text/html",
    });
    onDownload(blob, `${project.title}.html`);
  };

  const onSaveTEXT = () => {
    if (!editor) {
      return;
    }

    const content = editor.getText();
    const blob = new Blob([content], {
      type: "text/plain",
    });
    onDownload(blob, `${project.title}.txt`);
  };

  useEffect(() => {
    const savedRows = localStorage.getItem("customTableRows");
    const savedCols = localStorage.getItem("customTableCols");

    if (savedRows) setRows(Number(savedRows));
    if (savedCols) setCols(Number(savedCols));
  }, []);

  return (
    <>
      <nav className="px-2 md:px-4 flex justify-between flex-col-reverse gap-1 md:items-center md:justify-between md:flex-row">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="hidden md:flex items-center gap-2 hover:text-blue-500 transition cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>

            <div className="flex flex-col">
              <DocumentInput id={project._id} title={project.title} />
              <div className="flex gap-2 lg:gap-4 items-center">
                <Menubar className="border-none bg-transparent shadow-none h-auto p-0 ">
                  <MenubarMenu>
                    <MenubarTrigger className="text-sm font-normal py-0.5 px-1.75 rounded-sm hover:bg-muted h-auto hover:bg-black-600 cursor-pointer">
                      File
                    </MenubarTrigger>
                    <MenubarContent className="bg-gray-50 text-black-100 shadow-subtle outline-none border-none print:hidden">
                      <MenubarSub>
                        <MenubarSubTrigger className="hover:bg-gray-300 cursor-pointer">
                          <FileIcon className="size-4 mr-2" />
                          Save
                        </MenubarSubTrigger>

                        <MenubarSubContent className="bg-gray-50 text-black-100 shadow-subtle outline-none border-none">
                          <MenubarItem
                            onClick={onSaveJSON}
                            className="hover:bg-gray-300 cursor-pointer"
                          >
                            <FileJsonIcon className="size-4 mr-2 " />
                            JSON
                          </MenubarItem>
                          <MenubarItem
                            onClick={onSaveHTML}
                            className="hover:bg-gray-300 cursor-pointer"
                          >
                            <GlobeIcon className="size-4 mr-2" />
                            HTML
                          </MenubarItem>
                          <MenubarItem
                            onClick={() => window.print()}
                            className="hover:bg-gray-300 cursor-pointer"
                          >
                            <BsFilePdf className="size-4 mr-2" />
                            PDF
                          </MenubarItem>
                          <MenubarItem
                            onClick={onSaveTEXT}
                            className="hover:bg-gray-300 cursor-pointer"
                          >
                            <FileTextIcon className="size-4 mr-2" />
                            TEXT
                          </MenubarItem>
                        </MenubarSubContent>
                      </MenubarSub>
                      <MenubarSeparator className="bg-grey-400/20" />

                      <MenubarItem
                        onClick={() => window.print()}
                        className="hover:bg-gray-300 cursor-pointer"
                      >
                        <PrinterIcon className="size-4 mr-2" />
                        Print <MenubarShortcut>⌘P</MenubarShortcut>
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger className="text-sm font-normal py-0.5 px-1.75 rounded-sm hover:bg-muted h-auto  hover:bg-black-600 cursor-pointer">
                      Edit
                    </MenubarTrigger>
                    <MenubarContent className="bg-gray-50 text-black-100 shadow-subtle outline-none border-none">
                      <MenubarItem
                        onClick={() => editor?.chain().focus().undo().run()}
                        className="hover:bg-gray-300 cursor-pointer"
                      >
                        <Undo2Icon className="mr-2 size-4" />
                        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem
                        onClick={() => editor?.chain().focus().redo().run()}
                        className="hover:bg-gray-300 cursor-pointer"
                      >
                        <Redo2Icon className="mr-2 size-4" />
                        Redo <MenubarShortcut>⌘Y</MenubarShortcut>
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger className="text-sm font-normal py-0.5 px-1.75 rounded-sm hover:bg-muted h-auto hover:bg-black-600 cursor-pointer">
                      Insert
                    </MenubarTrigger>
                    <MenubarContent className="bg-gray-50 text-black-100 hover:bg-gray-300 shadow-subtle outline-none border-none">
                      <MenubarSub>
                        <MenubarSubTrigger className="cursor-pointer hover:bg-gray-300">
                          Table
                        </MenubarSubTrigger>
                        <MenubarSubContent className="bg-gray-50 text-black-100 shadow-subtle">
                          {[1, 2, 3, 4].map((n) => (
                            <MenubarItem
                              key={n}
                              onClick={() => insertTable({ rows: n, cols: n })}
                              className="hover:bg-gray-300 cursor-pointer"
                            >
                              {n} x {n}
                            </MenubarItem>
                          ))}

                          <MenubarSeparator className="bg-grey-400/20" />

                          <MenubarItem
                            onClick={() => setOpenCustomTable(true)}
                            className="hover:bg-gray-300 cursor-pointer font-medium text-blue-700"
                          >
                            ➕ Custom Table…
                          </MenubarItem>
                        </MenubarSubContent>
                      </MenubarSub>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger className="text-sm font-normal py-0.5 px-1.75 rounded-sm hover:bg-muted h-auto hover:bg-black-600 cursor-pointer">
                      Format
                    </MenubarTrigger>
                    <MenubarContent className="bg-gray-50 text-black-100 shadow-subtle outline-none border-none">
                      <MenubarSub>
                        <MenubarSubTrigger className="cursor-pointer hover:bg-gray-300">
                          <TextIcon className="size-4 mr-2" />
                          Text
                        </MenubarSubTrigger>
                        <MenubarSubContent className="bg-gray-50 text-black-100 shadow-subtle outline-none border-black-100">
                          <MenubarItem
                            onClick={() =>
                              editor?.chain().focus().toggleBold().run()
                            }
                            className="cursor-pointer hover:bg-gray-300"
                          >
                            <BoldIcon className="size-4 mr-2" />
                            Bold <MenubarShortcut>⌘B</MenubarShortcut>
                          </MenubarItem>
                          <MenubarItem
                            onClick={() =>
                              editor?.chain().focus().toggleItalic().run()
                            }
                            className="cursor-pointer hover:bg-gray-300"
                          >
                            <ItalicIcon className="size-4 mr-2" />
                            Italic <MenubarShortcut>⌘I</MenubarShortcut>
                          </MenubarItem>
                          <MenubarItem
                            onClick={() =>
                              editor?.chain().focus().toggleUnderline().run()
                            }
                            className="cursor-pointer hover:bg-gray-300"
                          >
                            <UnderlineIcon className="size-4 mr-2" />
                            Underline <MenubarShortcut>⌘U</MenubarShortcut>
                          </MenubarItem>
                          <MenubarItem
                            onClick={() =>
                              editor?.chain().focus().toggleStrike().run()
                            }
                            className="cursor-pointer hover:bg-gray-300"
                          >
                            <StrikethroughIcon className="size-4 mr-2" />
                            <span>Strikethrough&nbsp;&nbsp;</span>{" "}
                            <MenubarShortcut>⌘S</MenubarShortcut>
                          </MenubarItem>
                        </MenubarSubContent>
                      </MenubarSub>
                      <MenubarItem
                        onClick={() =>
                          editor?.chain().focus().unsetAllMarks().run()
                        }
                        className="cursor-pointer hover:bg-gray-300"
                      >
                        <RemoveFormattingIcon className="size-4 mr-2" />
                        Clear Formatting
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-full flex justify-between gap-3 items-center">
            <div className="flex items-center gap-3 md:hidden">
              <ArrowLeftIcon
                className="w-5 h-5 cursor-pointer hover:text-blue-500 transition"
                onClick={handleBack}
                aria-label="Go back"
              />
            </div>

            {/* Always stays at the right */}
            <div className="ml-auto flex items-center justify-end">
              <Avatars />
              <Inbox />
            </div>
          </div>
        </div>
        <Dialog open={openCustomTable} onOpenChange={setOpenCustomTable}>
          <DialogContent className="bg-black-900 sm:max-w-100">
            <DialogHeader>
              <DialogTitle>Insert Custom Table</DialogTitle>
              <DialogDescription>
                Choose the number of rows and columns for your table.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Rows</label>
                <Input
                  type="number"
                  value={rows}
                  min={1}
                  onChange={(e) => setRows(Number(e.target.value) || "")}
                  className="w-24"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Columns</label>
                <Input
                  type="number"
                  value={cols}
                  min={1}
                  onChange={(e) => setCols(Number(e.target.value) || "")}
                  className="w-24"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setOpenCustomTable(false)}
                className="bg-red-500 hover:bg-red-700 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!rows || !cols || rows <= 0 || cols <= 0) {
                    alert(
                      "Please enter valid positive numbers for rows and columns.",
                    );
                    return;
                  }

                  // ✅ Save last used values for next time
                  localStorage.setItem("customTableRows", String(rows));
                  localStorage.setItem("customTableCols", String(cols));

                  insertTable({ rows, cols });
                  setOpenCustomTable(false);
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white"
              >
                Insert Table
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </nav>
    </>
  );
};

export default Navbar;
