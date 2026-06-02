"use client";

import { MouseEvent, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type WishlistToggleProps = {
  type: "course" | "tutor";
  id: string;
  initialSaved?: boolean;
  count?: number;
  className?: string;
};

export default function WishlistToggle({
  type,
  id,
  initialSaved = false,
  count = 0,
  className,
}: WishlistToggleProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(count);

  const toggle = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (saving) return;

    setSaving(true);
    const nextSaved = !saved;
    setSaved(nextSaved);
    setSavedCount((current) => Math.max(0, current + (nextSaved ? 1 : -1)));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wishlist/${type}/${id}`,
        {
          method: nextSaved ? "POST" : "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Wishlist update failed");
      toast.success(
        nextSaved
          ? `${type === "course" ? "Course" : "Tutor"} saved`
          : `${type === "course" ? "Course" : "Tutor"} removed`,
      );
    } catch (error) {
      setSaved(!nextSaved);
      setSavedCount((current) => Math.max(0, current + (nextSaved ? -1 : 1)));
      toast.error(
        error instanceof Error
          ? error.message
          : "Please login as a student to use wishlist",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      onClick={toggle}
      disabled={saving}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-200",
        saved && "text-red-600 dark:text-red-400",
        className,
      )}
    >
      <Heart
        className={cn("h-3.5 w-3.5", saved && "fill-current")}
      />
      {savedCount}
    </button>
  );
}
