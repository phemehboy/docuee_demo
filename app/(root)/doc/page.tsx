"use client";

import { AssignmentsContent } from "@/components/documentation/sections/AssignmentsContent";
import { FAQsContent } from "@/components/documentation/sections/FAQsContent";
import GettingStartedContent from "@/components/documentation/sections/GettingStartedContent";
import { PaymentsContent } from "@/components/documentation/sections/PaymentsContent";
import { ProjectsContent } from "@/components/documentation/sections/ProjectsContent";
import ReferralContent from "@/components/documentation/sections/ReferralContent";
import { UserRolesContent } from "@/components/documentation/sections/UserRolesContent";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  BookOpen,
  Coins,
  CreditCard,
  FileText,
  HelpCircle,
  Menu,
  Rocket,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import { toast } from "sonner";

const sidebarItems = [
  { label: "Getting Started", icon: Rocket },
  { label: "User Roles", icon: Users },
  { label: "Projects", icon: FileText },
  { label: "Course Work", icon: BookOpen },
  { label: "Payments", icon: CreditCard },
  { label: "Referrals", icon: Coins },
  { label: "FAQs", icon: HelpCircle },
] as const;

type SidebarLabel = (typeof sidebarItems)[number]["label"];

const contentMap: Record<SidebarLabel, JSX.Element> = {
  "Getting Started": <GettingStartedContent />,
  "User Roles": <UserRolesContent />,
  Projects: <ProjectsContent />,
  "Course Work": <AssignmentsContent />,
  Payments: <PaymentsContent />,
  Referrals: <ReferralContent />,
  FAQs: <FAQsContent />,
};

function highlightMatch(text: string, query: string) {
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<strong class='text-blue-700'>$1</strong>");
}

export default function DocumentationPage() {
  const [active, setActive] = useState<SidebarLabel>("Getting Started");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [feedbackMap, setFeedbackMap] = useState<
    Record<SidebarLabel, "yes" | "no" | "no-pending" | null>
  >({
    "Getting Started": null,
    "User Roles": null,
    Projects: null,
    "Course Work": null,
    Payments: null,
    Referrals: null,
    FAQs: null,
  });

  const listRef = useRef<HTMLUListElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleMenuClick = (item: SidebarLabel) => {
    setActive(item);
    setOpen(false);

    // 👇 Scroll content to top
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredItems = searchQuery
    ? sidebarItems.filter(({ label }) =>
        label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  // Handle keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (filteredItems.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev === 0 || prev === -1 ? filteredItems.length - 1 : prev - 1,
        );
      } else if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault();
        const selected = filteredItems[focusedIndex];
        if (selected) {
          setActive(selected.label);
          setSearchQuery("");
          setFocusedIndex(-1);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filteredItems, focusedIndex]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:block w-64 border-r p-4 sticky top-0 h-screen overflow-y-auto">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold mb-4 hover:text-blue-500 transition"
        >
          Docuee Docs
        </Link>
        <SidebarMenu active={active} onClickItem={handleMenuClick} />
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="bg-black-100 p-2 border rounded-md shadow">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-black-900 w-64 p-4 h-screen overflow-y-auto"
          >
            <SheetHeader>
              <Link href="/">
                <SheetTitle className="cursor-pointer hover:underline">
                  Docs
                </SheetTitle>
              </Link>
            </SheetHeader>
            <SidebarMenu active={active} onClickItem={handleMenuClick} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Content Area */}
      {/* Main Content */}
      <main ref={contentRef} className="flex-1 p-6 md:p-10 max-w-3xl mx-auto">
        {/* Searchbar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFocusedIndex(-1);
            }}
            className="pl-10"
          />

          {searchQuery && (
            <ul
              ref={listRef}
              className="absolute z-10 mt-1 w-full bg-black-900 border rounded-md shadow max-h-60 overflow-y-auto"
            >
              {filteredItems.length === 0 && (
                <li className="px-3 py-2 text-gray-400 text-sm md:text-base">
                  No results found
                </li>
              )}

              {filteredItems.map(({ label, icon: Icon }, index) => (
                <li
                  key={label}
                  onClick={() => {
                    setActive(label);
                    setSearchQuery("");
                    setFocusedIndex(-1);
                    contentRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm md:text-base ${
                    focusedIndex === index
                      ? "bg-blue-100"
                      : "hover:bg-black-800/90"
                  }`}
                >
                  <Icon className="w-4 h-4 text-white-500" />
                  <span
                    dangerouslySetInnerHTML={{
                      __html: highlightMatch(label, searchQuery),
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected Content */}
        <div>{contentMap[active]}</div>

        {/* Feedback Section */}
        <div className="mt-12 border-t pt-6">
          <h2 className="text-lg font-semibold mb-2">Was this helpful?</h2>

          <div>
            {/* Feedback buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => toast("✅ Thanks for your feedback!")}
                className="bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => toast("❌ Feedback noted. Thanks!")}
                className="bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Docuee. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

function SidebarMenu({
  active,
  onClickItem,
}: {
  active: SidebarLabel;
  onClickItem: (item: SidebarLabel) => void;
}) {
  return (
    <ul className="space-y-2">
      {sidebarItems.map(({ label, icon: Icon }) => (
        <li
          key={label}
          className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded ${
            active === label
              ? "bg-blue-100 text-blue-600 font-semibold"
              : "hover:bg-gray-100 hover:text-black"
          }`}
          onClick={() => onClickItem(label)}
        >
          <Icon className="w-4 h-4" />
          {label}
        </li>
      ))}
    </ul>
  );
}
