"use client";
import React from "react";
import { useParams } from "next/navigation";
import HomeTemplate from "./templates/HomeTemplate";

const HomePage = () => {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  return <HomeTemplate locale={locale} />;
};

export default HomePage;
