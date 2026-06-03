"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, FolderOpen, Search, UserRound } from "lucide-react";

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: "Tutor" | "Course" | "Category" | "User";
};

type SearchResponse = {
  tutors: SearchItem[];
  courses: SearchItem[];
  categories: SearchItem[];
  users: SearchItem[];
};

const emptyResults: SearchResponse = {
  tutors: [],
  courses: [],
  categories: [],
  users: [],
};

const iconByType = {
  Tutor: UserRound,
  Course: BookOpen,
  Category: FolderOpen,
  User: UserRound,
};

export default function GlobalSearch({ canSearchUsers = false }: { canSearchUsers?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse>(emptyResults);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(
    () => [
      ...(canSearchUsers ? [{ label: "Users", items: results.users }] : []),
      { label: "Tutors", items: results.tutors },
      { label: "Courses", items: results.courses },
      { label: "Categories", items: results.categories },
    ],
    [canSearchUsers, results],
  );
  const hasResults = groups.some((group) => group.items.length > 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults(emptyResults);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/search?q=${encodeURIComponent(trimmedQuery)}`,
          { credentials: "include", signal: controller.signal },
        );
        const data = await res.json();
        setResults({ ...emptyResults, ...(data.data ?? {}) });
        setOpen(true);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults(emptyResults);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={canSearchUsers ? "Search anything, users by email..." : "Search anything..."}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#611f69] focus:ring-2 focus:ring-[#611f69]/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          {loading ? (
            <div className="p-4 text-sm text-gray-500">Searching...</div>
          ) : hasResults ? (
            <div className="max-h-96 overflow-y-auto p-2">
              {groups.map((group) =>
                group.items.length > 0 ? (
                  <div key={group.label} className="py-1">
                    <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-400">
                      {group.label}
                    </p>
                    {group.items.map((item) => {
                      const Icon = iconByType[item.type];

                      return (
                        <Link
                          key={`${item.type}-${item.id}`}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#611f69]/10 text-[#611f69] dark:bg-[#c084fc]/15 dark:text-[#c084fc]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-gray-900 dark:text-white">
                              {item.title}
                            </span>
                            <span className="block truncate text-xs text-gray-500">
                              {item.subtitle}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null,
              )}
            </div>
          ) : (
            <div className="p-4 text-sm text-gray-500">No results found.</div>
          )}
        </div>
      )}
    </div>
  );
}
