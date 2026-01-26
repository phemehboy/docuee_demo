import React from "react";
import Section from "./Section";

const Why = () => {
  return (
    <Section id="why" className="mt-20 flex justify-center scroll-mt-16">
      <div className="max-w-7xl relative p-4 lg:p-6 z-1 lg:p-15 rounded-2xl flex-1 flex-col bg-black-900">
        <h2 className="mb-2 text-[30px]">
          Why We Built <span className="text-purple-500">This Platform</span>
        </h2>
        <p className="mb-4 font-light leading-7">
          Academic work should be simple, affordable, and accessible for every
          school. Many existing tools are expensive, complicated, or built for
          only one institution at a time—leaving students and educators with
          more stress than support.
        </p>

        <p className="mb-4 font-light leading-7">
          We built this platform to give schools, instructors, and students a
          single place to manage every stage of academic work. From project
          selection and supervision to writing, submitting, grading, taking
          tests, quizzes, and exams—all of it happens in one seamless
          experience.
        </p>

        <p className="font-light leading-7">
          Our mission is to empower education with tools that are easy to use,
          affordable, and built for real-world learning. With real-time
          collaboration, automated workflows, and a growing suite of academic
          features, we’re creating a future where every school task can be done
          from one platform—and we’re only getting started.
        </p>
      </div>
    </Section>
  );
};

export default Why;
