import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Star,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/routes.type";
import { COURSE_PLACEHOLDER_IMAGE } from "@/components/courses/CourseCard";
import { fetchPublicApi } from "@/lib/public-api";

type CourseResponse = {
  success: boolean;
  data?: Course;
};

async function getCourse(id: string) {
  const res = await fetchPublicApi(`/courses/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error("Failed to load course");
  }

  const payload = (await res.json()) as CourseResponse;
  if (!payload.data) {
    notFound();
  }

  return payload.data;
}

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourse(id);
  const assignedTutorProfileId = course.tutor?.tutorProfile?.id;
  const providerName = course.tutor?.name || "Instructor not assigned";
  const publishedDate = new Date(course.createdAt).toLocaleDateString("en-BD", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-[80vh] bg-white dark:bg-gray-950">
      <section className="border-b bg-gradient-to-b from-[#611f69]/5 to-transparent px-4 py-8 dark:from-[#c084fc]/10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Button
            asChild
            variant="ghost"
            className="mb-6 text-gray-600 hover:text-[#611f69] dark:text-gray-300 dark:hover:text-[#c084fc]"
          >
            <Link href="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to courses
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge className="bg-[#611f69] text-white dark:bg-[#c084fc] dark:text-black">
                  {course.category.name}
                </Badge>
                {course.isPopular && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    Popular
                  </span>
                )}
              </div>

              <h1 className="max-w-3xl text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl">
                {course.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
                {course.description || "No description available for this course yet."}
              </p>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-100 bg-gray-100 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Image
                src={course.image || COURSE_PLACEHOLDER_IMAGE}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-8">
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
              <BookOpen className="h-5 w-5 text-[#611f69] dark:text-[#c084fc]" />
              Course Overview
            </h2>
            <p className="leading-7 text-gray-600 dark:text-gray-300">
              {course.description ||
                "This course is ready for learners. More details can be added by the admin or tutor from the course manager."}
            </p>
          </div>

          {course.category.description && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                <GraduationCap className="h-5 w-5 text-[#611f69] dark:text-[#c084fc]" />
                Category Focus
              </h2>
              <p className="leading-7 text-gray-600 dark:text-gray-300">
                {course.category.description}
              </p>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
            Course Information
          </h2>
          <dl className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 text-[#611f69] dark:text-[#c084fc]" />
              <div>
                <dt className="font-medium text-gray-900 dark:text-white">
                  Instructor
                </dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-300">
                  {providerName}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 h-4 w-4 text-[#611f69] dark:text-[#c084fc]" />
              <div>
                <dt className="font-medium text-gray-900 dark:text-white">
                  Category
                </dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-300">
                  {course.category.name}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-[#611f69] dark:text-[#c084fc]" />
              <div>
                <dt className="font-medium text-gray-900 dark:text-white">
                  Published
                </dt>
                <dd className="mt-1 text-gray-600 dark:text-gray-300">
                  {publishedDate}
                </dd>
              </div>
            </div>
          </dl>

          <Button
            asChild={!!assignedTutorProfileId}
            disabled={!assignedTutorProfileId}
            className="mt-6 w-full bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black dark:hover:bg-[#d8b4fe]"
          >
            {assignedTutorProfileId ? (
              <Link href={`/book/${assignedTutorProfileId}?courseId=${course.id}`}>
                Book {providerName}
              </Link>
            ) : (
              "Instructor unavailable"
            )}
          </Button>
        </aside>
      </section>
    </main>
  );
}
