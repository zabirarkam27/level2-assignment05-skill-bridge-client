import HomeBanner from "@/components/home-page/Banner";
import PopularCourses from "@/components/home-page/PopularCourses";
import CategoryCoursesSection from "@/components/home-page/CategoryCoursesSection";
import MentorsSection from "@/components/home-page/Mentors";
import HowItWorks from "@/components/home-page/HowItWorks";
import FAQSection from "@/components/home-page/FAQSection";
import NewsletterSection from "@/components/home-page/NewsletterSection";

export default async function Home() {
  return (
    <div className="min-h-[80vh]">
      <HomeBanner />
      <HowItWorks />
      <PopularCourses />
      <CategoryCoursesSection />
      <FAQSection />
      <MentorsSection />
      <NewsletterSection />
    </div>
  );
}

