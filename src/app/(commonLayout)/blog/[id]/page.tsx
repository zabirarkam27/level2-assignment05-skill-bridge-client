import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BlogPost } from "@/types/routes.type";
import { getPublicApiBases } from "@/lib/public-api";

const BLOG_PLACEHOLDER =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80";

async function getBlog(id: string): Promise<BlogPost | null> {
  for (const baseUrl of getPublicApiBases()) {
    try {
      const res = await fetch(`${baseUrl}/blogs/${id}`, {
        next: { revalidate: 60 },
      });
      if (res.status === 404) return null;
      if (!res.ok) continue;
      const data = await res.json();
      return data.data ?? null;
    } catch {
      continue;
    }
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blog = await getBlog(id);

  return {
    title: blog ? `${blog.title} | SkillBridge Blog` : "Blog | SkillBridge",
    description: blog?.excerpt,
  };
}

export default async function BlogDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blog = await getBlog(id);

  if (!blog) notFound();

  return (
    <main className="min-h-[80vh] bg-white dark:bg-gray-950">
      <article className="mx-auto max-w-4xl px-4 py-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#611f69] dark:text-[#c084fc]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blogs
        </Link>

        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="relative aspect-[16/8] w-full">
            <Image
              src={blog.image || BLOG_PLACEHOLDER}
              alt={blog.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>

          <div className="p-6 md:p-10">
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#611f69]/10 px-2.5 py-1 text-xs font-medium text-[#611f69] dark:bg-[#c084fc]/15 dark:text-[#c084fc]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl">
              {blog.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
              {blog.excerpt}
            </p>
            <div className="mt-5 border-b border-gray-200 pb-5 text-sm text-gray-500 dark:border-gray-800">
              By {blog.author?.name || "SkillBridge"} ·{" "}
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                dateStyle: "long",
              })}
            </div>

            <div className="mt-8 space-y-5 text-base leading-8 text-gray-700 dark:text-gray-300">
              {blog.content.split(/\n{2,}/).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
