import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { BlogCards } from "@/components/blog-cards";
import SignIn from "@/components/sign-in";

export default function Home() {
  return (
    <div className="bg-[#E5F3FB]">
      <SignIn />
      <Hero />
      <Services />
      <BlogCards />
    </div>
  );
}
