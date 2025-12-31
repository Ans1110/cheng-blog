import {
  HeroSection,
  ProjectSection,
  TechStackSection,
  LatestPostSection,
} from "@/components/home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Welcome to Cheng's Blog - A personal blog about web development, programming, and technology.",
};

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TechStackSection />
      <ProjectSection />
      <LatestPostSection />
    </>
  );
}
