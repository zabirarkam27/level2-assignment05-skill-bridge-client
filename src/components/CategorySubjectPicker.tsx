"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Category } from "@/types/routes.type";
import { Button } from "@/components/ui/button";
import ConfirmActionDialog from "@/components/ConfirmActionDialog";

type CategorySubjectPickerProps = {
  value: string[];
  onChange: (subjects: string[]) => void;
  label?: string;
};

export default function CategorySubjectPicker({
  value,
  onChange,
  label = "Subjects",
}: CategorySubjectPickerProps) {
  const selectId = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-select`;
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState("");
  const [subjectToRemove, setSubjectToRemove] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) {
          setCategories(Array.isArray(data.data) ? data.data : []);
        }
      })
      .catch(() => {
        if (!ignore) setCategories([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const availableCategories = useMemo(
    () => categories.filter((category) => !value.includes(category.name)),
    [categories, value],
  );

  const addSubject = () => {
    if (!selected) return;
    const category = categories.find((item) => item.id === selected);
    if (!category || value.includes(category.name)) return;
    onChange([...value, category.name]);
    setSelected("");
  };

  const removeSubject = (subject: string) => {
    onChange(value.filter((item) => item !== subject));
    setSubjectToRemove(null);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <select
          id={selectId}
          title={label}
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          disabled={loading || availableCategories.length === 0}
          className="h-10 min-w-0 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#611f69]/40 dark:focus:ring-[#c084fc]/40"
        >
          <option value="">
            {loading
              ? "Loading categories..."
              : availableCategories.length === 0
                ? "No categories available"
                : "Select a category"}
          </option>
          {availableCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          onClick={addSubject}
          disabled={!selected}
          size="sm"
          className="h-10 w-full bg-[#611f69] text-white hover:bg-[#4a174f] dark:bg-[#c084fc] dark:text-black sm:w-auto"
        >
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {value.map((subject) => (
          <span
            key={subject}
            className="flex items-center gap-1 rounded-full bg-[#611f69]/10 px-3 py-1 text-xs text-[#611f69] dark:bg-[#c084fc]/20 dark:text-[#e9d5ff]"
          >
            {subject}
            <button
              type="button"
              onClick={() => setSubjectToRemove(subject)}
              className="ml-1 hover:text-red-500"
              title="Remove subject"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <p className="text-xs text-gray-400">No subjects selected yet</p>
        )}
      </div>

      <ConfirmActionDialog
        open={!!subjectToRemove}
        onOpenChange={(open) => !open && setSubjectToRemove(null)}
        title="Remove subject?"
        description={
          <>
            Remove <strong>{subjectToRemove}</strong> from this mentor profile?
          </>
        }
        confirmText="Remove"
        danger
        onConfirm={() => {
          if (subjectToRemove) removeSubject(subjectToRemove);
        }}
      />
    </div>
  );
}
