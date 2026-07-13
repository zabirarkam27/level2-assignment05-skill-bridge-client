type SortDirection = "asc" | "desc";

export const compareValues = (
  first: string | number | boolean | Date | null | undefined,
  second: string | number | boolean | Date | null | undefined,
  direction: SortDirection,
) => {
  const order = direction === "asc" ? 1 : -1;
  const normalizedFirst = first instanceof Date ? first.getTime() : first ?? "";
  const normalizedSecond = second instanceof Date ? second.getTime() : second ?? "";

  if (typeof normalizedFirst === "number" && typeof normalizedSecond === "number") {
    return (normalizedFirst - normalizedSecond) * order;
  }

  return String(normalizedFirst).localeCompare(String(normalizedSecond)) * order;
};

export const paginateItems = <T>(items: T[], page: number, pageSize: number) => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};
