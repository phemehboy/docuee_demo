"use client";

import { cn } from "@/lib/utils";
import clsx from "clsx";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
    school: string;
    role: string;
    imageUrl: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  }, []);
  const [start, setStart] = useState(false);
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };
  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };
  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-screen overflow-hidden",
        "mask-[linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full w-max shrink-0 gap-6 px-4",
          "flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className={cn(
              "relative flex-shrink-0 w-[90vw] md:w-[60vw] max-w-full px-6 py-8 lg:p-12 rounded-2xl border",
              "border-slate-700 text-white"
            )}
          >
            <blockquote>
              {/* Glow/hover border */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-0.5 z-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-lg"
              ></div>

              {/* Quote */}
              <p className="relative z-10 text-base lg:text-lg leading-relaxed font-light text-gray-100">
                {item.quote}
              </p>

              {/* Author */}
              <div className="relative z-10 mt-6 flex items-center gap-4">
                <div
                  className={clsx(
                    "border-2",
                    item.role === "Student"
                      ? "border-white"
                      : "border-purple-500"
                  )}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="w-[60px] h-[60px] rounded-full object-cover overflow-hidden"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="text-lg font-bold">
                    {`${item.name} (${item.role})`}
                  </span>
                  <span className="text-sm text-gray-400">{item.title}</span>
                  {item.school && (
                    <span className="text-xs italic text-gray-500 mt-1">
                      {item.school}
                    </span>
                  )}
                  <span
                    className={clsx(
                      "mt-3 h-[1px] w-[60px]",
                      item.role === "Student" ? "bg-white" : "bg-purple-500"
                    )}
                  />
                </div>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};
