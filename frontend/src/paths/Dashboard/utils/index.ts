import React, { useState } from "react";

export function useTable<T>(data: T[], pageSize: number) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      return sortOrder === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue > bValue
        ? -1
        : 1;
    });
    return sorted;
  }, [data, sortKey, sortOrder]);

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return {
    paginatedData,
    currentPage,
    totalPages: Math.ceil(data.length / pageSize),
    sortKey,
    sortOrder,
    handleSort,
    setCurrentPage,
  };
}
