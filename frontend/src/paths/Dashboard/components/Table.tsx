

export type Column<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
};

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: keyof T) => void;
  sortKey?: keyof T;
  sortOrder?: "asc" | "desc";
}

function Table<T>({
  columns,
  data,
  onSort,
  sortKey,
  sortOrder,
}: TableProps<T>) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-200">
          {columns.map((column) => (
            <th
              key={String(column.key)}
              className="p-4 text-left cursor-pointer"
              onClick={() => column.sortable && onSort && onSort(column.key)}
            >
              {column.label}
              {column.sortable && sortKey === column.key && (
                <span className="ml-2">
                  {sortOrder === "asc" ? "▲" : "▼"}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} className="odd:bg-white even:bg-gray-50">
            {columns.map((column) => (
              <td key={String(column.key)} className="p-4">
                {row[column.key] as any}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
