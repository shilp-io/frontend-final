import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  width: number;
  accessor: (item: T) => string;
}

interface AsciiTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  error?: Error;
  emptyMessage?: string;
}

const ASCII_STYLES = {
  container: 'font-mono whitespace-pre overflow-x-auto p-4 text-sm',
  header: 'border-b border-gray-300 mb-2',
  row: 'hover:bg-gray-100 cursor-pointer transition-colors',
};

export function AsciiTable<T>({
  data,
  columns,
  onRowClick,
  isLoading,
  error,
  emptyMessage = 'No data found.',
}: AsciiTableProps<T>) {
  if (isLoading) {
    return <div className={ASCII_STYLES.container}>Loading...</div>;
  }

  if (error) {
    return <div className={ASCII_STYLES.container}>Error: {error.message}</div>;
  }

  if (!data.length) {
    return <div className={ASCII_STYLES.container}>{emptyMessage}</div>;
  }

  // Helper function to pad content and ensure consistent width
  const padContent = (content: string, width: number) => {
    const truncated = content.slice(0, width);
    return truncated.padEnd(width, ' ');
  };

  // Create border segments
  const createBorder = (start: string, mid: string, end: string, sep: string) => {
    return start + columns.map(col => mid.repeat(col.width + 2)).join(sep) + end;
  };

  // Create a row with proper padding
  const createRow = (cells: string[]) => {
    return '│ ' + cells.map((cell, i) => padContent(cell, columns[i].width)).join(' │ ') + ' │';
  };

  // Border components
  const topBorder = createBorder('┌', '─', '┐', '┬');
  const headerSeparator = createBorder('├', '─', '┤', '┼');
  const bottomBorder = createBorder('└', '─', '┘', '┴');
  const rowSeparator = createBorder('├', '─', '┤', '┼');

  return (
    <div className={ASCII_STYLES.container}>
      {topBorder + '\n'}
      {createRow(columns.map(col => col.header)) + '\n'}
      {headerSeparator + '\n'}
      {data.map((item, index) => (
        <div
          key={index}
          className={onRowClick ? ASCII_STYLES.row : undefined}
          onClick={() => onRowClick?.(item)}
        >
          {createRow(columns.map(col => col.accessor(item)))}
          {'\n'}
          {index < data.length - 1 ? rowSeparator + '\n' : bottomBorder}
        </div>
      ))}
    </div>
  );
}