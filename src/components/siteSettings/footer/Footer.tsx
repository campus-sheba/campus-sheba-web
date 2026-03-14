import Link from "next/link";
import React from "react";

interface FooterProps {
  locale?: string;
}

const Footer: React.FC<FooterProps> = ({ locale }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-black">
      <div className="border-t border-gray-800 bg-gray-900">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} Campus Sheba. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li>
                  <Link
                    className="text-sm text-gray-400 hover:text-gray-300"
                    href={locale ? `/${locale}/careers` : "/careers"}
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
