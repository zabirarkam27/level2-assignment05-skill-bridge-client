"use client";

import { ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SortDirection = "asc" | "desc";

export type SortOption = {
  label: string;
  value: string;
};

type DataListControlsProps = {
  totalItems: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirection;
  sortOptions: SortOption[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortByChange: (sortBy: string) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
};

export function DataListControls({
  totalItems,
  page,
  pageSize,
  sortBy,
  sortDirection,
  sortOptions,
  onPageChange,
  onPageSizeChange,
  onSortByChange,
  onSortDirectionChange,
}: DataListControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, page * pageSize);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Showing {startItem}-{endItem} of {totalItems}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="dashboard-sort-by">
          Sort by
        </label>
        <select
          id="dashboard-sort-by"
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs"
          onClick={() =>
            onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")
          }
        >
          {sortDirection === "asc" ? (
            <ArrowUpAZ className="mr-1.5 h-4 w-4" />
          ) : (
            <ArrowDownAZ className="mr-1.5 h-4 w-4" />
          )}
          {sortDirection === "asc" ? "Asc" : "Desc"}
        </Button>

        <label className="sr-only" htmlFor="dashboard-page-size">
          Rows per page
        </label>
        <select
          id="dashboard-page-size"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}/page
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-16 text-center text-xs text-gray-500 dark:text-gray-400">
            {page}/{totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
