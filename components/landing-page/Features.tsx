import Image from "next/image";
import { features } from "@/constants";
import Heading from "./Heading";
import ClipPath from "./ClipPath";
import { GradientLight } from "./Benefits";
import Section from "./Section";

const Features = () => {
  return (
    <Section id="features" className="pt-20 w-full">
      <div className="container relative z-2">
        <Heading
          className="w-full"
          title="Built to Help You Succeed, Explore Our Key Features"
        />

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-10 mb-10 w-full">
          {features.map((item: any) => (
            <div
              className="block relative p-0.5 bg-no-repeat bg-[length:100%_100%] md:max-w-[24rem]"
              style={{
                backgroundImage: `url(${item.backgroundUrl})`,
              }}
              key={item.id}
            >
              <div className="relative z-10 flex flex-col min-h-[22rem] p-[2.4rem] pointer-events-none">
                <h5 className="h5 mb-5">{item.title}</h5>
                <p className="body-2 mb-6 text-n-3">{item.text}</p>
                <div className="flex items-center gap-6 mt-auto">
                  <div
                    className={`icon-wrapper flex items-center justify-center w-12 h-12 rounded-md`}
                    style={{ backgroundColor: item.backgroundColor }}
                  >
                    <item.icon className="size-6" />
                  </div>
                  <p className="ml-auto font-code text-xs font-light text-n-1 uppercase tracking-wider">
                    Feature Highlight
                  </p>
                  {/* <Arrow /> */}
                </div>
              </div>
              {item.light && <GradientLight />}
              <div
                className="absolute inset-0.5 bg-n-8"
                style={{ clipPath: "url(#benefits)" }}
              >
                <div className="absolute inset-0 opacity-0 transition-opacity hover:opacity-10">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      height={362}
                      width={380}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              <ClipPath />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Features;
