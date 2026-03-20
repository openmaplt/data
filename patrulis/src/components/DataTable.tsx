import type React from 'react';

export interface Column<T> {
  header: string;
  key?: keyof T;
  cell?: (row: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  getRowClassName?: (row: T) => string;
  getRowKey?: (row: T) => string | number;
}
export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = 'Nėra duomenų',
  getRowClassName,
  getRowKey,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 text-sm font-normal">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className={`px-4 py-3 font-semibold text-slate-700 ${
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                } ${col.headerClassName || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-slate-500 italic"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={
                  getRowKey
                    ? getRowKey(row)
                    : ((row?.id as string | number | undefined) ?? idx)
                }
                className={`transition-colors ${getRowClassName ? getRowClassName(row) : 'bg-white hover:bg-slate-50'}`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-4 py-3 whitespace-nowrap ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                    } ${col.cellClassName || ''}`}
                  >
                    {col.cell
                      ? col.cell(row)
                      : (row[col.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
