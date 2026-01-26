"use client";

import { Switch } from "@headlessui/react";

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export default function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-sm sm:text-base">{label}</span>

      <Switch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`${
          checked ? "bg-blue-600" : "bg-gray-500"
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span
          className={`${
            checked ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
    </div>
  );
}
