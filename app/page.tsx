import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Services } from "@/components/services";
import { VerifiedDoctors } from "@/components/verified-doctors";
import { BlogCards } from "@/components/blog-cards";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="bg-[#E5F3FB]">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <VerifiedDoctors />
      <BlogCards />
    </div>
  );
}
