import React from "react";
import Section from "./Section";
import Heading from "./Heading";
import { feedback } from "@/constants";
import { InfiniteMovingCards } from "../ui/infinite-moving-cards";

const SatisfiedUsers = () => {
  return (
    <Section id="" className="pt-[5rem] w-full">
      <div className="container relative z-2">
        <Heading
          className="w-full"
          title="Hear from Students, Instructors and Supervisors"
        />
        <div className="flex flex-col items-center">
          <InfiniteMovingCards
            items={feedback}
            direction="right"
            speed="slow"
          />
        </div>
      </div>
    </Section>
  );
};

export default SatisfiedUsers;
