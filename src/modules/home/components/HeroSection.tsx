import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/wrappers";

const HeroSection = () => {
  return (
    <SectionWrapper>
      <div className="grid w-full grid-cols-1 items-center gap-8 md:grid-cols-2 lg:gap-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-0 py-24">
        {/* Left: Text content */}
        <div className="h-full space-y-6">
          {/* Main heading with responsive sizing */}
          <h1 className="text-3xl leading-tight font-bold text-gray-900 md:text-3xl lg:mt-28 lg:text-6xl">
            The Ultimate Campus Lifestyle Platform
          </h1>

          {/* Description text */}
          <p className="max-w-lg text-sm text-gray-600 lg:text-lg">
            Everything you need for campus life in one place - buy, sell,
            connect, and thrive.
          </p>
          {/* <p className="max-w-lg text-sm text-gray-600 lg:text-lg">
            Connecting students, educators, and service providers in one seamless ecosystem
          </p> */}
          {/* "NEW!" badge with text */}
          <div className="flex w-full items-center justify-between gap-2 rounded-full border-1 border-red-500 p-1">
            <div className="flex items-center gap-x-2">
              {/* <span className="rounded-full border-1 border-red-500 px-3 text-xs font-medium text-red-500 lg:text-sm">
                NEW!
              </span> */}
            <div className="flex items-center gap-x-2 ps-3 text-xs font-medium text-gray-700 lg:text-sm">
                Connecting students, educators, and service providers in one
                seamless ecosystem{" "}
              </div>{" "}
            </div>
            <ArrowRight className="mt-1 h-5 w-5 text-red-400" />
          </div>
          {/* Store buttons */}
          <div className="flex flex-wrap gap-4 pt-4 text-white">
            {/* App Store */}
            {/* <button className="flex items-center gap-3 rounded-lg bg-black px-4 py-2 transition hover:bg-gray-800">
              <Image
                src="/assets/icons/app-store-badge.svg"
                alt="App Store"
                width={24}
                height={24}
                className="object-contain"
              />
              <div className="flex flex-col items-start text-left">
                <span className="text-xs leading-none font-light">Download on the</span>
                <span className="text-sm leading-none font-semibold">App Store</span>
              </div>
            </button> */}

            {/* Google Play */}
            {/* <button className="flex items-center gap-3 rounded-lg bg-black px-4 py-2 transition hover:bg-gray-800">
              <Image
                src="/assets/icons/play-store.svg"
                alt="Google Play"
                width={24}
                height={24}
                className="object-contain"
              />
              <div className="flex flex-col items-start text-left">
                <span className="text-xs leading-none font-light">Get it on</span>
                <span className="text-sm leading-none font-semibold">Google Play</span>
              </div>
            </button> */}
          </div>
        </div>

        {/* Right: App preview image with background */}
        <div className="relative flex h-full min-h-[500px] items-center justify-center">
          <div
            className="absolute inset-0 -z-10 bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("/assets/images/hero-bg.png")',
            }}
          />
          <Image
            src="/assets/images/hero-app-preview.png"
            alt="App Preview"
            width={350}
            height={700}
            className="relative z-10 object-contain"
            priority
          />
        </div>
      </div>
    </SectionWrapper>
  );
};

export default HeroSection;
