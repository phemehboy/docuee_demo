"use client";

import React, { useEffect, useState } from "react";
import Section from "./Section";
import Image from "next/image";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useSession, useUser } from "@clerk/nextjs";
import { getUserById } from "@/lib/actions/user.action";

const CallToAction = () => {
  const router = useRouter();
  const { session } = useSession();
  const { user: currentUser, isLoaded } = useUser();

  const [userType, setUserType] = useState<
    "student" | "instructor" | "supervisor" | "schoolAdmin" | null
  >(null);
  const [subscriptionType, setSubscriptionType] = useState<
    "free" | "premium" | null
  >(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!currentUser) return setSubscriptionLoading(false);

      try {
        const dbUser = await getUserById(currentUser.id);
        setSubscriptionType(dbUser?.subscriptionType ?? "free");
        setUserType(dbUser?.userType ?? null);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchUserDetails();
  }, [currentUser]);

  if (!isLoaded || subscriptionLoading) return null;

  // --------------------------
  // If NO USER, show sign-in CTA
  // --------------------------
  if (!currentUser) {
    return (
      <Section id="" className="w-full pt-10 flex justify-between">
        <div className="w-full relative py-6 pl-6 md:pr-20 z-1 lg:p-10 rounded-2xl flex justify-between before:absolute before:bg-black-200 before:opacity-50 before:left-0 before:top-0 before:w-full before:h-full before:-z-1 before:rounded-2xl">
          <div className="flex-1 flex-col">
            <h2 className="mb-5 text-[30px] max-sm:w-50">
              Your Academic Work, Simplified.
            </h2>
            <p className="text-gray-400 mb-5 max-w-120 max-sm:w-75 font-light">
              Submit projects, assignments, tests, exams, and quizzes, track
              your progress, and manage your academic life—all in one platform.
              Sign in to get started.
            </p>

            <Button
              className="flex justify-between gradient-blue items-center gap-2 cursor-pointer"
              onClick={() => router.push("/sign-in")}
            >
              <span className="text-sm">Sign In</span>
              <ArrowRight className="size-4 animate-arrow" />
            </Button>
          </div>

          <Image
            src="/assets/images/call.png"
            width={400}
            height={100}
            alt="CTA image"
            className="hidden lg:block lg:ml-4"
            style={{ height: "auto" }}
          />
        </div>
      </Section>
    );
  }

  // --------------------------
  // If USER exists, show contextual CTA
  // --------------------------
  const isStudent = userType === "student";
  const isSupervisor = userType === "supervisor";
  const isInstructor = userType === "instructor";
  const hasSubscription = subscriptionType === "premium";

  const heading = isStudent
    ? hasSubscription
      ? "Welcome Back!"
      : "Your Work, Our Platform. Let’s Make It Happen!"
    : isSupervisor || isInstructor
      ? "Go to Your Dashboard!"
      : "Manage Your School Effortlessly";

  const description = isStudent
    ? hasSubscription
      ? "You’re all set — dive back into your dashboard and continue where you left off."
      : "Submit your work, get feedback, and write with ease using our built-in editor. Stay organized and unlock full access by subscribing now!"
    : isSupervisor || isInstructor
      ? "Easily manage your tasks, review submissions, and support students using your dedicated tools."
      : "Oversee the entire school, monitor progress, and manage users and operations efficiently from one place.";

  const buttonLabel = isStudent
    ? hasSubscription
      ? "Go to Dashboard"
      : "Start Now"
    : "Enter Dashboard";

  return (
    <Section id="" className="w-full pt-10 flex justify-between">
      <div className="w-full relative py-6 pl-6 md:pr-20 z-1 lg:p-10 rounded-2xl flex justify-between before:absolute before:bg-black-200 before:opacity-50 before:left-0 before:top-0 before:w-full before:h-full before:-z-1 before:rounded-2xl">
        <div className="flex-1 flex-col">
          <h2 className="mb-5 text-[30px] max-sm:w-50">{heading}</h2>
          <p className="text-gray-400 mb-5 max-w-120 max-sm:w-75 font-light">
            {description}
          </p>
          <Button
            disabled={loading}
            className="flex justify-between gradient-blue items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={async () => {
              try {
                setLoading(true);

                if (session) {
                  await session.reload();
                }

                router.push("/dashboard");
              } finally {
                setLoading(false); // safe fallback if routing fails
              }
            }}
          >
            <span className="text-sm">
              {loading ? "Loading..." : buttonLabel}
            </span>

            {!loading && <ArrowRight className="size-4 animate-arrow" />}

            {/* Optional spinner when loading */}
            {loading && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}
          </Button>
        </div>

        <Image
          src="/assets/images/call.png"
          width={400}
          height={100}
          alt="CTA image"
          className="hidden lg:block lg:ml-4"
          style={{ height: "auto" }}
        />
      </div>
    </Section>
  );
};

export default CallToAction;
