import React from "react";
import Heading from "./Heading";
import Section from "./Section";
import Image from "next/image";
import {
  ChatBubbleLeftRightIcon,
  PuzzlePieceIcon,
  UsersIcon,
} from "@heroicons/react/20/solid";

const FutureWork = () => {
  return (
    <Section
      id=""
      className="pt-[5rem] w-full flex justify-center items-center"
    >
      <div className="max-w-7xl w-full relative z-2">
        <Heading
          className="w-full"
          title="Our Commitment to, Continuous Improvement"
        />
        <div className="relative z-1 flex md:gap-20 mb-4 items-center h-[39rem] border border-n-1/10 rounded-3xl overflow-hidden lg:p-20 xl:h-[46rem] m-auto">
          <div className="absolute top-0 left-0 h-full w-full pointer-events-none md:w-3/5 xl:w-auto">
            <Image
              src="/assets/images/futureworkreal.png"
              alt="future work"
              width={800}
              height={730}
              className="w-full h-full object-cover opacity-30 lg:opacity-100 md:object-right"
            />
          </div>
          <div className="relative z-1 max-w-[20rem] ml-auto drop-shadow-md max-md:bg-gradient-to-r max-md:from-black-100/0 max-md:to-black-100/90">
            <p className="mb-6 text-sm md:text-lg leading-6 md:leading-7">
              We’re committed to enriching the student–supervisor and instructor
              experience, continuously evolving our platform to meet your needs.
              While we’re keeping some exciting features under wraps, here’s
              what we’re currently focused on:
            </p>
            <ul className="font-light text-[0.875rem] leading-6 md:text-base">
              <li className="flex items-start gap-2 p-4 border-t border-n-6">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-500" />
                Enhanced collaboration and communication tools
              </li>
              <li className="flex items-start gap-2 p-4 border-t border-n-6">
                <UsersIcon className="w-5 h-5 text-purple-500" />
                User experience improvements driven by your feedback
              </li>
              <li className="flex items-start gap-2 p-4 border-t border-n-6">
                <PuzzlePieceIcon className="w-5 h-5 text-purple-500" />
                Seamless integration with more academic platforms
              </li>
            </ul>
            <p className="text-sm md:text-lg md:text-shadow leading-6 md:leading-7 mt-4">
              Stay tuned—more updates are on the way as we continue to support
              your academic journey.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default FutureWork;
