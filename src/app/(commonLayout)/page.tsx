import HomeBanner from "@/components/home-page/Banner";
import PopularCourses from "@/components/home-page/PopularCourses";
import CategoryCoursesSection from "@/components/home-page/CategoryCoursesSection";
import MentorsSection from "@/components/home-page/Mentors";

export default async function Home() {
  return (
    <div className="min-h-[80vh]">
      <HomeBanner />
      <PopularCourses />
      <CategoryCoursesSection />
      <MentorsSection />
    </div>
  );
}

