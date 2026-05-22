"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types/routes.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FolderOpen,
  Plus,
  Trash2,
  X,
  Check,
  Pencil,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { uploadOptimizedImage } from "@/lib/upload-image";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [deleting, setDeleting] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      image: "",
    });

    setEditingCategory(null);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories?dashboard=${Date.now()}`,
        { cache: "no-store", credentials: "include" },
      );

      const data = await res.json();

      setCategories(Array.isArray(data.data) ? data.data : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;

    setSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create category");
      }

      const data = await res.json();

      toast.success("Category created!");
      if (data.data) {
        setCategories((prev) => [data.data, ...prev]);
      }

      resetForm();

      setShowForm(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create category",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory || !form.name.trim()) return;

    setSaving(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${editingCategory.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update category");
      }

      const data = await res.json();

      toast.success("Category updated!");
      if (data.data) {
        setCategories((prev) =>
          prev.map((cat) => (cat.id === data.data.id ? data.data : cat)),
        );
      }

      resetForm();

      setShowForm(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update category",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((cat) => cat.id !== id));

      toast.success("Category deleted");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category",
      );
    } finally {
      setDeleting(null);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);

    try {
      const result = await uploadOptimizedImage(file, "category");
      setForm((f) => ({ ...f, image: result.url }));
      toast.success(`Image optimized (${result.format.toUpperCase()})`);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-[#611f69] dark:text-[#c084fc]" />
            Manage Categories
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {categories.length} course categories · used when creating courses
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 h-40 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm"
            >
              {cat.image && (
                <div className="relative h-32 w-full">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  <div className="absolute inset-0 bg-black/20" />
                </div>
              )}

              <div className="p-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {cat.name}
                  </h3>

                  {cat.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* Edit */}
                  <button
                    type="button"
                    title="Edit category"
                    aria-label="Edit category"
                    onClick={() => {
                      setEditingCategory(cat);

                      setForm({
                        name: cat.name || "",
                        description: cat.description || "",
                        image: cat.image || "",
                      });

                      setShowForm(true);
                    }}
                    className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Pencil className="w-4 h-4 hover:cursor-pointer" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    title="Delete category"
                    aria-label="Delete category"
                    onClick={() => setConfirmDelete(cat)}
                    disabled={deleting === cat.id}
                    className="p-1.5 rounded-md text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 hover:cursor-pointer" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Update Dialog */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);

          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Update Category" : "Create New Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name *</label>

              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g. Mathematics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Description
              </label>

              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Upload Image (optional)
              </label>

              <input
                type="file"
                accept="image/*"
                title="Upload category image"
                disabled={uploadingImage}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  await handleImageUpload(file);
                }}
                className="block w-full text-sm"
              />
              {uploadingImage && (
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Optimizing and uploading image...
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Image URL
              </label>

              <Input
                value={form.image}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    image: e.target.value,
                  }))
                }
                placeholder="https://..."
              />
              {form.image && (
                <div className="relative mt-3 h-28 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <Image
                    src={form.image}
                    alt="Category preview"
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>

            <Button
              onClick={editingCategory ? handleUpdate : handleCreate}
              disabled={saving || uploadingImage || !form.name.trim()}
              className="bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black"
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Optimizing...
                </>
              ) : saving ? (
                editingCategory ? (
                  "Updating..."
                ) : (
                  "Creating..."
                )
              ) : editingCategory ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Update
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Create
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-500">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-black dark:text-white">
              {confirmDelete?.name}
            </span>
            ?
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
