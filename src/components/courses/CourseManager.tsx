"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Category, Course } from "@/types/routes.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Trash2,
  X,
  Check,
  Pencil,
  Star,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { uploadOptimizedImage } from "@/lib/upload-image";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";

type CourseManagerProps = {
  mode: "admin" | "tutor";
};

export default function CourseManager({ mode }: CourseManagerProps) {
  const isAdmin = mode === "admin";
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingPopular, setTogglingPopular] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Course | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    categoryId: "",
  });

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  const resetForm = () => {
    setForm({ title: "", description: "", image: "", categoryId: "" });
    setEditingCourse(null);
  };

  const fetchCourses = async () => {
    try {
      const url = isAdmin ? `${apiBase}/courses` : `${apiBase}/courses/mine`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setCourses(Array.isArray(data.data) ? data.data : []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiBase}/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, [isAdmin]);

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const result = await uploadOptimizedImage(file, "course");
      setForm((f) => ({ ...f, image: result.url }));
      toast.success(`Cover optimized (${result.format.toUpperCase()})`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.categoryId) {
      toast.error("Title and category are required");
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        image: form.image.trim() || undefined,
        categoryId: form.categoryId,
      };

      const url = editingCourse
        ? `${apiBase}/courses/${editingCourse.id}`
        : `${apiBase}/courses`;
      const method = editingCourse ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      toast.success(editingCourse ? "Course updated!" : "Course created!");
      resetForm();
      setShowForm(false);
      fetchCourses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`${apiBase}/courses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success("Course deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePopular = async (course: Course) => {
    setTogglingPopular(course.id);
    try {
      const res = await fetch(`${apiBase}/courses/${course.id}/popular`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPopular: !course.isPopular }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, isPopular: !course.isPopular } : c,
        ),
      );
      toast.success(
        !course.isPopular ? "Marked as popular" : "Removed from popular",
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setTogglingPopular(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <BookOpen className="h-6 w-6 text-[#611f69] dark:text-[#c084fc]" />
            {isAdmin ? "Manage Courses" : "My Courses"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {courses.length} course{courses.length !== 1 ? "s" : ""}
            {isAdmin && " · Toggle popular for the homepage section"}
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Course
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">
            No courses yet. Create your first one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="relative h-36 w-full">
                <Image
                  src={course.image || PLACEHOLDER_IMAGE}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                {course.isPopular && (
                  <Badge className="absolute top-2 left-2 bg-[#611f69] text-white dark:bg-[#c084fc] dark:text-black">
                    Popular
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <Badge variant="outline" className="mb-2 text-xs">
                  {course.category.name}
                </Badge>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {course.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                  {course.description || "No description"}
                </p>
                {!isAdmin && (
                  <p className="mt-2 text-xs text-gray-400">
                    By {course.createdBy.name}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-1">
                  {isAdmin && (
                    <button
                      type="button"
                      title={
                        course.isPopular
                          ? "Remove from popular"
                          : "Mark as popular"
                      }
                      disabled={togglingPopular === course.id}
                      onClick={() => handleTogglePopular(course)}
                      className={`rounded-md p-1.5 transition-colors ${
                        course.isPopular
                          ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Star
                        className={`h-4 w-4 ${course.isPopular ? "fill-current" : ""}`}
                      />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Edit course"
                    onClick={() => {
                      setEditingCourse(course);
                      setForm({
                        title: course.title,
                        description: course.description || "",
                        image: course.image || "",
                        categoryId: course.categoryId,
                      });
                      setShowForm(true);
                    }}
                    className="rounded-md p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete course"
                    disabled={deleting === course.id}
                    onClick={() => setConfirmDelete(course)}
                    className="rounded-md p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Edit Course" : "Create Course"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Title *
              </label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. React Masterclass"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Category *
              </label>
              <select
                title="Course category"
                value={form.categoryId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryId: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No categories found. Ask an admin to create categories first.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                placeholder="What will students learn?"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Cover image
              </label>
              <input
                type="file"
                accept="image/*"
                title="Upload course image"
                disabled={uploadingImage}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                }}
                className="block w-full text-sm"
              />
              {uploadingImage && (
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                </p>
              )}
              <Input
                className="mt-2"
                value={form.image}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image: e.target.value }))
                }
                placeholder="Or paste image URL"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.categoryId}
              className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  {editingCourse ? "Update" : "Create"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Delete <strong>{confirmDelete?.title}</strong>? This cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!confirmDelete) return;
                await handleDelete(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
