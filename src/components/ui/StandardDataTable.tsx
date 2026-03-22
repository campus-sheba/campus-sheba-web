import type { ReactNode } from "react";

export type StandardDataTableColumn<T> = {
  key: string;
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T) => ReactNode;
};

interface StandardDataTableProps<T> {
  columns: StandardDataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  rowClassName?: string;
}

export default function StandardDataTable<T>({
  columns,
  rows,
  getRowKey,
  rowClassName,
}: StandardDataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50/80">
          <tr className="text-left text-gray-600 border-b border-gray-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`py-3 px-4 text-xs font-semibold uppercase tracking-[0.06em] ${column.headerClassName || ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70 transition-colors ${rowClassName || ""}`}
            >
              {columns.map((column) => (
                <td key={column.key} className={`py-3.5 px-4 align-middle ${column.cellClassName || ""}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}