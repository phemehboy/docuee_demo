import React from "react";
import Section from "./Section";
import Heading from "./Heading";
import { howItWorks } from "@/constants";
import Image from "next/image";

const HowItWorks = () => {
  return (
    <Section id="how-it-works" className="pt-[3rem] w-full">
      <div className="container relative z-2">
        <Heading className="md:max-w-md lg:max-w-2xl" title="How It Works" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-[2rem] mb-10 w-full bg-black-900">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {howItWorks.map((howItWork) => (
            <div
              key={howItWork.id}
              className="overflow-hidden px-2 py-4 flex flex-col items-left text-left"
            >
              <div className="flex gap-2 mb-1">
                <div className="size-6 rounded-full bg-purple text-black flex items-center justify-center">
                  <p>{howItWork.id}</p>
                </div>

                <h3>{howItWork.title}</h3>
              </div>
              <Image
                src={howItWork.illustration}
                alt={howItWork.title}
                height={1000}
                width={1000}
                className="object-contain"
              />
              <p className="text-gray-400 text-sm">{howItWork.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default HowItWorks;
