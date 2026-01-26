"use client";
import { navbars } from "@/constants";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useSession,
  useUser,
} from "@clerk/nextjs";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ClientOnly } from "../ClientOnly";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const mobileNavRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const { session } = useSession();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="relative w-full z-50 top-0 left-0 flex justify-between items-center min-h-16">
      <Link href="/">
        <Image
          src="/assets/images/white-logo.png"
          width={60}
          height={60}
          alt="logo"
          className="hidden md:block"
        />
        <Image
          src="/assets/images/white-logo.png"
          alt="Logo"
          width={36}
          height={36}
          className="mr-2 md:hidden"
        />
      </Link>

      <nav className="flex items-center justify-center gap-5 max-md:hidden">
        <div className="flex items-center justify-center m-auto lg:flex-row gap-8 text-sm text-white-100">
          {navbars.map((navbar) => (
            <Link
              key={navbar.id}
              href={navbar.link}
              className="transition-colors duration-500 hover:text-purple cursor-pointer"
            >
              {navbar.name}
            </Link>
          ))}
        </div>
        <p className="cursor-default opacity-15 w-0.5 h-5 bg-white-100 hidden lg:block" />
        <div className="flex gap-2">
          <ClientOnly>
            <SignedOut>
              <Button
                onClick={() => router.push(`/sign-in`)}
                className="gradient-blue rounded-[5px] px-2.5 py-1 m-0 h-7.5 cursor-pointer"
              >
                Login
              </Button>
            </SignedOut>
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
                    // Don't set false here because router.push() will navigate away
                    // but it's fine to keep for safety if something fails.
                    setLoading(false);
                  }
                }}
                className="gradient-blue rounded-[5px] px-2.5 m-0 h-7.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Loading..." : "Dashboard"}
              </Button>
              {!userLoaded ? (
                <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
              ) : (
                <UserButton />
              )}
            </SignedIn>
          </ClientOnly>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={clsx(
          "max-md:fixed z-1 max-md:top-0 max-md:left-0 max-md:bottom-0 max-md:right-0 max-md:backdrop-blur-sm max-md:opacity-0 md:hidden transition-opacity duration-300",
          isOpen ? "max-md:opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <nav className="absolute top-0 right-0 z-1 pt-4 rounded-xl">
          <div
            ref={mobileNavRef}
            className="w-75 h-full flex flex-col items-start gap-5 p-5 bg-doc bg-cover rounded-xl"
          >
            <div className="w-full flex flex-col gap-5 text-sm text-white-100">
              {navbars.map((navbar) => (
                <Link
                  key={navbar.id}
                  href={navbar.link}
                  className="hover:text-purple transition-colors duration-500 cursor-pointer"
                >
                  {navbar.name}
                </Link>
              ))}
            </div>
            <p className="cursor-default opacity-15 w-full h-px bg-white-100" />
            <div className="w-full">
              {/* Show login button if signed out */}
              <ClientOnly>
                <SignedOut>
                  <Button
                    onClick={() => router.push(`/sign-in`)}
                    className="gradient-blue rounded-[5px] px-2.5 py-1 m-0 h-7.5 cursor-pointer"
                  >
                    Login
                  </Button>
                </SignedOut>

                {/* Show dashboard + user button if signed in */}
                <SignedIn>
                  <div className="flex justify-between items-center gap-2">
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
                          // Don't set false here because router.push() will navigate away
                          // but it's fine to keep for safety if something fails.
                          setLoading(false);
                        }
                      }}
                      className="gradient-blue rounded-[5px] px-2.5 py-1 m-0 h-7.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? "Loading..." : "Dashboard"}
                    </Button>

                    {/* Only wrap UserButton in ClientOnly (it needs client env) */}
                    {!userLoaded ? (
                      <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
                    ) : (
                      <UserButton />
                    )}
                  </div>
                </SignedIn>
              </ClientOnly>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Button */}
      <Button
        ref={buttonRef}
        className="relative z-2 flex justify-center items-center md:hidden p-0"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle mobile menu"
      >
        <Image
          src={`/assets/icons/${isOpen ? "close" : "hamburger"}.svg`}
          alt={isOpen ? "close" : "hamburger"}
          width={20}
          height={20}
        />
      </Button>
    </div>
  );
};

export default Header;
