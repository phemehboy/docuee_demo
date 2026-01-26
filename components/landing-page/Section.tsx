import { SectionProps } from "@/types";
import clsx from "clsx";

const Section = ({ id, children, className }: SectionProps) => {
  return (
    <div id={id} className={clsx(className)}>
      {children}
    </div>
  );
};

export default Section;
