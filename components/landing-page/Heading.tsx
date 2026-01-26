import { SectionHeadingProps } from "@/types";

const Heading = ({ className, title, text }: SectionHeadingProps) => {
  const splitText = title.split(/[,]/);

  return (
    <div className={`${className} max-w-200 mx-auto mb-5 lg:mb-10 text-center`}>
      {title && (
        <h2 className="h2 md:text-center">
          {splitText.map((purpleWords, index) => {
            return (
              <span
                key={index}
                className={index === 1 ? "text-purple-500" : "text-white"}
              >
                {purpleWords}
                {index === 0 && purpleWords.includes("Succeed") && ","}
              </span>
            );
          })}
        </h2>
      )}
      {text && <p className="body-2 mt-4 text-n-4">{text}</p>}
    </div>
  );
};

export default Heading;
