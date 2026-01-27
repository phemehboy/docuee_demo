"use client";
import { FaqProps } from "@/types";
import clsx from "clsx";
import React, { useState } from "react";

const FAQItem = ({ item, index }: FaqProps) => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const active = activeId === item.id;
  return (
    <div className="relative z-2 mb-10">
      <div
        className="group relative flex cursor-pointer items-center justify-between gap-10 px-7"
        onClick={() => {
          setActiveId(activeId === item.id ? null : item.id);
        }}
      >
        <div className="flex-1">
          <div className="small-compact mb-1.5 text-purple max-lg:hidden">
            {index < 10 ? "0" : ""}
            {index}
          </div>
          <div
            className={clsx(
              "text-[20px] font-medium leading-[36px] tracking-tight transition-colors duration-500 max-md:flex max-md:min-h-20 max-md:items-center",
            )}
          >
            {item.question}
          </div>
        </div>
        <div
          className={clsx(
            "faq-icon relative flex size-12 items-center justify-center rounded-full shadow- transition-all duration-500 group-hover:border-s4",
            active && "before:bg-white after:rotate-0 after:bg-white",
          )}
        >
          <div className="bg-doc bg-cover size-11/12 rounded-full shadow-300" />
        </div>
      </div>
      {/* Answer */}
      <div
        className={clsx(
          "overflow-hidden transition-all duration-500 ease-in-out",
          active
            ? "max-h-96 opacity-100 px-4 py-4 lg:px-7 lg:py-3.5"
            : "max-h-0 opacity-0 px-4 py-0",
        )}
      >
        <div className="body-2 text-n-3">{item.answer}</div>
      </div>
      <div
        className={clsx(
          "bg-black-700 -bottom-7 -top-7 left-0 right-0 -z-1 rounded-3xl opacity-0 transition-opacity duration-500 absolute",
          active && "opacity-100",
        )}
      >
        <div className="bg-black-100 absolute inset-0.5 -z-1 rounded-3xl" />
        <div className="absolute left-8 top-0 h-0.5 w-40 bg-purple-600" />
      </div>
    </div>
  );
};

export default FAQItem;
