"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerSelectOption {
  value: string;
  label: string;
}

interface DrawerSelectProps {
  value?: string;
  placeholder?: string;
  label?: string;
  active?: boolean;
  options: DrawerSelectOption[];
  onValueChange: (value: string) => void;
}

export function DrawerSelect({
  value = "",
  placeholder = "Select",
  label,
  active,
  options,
  onValueChange,
}: DrawerSelectProps) {
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "appearance-none h-[28px] min-w-[180px] px-3 pr-8 text-xs rounded-full",
          "border shadow-sm cursor-pointer transition",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
          active
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {label && (
          <option value="" disabled>
            ── {label} ──
          </option>
        )}

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* custom arrow */}
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2",
          active ? "text-white" : "text-gray-500"
        )}
      />
    </div>
  );
}
