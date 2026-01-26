import React from "react";
import Section from "./Section";
import Heading from "./Heading";
import { faqs } from "@/constants";
import FAQItem from "./FAQItem";

const FAQs = () => {
  const halfLength = Math.floor(faqs.length / 2);
  return (
    <Section id="faqs" className="pt-20 w-full">
      <div className="lg:container relative z-2">
        <Heading className="w-full" title="Got Questions?, We’ve Got Answers" />
        <div className="flex flex-col md:flex-row">
          <div className="relative flex-1 pt-5">
            {faqs.slice(0, halfLength).map((item, index) => (
              <FAQItem key={item.id} item={item} index={index} />
            ))}
          </div>
          <div className="relative flex-1 lg:pt-5">
            {faqs.slice(halfLength).map((item, index) => (
              <FAQItem key={item.id} item={item} index={halfLength + index} />
            ))}
          </div>
          <div className="faq-lin_after absolute left-[calc(50%-1px)] top-0 -z-1 h-[70%] w-0.5 bg-black-800 max-lg:hidden mt-[11.2rem]" />
        </div>
      </div>
    </Section>
  );
};

export default FAQs;
