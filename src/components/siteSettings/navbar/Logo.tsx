import Image from "next/image";
import React from "react";

const Logo = () => {
  return (
    <div className="flex items-center gap-x-1">
      <Image
        src="/assets/images/logo-icon.svg"
        alt="Logo"
        width={32}
        height={32}
        className="h-8 w-8"
      />
      <Image
        src="/assets/images/logo-text.svg"
        alt="Logo"
        width={100}
        height={100}
        className=""
      />
    </div>
  );
};

export default Logo;
