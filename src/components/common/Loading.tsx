import { LoaderCircle } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div>
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="w-10 h-10 animate-spin text-primary" />
      </div>
    </div>
  );
};

export default Loading;
