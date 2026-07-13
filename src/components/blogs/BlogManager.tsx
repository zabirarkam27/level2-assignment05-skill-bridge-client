"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpenText, Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BlogPost } from "@/types/routes.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  image: "",
  tags: "",
  isPublished: true,
};

type BlogForm = typeof emptyForm;

type BlogManagerProps = {
  mode: "admin" | "tutor";
};

export default function BlogManager({ mode }: BlogManagerProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingBlog(null);
  };

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/blogs/manage`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load blogs");
      setBlogs(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load blogs");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (blog: BlogPost) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      image: blog.image || "",
      tags: blog.tags.join(", "),
      isPublished: blog.isPublished,
    });
    setDialogOpen(true);
  };

  const validate = () => {
    if (form.title.trim().length < 5) return "Title must be at least 5 characters";
    if (form.excerpt.trim().length < 20) return "Excerpt must be at least 20 characters";
    if (form.content.trim().length < 120) return "Content must be at least 120 characters";
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    const toastId = toast.loading(editingBlog ? "Updating blog..." : "Publishing blog...");

    try {
      const body = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        image: form.image.trim() || undefined,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isPublished: form.isPublished,
      };
      const res = await fetch(
        editingBlog ? `${apiBase}/blogs/${editingBlog.id}` : `${apiBase}/blogs`,
        {
          method: editingBlog ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Save failed");

      setBlogs((current) =>
        editingBlog
          ? current.map((blog) => (blog.id === data.data.id ? data.data : blog))
          : [data.data, ...current],
      );
      toast.success(editingBlog ? "Blog updated" : "Blog published", { id: toastId });
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed", {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blog: BlogPost) => {
    if (!confirm(`Delete "${blog.title}"?`)) return;

    const toastId = toast.loading("Deleting blog...");
    try {
      const res = await fetch(`${apiBase}/blogs/${blog.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Delete failed");
      setBlogs((current) => current.filter((item) => item.id !== blog.id));
      toast.success("Blog deleted", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed", {
        id: toastId,
      });
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenText className="h-6 w-6 text-[#611f69] dark:text-[#c084fc]" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === "admin" ? "Manage Blogs" : "My Blogs"}
            </h1>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Write readable learning articles for students and publish them on the public blog page.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Blog
        </Button>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No blogs yet. Create the first one.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {blogs.map((blog) => (
              <article key={blog.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {blog.title}
                    </h2>
                    <span
                      className={
                        blog.isPublished
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      }
                    >
                      {blog.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {blog.excerpt}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    By {blog.author?.name || "Unknown"} ·{" "}
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      dateStyle: "medium",
                    })}
                  </p>
                  {blog.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#611f69]/10 px-2 py-0.5 text-xs text-[#611f69] dark:bg-[#c084fc]/15 dark:text-[#c084fc]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  {blog.isPublished && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/blog/${blog.id}`}>Read</Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(blog)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(blog)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingBlog ? "Edit Blog" : "Write New Blog"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="blog-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="blog-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="How to prepare for a productive tutoring session"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="blog-excerpt" className="text-sm font-medium">
                Short excerpt
              </label>
              <Textarea
                id="blog-excerpt"
                value={form.excerpt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, excerpt: event.target.value }))
                }
                rows={3}
                placeholder="Summarize what readers will learn from this post."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="blog-content" className="text-sm font-medium">
                Full blog content
              </label>
              <Textarea
                id="blog-content"
                value={form.content}
                onChange={(event) =>
                  setForm((current) => ({ ...current, content: event.target.value }))
                }
                rows={12}
                placeholder="Write the full article. Use short paragraphs for readability."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="blog-image" className="text-sm font-medium">
                  Cover image URL
                </label>
                <Input
                  id="blog-image"
                  value={form.image}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, image: event.target.value }))
                  }
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="blog-tags" className="text-sm font-medium">
                  Tags
                </label>
                <Input
                  id="blog-tags"
                  value={form.tags}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, tags: event.target.value }))
                  }
                  placeholder="learning, tutoring, productivity"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isPublished: event.target.checked,
                  }))
                }
              />
              Publish this blog
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingBlog ? "Update Blog" : "Publish Blog"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
