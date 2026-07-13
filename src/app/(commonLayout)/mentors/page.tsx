import AllMentors from "@/components/mentors/allMentors";

export const metadata = {
  title: "Mentors | MentorForge",
  description:
    "Browse all expert mentors on MentorForge and book your personalized learning session today.",
};

export default function MentorsPage() {
  return (
    <div className="min-h-[80vh] mb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center mb-2">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Our Expert Mentors
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Find the perfect tutor to accelerate your learning journey
          </p>
        </div>
        <AllMentors />
      </div>
    </div>
  );
}
