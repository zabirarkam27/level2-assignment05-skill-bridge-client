import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";
import { BlogPost } from "@/types/routes.type";
import { getPublicApiBases } from "@/lib/public-api";

export const metadata = {
  title: "Blog | SkillBridge",
  description: "SkillBridge learning guides for students and mentors.",
};

async function getBlogs(): Promise<BlogPost[]> {
  for (const baseUrl of getPublicApiBases()) {
    try {
      const res = await fetch(`${baseUrl}/blogs`, {
        next: { revalidate: 60 },
      });
      if (!res.ok) continue;
      const data = await res.json();
      return Array.isArray(data.data) ? data.data : [];
    } catch {
      continue;
    }
  }

  return [];
}

export default async function BlogPage() {
  const posts = await getBlogs();

  return (
    <main className="min-h-[80vh] bg-white dark:bg-gray-950">
      <section className="border-b bg-linear-to-b from-[#611f69]/5 to-transparent px-6 py-16 dark:from-[#c084fc]/10">
        <div className="mx-auto max-w-5xl text-center">
          <BookOpenText className="mx-auto h-10 w-10 text-[#611f69] dark:text-[#c084fc]" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            SkillBridge Blog
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-300">
            Practical learning notes for students, tutors, and admins using the platform.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-300">
              No blogs have been published yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex min-h-72 flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#611f69]/10 px-2 py-0.5 text-xs text-[#611f69] dark:bg-[#c084fc]/15 dark:text-[#c084fc]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="mt-4 line-clamp-2 text-xl font-semibold leading-7 text-gray-900 dark:text-white">
                  {post.title}
                </h2>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {post.excerpt}
                </p>
                <p className="mt-4 text-xs text-gray-500">
                  By {post.author?.name || "SkillBridge"} ·{" "}
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    dateStyle: "medium",
                  })}
                </p>
                <Link
                  href={`/blog/${post.id}`}
                  className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-[#611f69] dark:text-[#c084fc]"
                >
                  Read blog
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
