import AllCourses from "@/components/courses/allCourses";
import { BookOpen } from "lucide-react";
import { Suspense } from "react";

export default function CoursesPage() {
  return (
    <div className="mb-20 min-h-[80vh]">
      <div className="bg-linear-to-b from-[#611f69]/5 to-transparent px-6 py-14 dark:from-[#c084fc]/10">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            <BookOpen className="h-8 w-8 text-[#611f69] dark:text-[#c084fc]" />
            All Courses
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
            Browse courses across every category and learn from expert tutors
            and admins on Skill Bridge.
          </p>
        </div>
      </div>
      <Suspense fallback={null}>
        <AllCourses emptyMessage="No courses have been published yet." />
      </Suspense>
    </div>
  );
}
