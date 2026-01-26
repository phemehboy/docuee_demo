"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, useSession, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { LoaderIcon } from "lucide-react";
import { Inter } from "next/font/google";
import { Spotlight } from "../ui/Spotlight";
import { TextGenerateEffect } from "../ui/text-generate-effect";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const Hero = () => {
  const router = useRouter();
  const { isLoaded } = useUser();
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  const { session } = useSession();

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Show loader until both Clerk and hydration are ready
  if (!hydrated || !isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderIcon className="size-8 animate-spin text-blue-600" />
        <span className="ml-4 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <section
      className={`${inter.className} relative z-50 px-4 md:px-8 lg:px-20 xl:px-40 
    min-h-[90vh] md:min-h-0 lg:min-h-[90vh] 
    flex flex-col justify-center md:justify-start lg:justify-center 
    pt-10 md:pt-16 lg:pt-0`}
    >
      {/* Background Effects */}
      <div className=" absolute inset-0 pointer-events-none">
        <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
          fill="white"
        />
        <Spotlight
          className=" top-10 left-full h-[80vh] w-[50vw]"
          fill="purple"
        />
        <Spotlight className="top-15 left-80 h-[80vh] w-[50vw]" fill="blue" />
        <div className=" absolute inset-0 flex items-center justify-center dark:bg-black-100 bg-bgColor [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>

      <div className="  relative flex flex-col-reverse md:flex-row items-center justify-between gap-10 md:gap-8 lg:gap-12">
        {/* Desktop Content */}
        <div className="w-full md:w-3/5 flex-col items-center text-center hidden md:flex">
          <TextGenerateEffect
            className="text-[32px] sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
            words="Everything You Need — From Projects to Exams, All in One Place."
          />

          <p className="mt-4 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl">
            Manage academic work for all schools — connect with supervisors,
            submit tasks, take tests and exams, and collaborate seamlessly. And
            we’re just getting started!
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center md:justify-start w-full sm:w-auto">
            {hydrated && (
              <>
                <SignedIn>
                  <Button
                    onClick={async () => {
                      if (session) {
                        await session.reload();
                      }
                      router.push("/dashboard");
                    }}
                    className="w-full sm:w-auto px-3 py-1.5 text-sm gradient-blue cursor-pointer"
                  >
                    Get Started Today
                  </Button>
                </SignedIn>
                <SignedOut>
                  <Link href="/sign-in">
                    <Button className="w-full sm:w-auto px-3 py-1.5 text-sm gradient-blue cursor-pointer">
                      Get Started Today
                    </Button>
                  </Link>
                </SignedOut>
              </>
            )}
            <Link href="#how-it-works">
              <Button className="w-full sm:w-auto px-3 py-1.5 text-sm border border-blue-500 bg-black-100 text-white cursor-pointer">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Image + Mobile Content */}
        <div className="relative w-full md:w-2/5 flex flex-col items-center md:items-end">
          <Image
            src="/assets/images/projecttop.png"
            alt="project illustration"
            width={700}
            height={700}
            className="w-full h-auto object-contain opacity-80 md:opacity-100"
            priority
          />

          {/* Mobile Text Overlapping Image */}
          <div className="-mt-24 md:hidden text-center w-full relative z-10 px-4">
            <div className="bg-gradient-to-t from-black/70 to-transparent p-4 rounded-lg">
              <TextGenerateEffect
                className="text-[28px] sm:text-3xl font-bold leading-tight text-white"
                words="Everything You Need — From Projects to Exams, All in One Place."
              />
              <p className="mt-3 text-sm sm:text-base text-white drop-shadow max-w-[90%] mx-auto">
                Manage academic work for all schools — connect with supervisors,
                submit tasks, take tests and exams, and collaborate seamlessly.
                And we’re just getting started!
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center w-full sm:w-auto">
              {hydrated && (
                <>
                  <SignedIn>
                    <Button
                      disabled={loading}
                      onClick={async () => {
                        try {
                          setLoading(true);

                          if (session) {
                            await session.reload();
                          }

                          router.push("/dashboard");
                        } finally {
                          // Same reason: UI will likely navigate away,
                          // but leaving it here for safety if navigation fails.
                          setLoading(false);
                        }
                      }}
                      className="w-full sm:w-auto px-6 py-3 text-sm gradient-blue disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? "Loading..." : "Get Started Today"}
                    </Button>
                  </SignedIn>
                  <SignedOut>
                    <Link href="/sign-in">
                      <Button className="w-full sm:w-auto px-6 py-3 text-sm gradient-blue cursor-pointer">
                        Get Started Today
                      </Button>
                    </Link>
                  </SignedOut>
                </>
              )}
              <Link href="#how-it-works">
                <Button className="w-full sm:w-auto px-6 py-3 text-sm border border-blue-500 bg-black-100 text-white cursor-pointer">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
