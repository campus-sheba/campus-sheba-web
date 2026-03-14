import { Paragraph } from "@/components/ui/typography";
import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-white">
      <div className="mx-auto flex max-w-container items-center justify-center px-6 py-5">
        <Paragraph size="sm" weight="medium" className="text-gray-500">
          &copy; {new Date().getFullYear()} The Downtown. All rights reserved.
        </Paragraph>
      </div>
    </footer>
  );
};

export default Footer;
