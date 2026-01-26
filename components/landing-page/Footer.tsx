import { quickLinks, socialMedia, supportLinks } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="relative z-1 w-full flex flex-col items-center mt-10 py-2">
      <div className="max-w-300 mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6">
        <div className="max-md:pb-3 max-md:border-b border-gray-600/20 md:border-r md:border-gray-600/20">
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
        </div>

        <div className="max-md:pb-3 max-md:border-b border-gray-600/20 md:border-r md:border-gray-600/20">
          <h3 className="text-lg lg:text-xl font-light mb-1 text-purple-500">
            Docuee
          </h3>
          <p className="text-sm text-gray-300">
            Empowering students, supervisors, and instructors to manage
            projects, assignments, tests, exams, and quizzes efficiently—all in
            one platform.
          </p>
        </div>
        <div className="max-md:pb-3 max-md:border-b border-gray-600/20 md:border-r md:border-gray-600/20">
          <h4 className="text-base md:text-lg font-light mb-1 text-purple-500">
            Quick Links
          </h4>
          <ul className="space-y-2">
            {quickLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className="text-sm w-6.25 py-2 pr-8 hover:underline font-light "
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-base md:text-lg font-light mb-1 text-purple-500">
            Support
          </h4>
          <ul className="space-y-2">
            {supportLinks.map((link, index) => (
              <li key={index} id={link.id}>
                <a
                  href="#"
                  className="text-sm w-6.25 py-2 pr-8 hover:underline font-light"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative z-10 flex mt-4 md:flex-row md:py-2 md:px-5 p-2 max-sm:gap-5 flex-col justify-between items-center w-full">
        <p className="copyright">
          © {new Date().getFullYear()} Docuee. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          {socialMedia.map((item) => (
            <Link
              href={item.url}
              key={item.id}
              className="flex items-center justify-center p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors hover:bg-black-900/50"
            >
              <Image src={item.img} alt={item.title} width={16} height={16} />
            </Link>
          ))}
        </div>
      </div>

      {/* Added the "Docuee is under Bencept" statement */}
      <div className="w-full border-t border-gray-600/20 p-1 text-center text-gray-400 text-sm">
        Docuee is a product under <span className="font-medium">Bencept</span>.
      </div>
    </div>
  );
};

export default Footer;
