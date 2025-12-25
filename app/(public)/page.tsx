import { HeroSection } from "@/components/home";

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <HeroSection />
    </>
  );
}
