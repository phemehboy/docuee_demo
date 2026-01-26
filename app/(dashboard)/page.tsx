import Header from "@/components/landing-page/Header";
import Hero from "@/components/landing-page/Hero";
import Why from "@/components/landing-page/Why";
import Features from "@/components/landing-page/Features";
import HowItWorks from "@/components/landing-page/HowItWorks";
import SatisfiedUsers from "@/components/landing-page/SatisfiedUsers";
import FAQs from "@/components/landing-page/FAQs";
import FutureWork from "@/components/landing-page/FutureWork";
import CallToAction from "@/components/landing-page/CallToAction";
import Footer from "@/components/landing-page/Footer";

async function Home() {
  return (
    <main className="w-full flex flex-col">
      <div className="w-full flex justify-center items-center flex-col px-3 sm:px-8 pb-5 overflow-clip">
        <Header />
        <Hero />
        <Why />
        <Features />
        <HowItWorks />
        <SatisfiedUsers />
        <FAQs />
        <FutureWork />
        <CallToAction />
      </div>
      <Footer />
    </main>
  );
}

export default Home;
