"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AppUser, Category, Course } from "@/types/routes.type";
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
import { useSessionContext } from "@/context/SessionContext";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";

type CourseManagerProps = {
  mode: "admin" | "tutor";
};

type CourseDeleteRequest = {
  id: string;
  course: Course;
  requester: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  createdAt: string;
};

export default function CourseManager({ mode }: CourseManagerProps) {
  const isAdmin = mode === "admin";
  const { user } = useSessionContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tutors, setTutors] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingPopular, setTogglingPopular] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Course | null>(null);
  const [confirmPopularRemoval, setConfirmPopularRemoval] =
    useState<Course | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteRequests, setDeleteRequests] = useState<CourseDeleteRequest[]>(
    [],
  );
  const [resolvingRequest, setResolvingRequest] = useState<string | null>(null);
  const [tutorCourseTab, setTutorCourseTab] = useState<"mine" | "others">(
    "mine",
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    categoryId: "",
    tutorId: "",
  });

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      image: "",
      categoryId: "",
      tutorId: "",
    });
    setEditingCourse(null);
  };

  const fetchCourses = useCallback(async () => {
    try {
      const url = isAdmin
        ? `${apiBase}/courses?dashboard=${Date.now()}`
        : `${apiBase}/courses/mine?dashboard=${Date.now()}`;
      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      setCourses(Array.isArray(data.data) ? data.data : []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, isAdmin]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch {
      setCategories([]);
    }
  }, [apiBase]);

  const fetchTutors = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const res = await fetch(`${apiBase}/admin/users`, {
        credentials: "include",
      });
      const data = await res.json();
      const users = Array.isArray(data.data) ? (data.data as AppUser[]) : [];
      setTutors(
        users.filter(
          (user) => user.role === "TUTOR" && user.status === "ACTIVE",
        ),
      );
    } catch {
      setTutors([]);
    }
  }, [apiBase, isAdmin]);

  const fetchDeleteRequests = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const res = await fetch(`${apiBase}/courses/delete-requests`, {
        credentials: "include",
      });
      const data = await res.json();
      setDeleteRequests(Array.isArray(data.data) ? data.data : []);
    } catch {
      setDeleteRequests([]);
    }
  }, [apiBase, isAdmin]);

  useEffect(() => {
    fetchCategories();
    fetchCourses();
    fetchTutors();
    fetchDeleteRequests();
  }, [fetchCategories, fetchCourses, fetchTutors, fetchDeleteRequests]);

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
    if (!form.title.trim() || !form.categoryId || (isAdmin && !form.tutorId)) {
      toast.error(
        isAdmin
          ? "Title, category, and instructor are required"
          : "Title and category are required",
      );
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        image: form.image.trim() || undefined,
        categoryId: form.categoryId,
        ...(isAdmin && { tutorId: form.tutorId }),
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
      if (data.data) {
        setCourses((prev) =>
          editingCourse
            ? prev.map((course) =>
                course.id === data.data.id ? data.data : course,
              )
            : [data.data, ...prev],
        );
      }
      if (!isAdmin) setTutorCourseTab("mine");
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
      const res = await fetch(
        isAdmin ? `${apiBase}/courses/${id}` : `${apiBase}/courses/${id}/delete-request`,
        {
          method: isAdmin ? "DELETE" : "POST",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (isAdmin) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        setDeleteRequests((prev) =>
          prev.filter((request) => request.course.id !== id),
        );
        toast.success("Course deleted");
      } else {
        setCourses((prev) =>
          prev.map((course) =>
            course.id === id
              ? {
                  ...course,
                  deleteRequests: [
                    {
                      id: data.data?.id || "pending",
                      requesterId: user?.id || "",
                      status: "PENDING",
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : course,
          ),
        );
        toast.success(data.message || "Delete request sent to admin");
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : isAdmin
            ? "Delete failed"
            : "Delete request failed",
      );
    } finally {
      setDeleting(null);
    }
  };

  const handleResolveDeleteRequest = async (
    requestId: string,
    action: "APPROVED" | "REJECTED",
  ) => {
    setResolvingRequest(requestId);
    try {
      const res = await fetch(`${apiBase}/courses/delete-requests/${requestId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");

      const request = deleteRequests.find((item) => item.id === requestId);
      setDeleteRequests((prev) => prev.filter((item) => item.id !== requestId));
      if (action === "APPROVED" && request) {
        setCourses((prev) =>
          prev.filter((course) => course.id !== request.course.id),
        );
      }
      toast.success(
        action === "APPROVED"
          ? "Delete request approved"
          : "Delete request rejected",
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setResolvingRequest(null);
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
      setConfirmPopularRemoval(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setTogglingPopular(null);
    }
  };

  const myCourses = courses.filter((course) => course.createdBy.id === user?.id);
  const coursesByOthers = courses.filter(
    (course) => course.createdBy.id !== user?.id,
  );
  const visibleCourses = isAdmin
    ? courses
    : tutorCourseTab === "mine"
      ? myCourses
      : coursesByOthers;
  const visibleCourseCount = visibleCourses.length;
  const canEditCourse = (course: Course) =>
    isAdmin || course.tutorId === user?.id;
  const canRequestDelete = (course: Course) =>
    !isAdmin && course.tutorId === user?.id;
  const hasPendingDeleteRequest = (course: Course) =>
    course.deleteRequests?.some(
      (request) =>
        request.status === "PENDING" && request.requesterId === user?.id,
    ) ?? false;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <BookOpen className="h-6 w-6 text-[#611f69] dark:text-[#c084fc]" />
            {isAdmin ? "Manage Courses" : "My Courses"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {visibleCourseCount} course{visibleCourseCount !== 1 ? "s" : ""}
            {isAdmin && " Â· Toggle popular for the homepage section"}
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            if (!isAdmin) setTutorCourseTab("mine");
            setShowForm(true);
          }}
          className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Course
        </Button>
      </div>

      {!isAdmin && (
        <div className="mb-5 inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
          {[
            { key: "mine", label: "My Courses", count: myCourses.length },
            {
              key: "others",
              label: "Courses by Others",
              count: coursesByOthers.length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTutorCourseTab(tab.key as "mine" | "others")}
              className={`rounded-md px-4 py-2 text-xs font-medium transition-colors ${
                tutorCourseTab === tab.key
                  ? "bg-[#611f69] text-white dark:bg-[#c084fc] dark:text-black"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      )}

      {isAdmin && deleteRequests.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/20">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                Pending Course Delete Requests
              </h2>
              <p className="text-xs text-amber-700 dark:text-amber-200">
                Review tutor requests before removing courses from the platform.
              </p>
            </div>
            <Badge variant="warning">{deleteRequests.length} pending</Badge>
          </div>
          <div className="space-y-2">
            {deleteRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm dark:bg-gray-900"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {request.course.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    Requested by {request.requester.name} Â· Instructor:{" "}
                    {request.course.tutor?.name || "Not assigned"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={resolvingRequest === request.id}
                    onClick={() =>
                      handleResolveDeleteRequest(request.id, "REJECTED")
                    }
                    className="h-8 text-xs"
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={resolvingRequest === request.id}
                    onClick={() =>
                      handleResolveDeleteRequest(request.id, "APPROVED")
                    }
                    className="h-8 text-xs"
                  >
                    Approve Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl border border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : visibleCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">
            {isAdmin || tutorCourseTab === "mine"
              ? "No courses yet. Create your first one."
              : "No courses have been assigned by others yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCourses.map((course, i) => (
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
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                    Created by {course.createdBy.name}
                    {course.createdBy.id !== user?.id && " · assigned to you"}
                  </p>
                )}
                {isAdmin && (
                  <p className="mt-2 text-xs text-gray-400">
                    Instructor: {course.tutor?.name || "Not assigned"}
                  </p>
                )}
                {!isAdmin && (
                  <p className="mt-1 text-xs text-gray-400">
                    Instructor: {course.tutor?.name || "Not assigned"}
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
                      onClick={() => {
                        if (course.isPopular) {
                          setConfirmPopularRemoval(course);
                          return;
                        }
                        handleTogglePopular(course);
                      }}
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
                  {hasPendingDeleteRequest(course) && (
                    <Badge variant="warning" className="text-xs">
                      Delete pending
                    </Badge>
                  )}
                  {canEditCourse(course) && (
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
                          tutorId: course.tutor?.id || course.tutorId || "",
                        });
                        setShowForm(true);
                      }}
                      className="rounded-md p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {(isAdmin || canRequestDelete(course)) && (
                    <button
                      type="button"
                      title={
                        isAdmin
                          ? "Delete course"
                          : "Request admin approval to delete"
                      }
                      disabled={
                        deleting === course.id || hasPendingDeleteRequest(course)
                      }
                      onClick={() => setConfirmDelete(course)}
                      className="rounded-md p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
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
            {isAdmin && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Instructor *
                </label>
                <select
                  title="Course instructor"
                  value={form.tutorId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tutorId: e.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select tutor</option>
                  {tutors.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.name} - {tutor.email}
                    </option>
                  ))}
                </select>
                {tutors.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    No active tutors found. Approve or create a tutor first.
                  </p>
                )}
              </div>
            )}
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
              disabled={
                saving ||
                !form.title.trim() ||
                !form.categoryId ||
                (isAdmin && !form.tutorId)
              }
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
            {isAdmin ? (
              <>
                Delete <strong>{confirmDelete?.title}</strong>? This cannot be
                undone.
              </>
            ) : (
              <>
                Send a delete request for{" "}
                <strong>{confirmDelete?.title}</strong> to admin?
              </>
            )}
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
              {isAdmin ? "Delete" : "Request Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={!!confirmPopularRemoval}
        onOpenChange={(open) => !open && setConfirmPopularRemoval(null)}
        title="Remove from popular?"
        description={
          <>
            <strong>{confirmPopularRemoval?.title}</strong> will no longer
            appear in the homepage popular courses section.
          </>
        }
        confirmText="Remove"
        danger
        loading={
          !!confirmPopularRemoval &&
          togglingPopular === confirmPopularRemoval.id
        }
        onConfirm={() => {
          if (confirmPopularRemoval) handleTogglePopular(confirmPopularRemoval);
        }}
      />
    </div>
  );
}


