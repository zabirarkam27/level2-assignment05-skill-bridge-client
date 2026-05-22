"use client";

import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import { Category } from "@/types/routes.type";
import { ALL_CATEGORIES_TAB_ID } from "@/hooks/useCategoryCourses";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: Category[];
  activeId: string;
  onChange: (id: string) => void;
  loading?: boolean;
}

function TabSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-11 w-28 shrink-0 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
        />
      ))}
    </>
  );
}

export function CategoryTabs({
  categories,
  activeId,
  onChange,
  loading = false,
}: CategoryTabsProps) {
  const tabs = [
    {
      id: ALL_CATEGORIES_TAB_ID,
      name: "All",
      image: null as string | null | undefined,
    },
    ...categories.map((c) => ({
      id: c.id,
      name: c.name,
      image: c.image,
    })),
  ];

  return (
    <div className="relative -mx-4 sm:mx-0">
      <div
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 sm:px-0 [scrollbar-width:thin]"
        role="tablist"
        aria-label="Course categories"
      >
        {loading ? (
          <TabSkeleton />
        ) : (
          tabs.map((tab) => {
            const isActive = activeId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(tab.id)}
                className={cn(
                  "relative flex shrink-0 snap-start items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "border-[#611f69] bg-[#611f69] text-white shadow-md dark:border-[#c084fc] dark:bg-[#c084fc] dark:text-black"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#611f69]/40 hover:bg-[#611f69]/5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-[#c084fc]/40",
                )}
              >
                {tab.id === ALL_CATEGORIES_TAB_ID ? (
                  <LayoutGrid className="h-4 w-4 shrink-0" />
                ) : tab.image ? (
                  <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10">
                    <Image
                      src={tab.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </span>
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#611f69]/15 text-[10px] font-bold text-[#611f69] dark:bg-[#c084fc]/20 dark:text-[#c084fc]">
                    {tab.name.charAt(0)}
                  </span>
                )}
                <span className="whitespace-nowrap">{tab.name}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
