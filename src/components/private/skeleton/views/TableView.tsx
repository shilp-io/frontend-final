import React from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { MonospaceTable, MonospaceGrid, AsciiTable } from '@/components/private';
import type { Project, Requirement, Collection, ExternalDoc } from '@/types';

export type SupportedDataTypes = Project | Requirement | Collection | ExternalDoc;

export interface Column<T extends SupportedDataTypes = SupportedDataTypes> {
  header: string;
  width: number;
  accessor: (item: T) => string;
  renderCell?: (item: T) => React.ReactNode;
  isSortable?: boolean;
}

export interface TableViewProps<T extends SupportedDataTypes = SupportedDataTypes> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  handleGoToPage?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  gridItemRender?: (item: T) => React.ReactNode;
  renderDetails?: (item: T) => React.ReactNode;
  onItemDelete?: (item: T) => void;
  viewMode?: 'split' | 'full';
}

function TableView<T extends SupportedDataTypes>({
  data,
  columns,
  onRowClick,
  handleGoToPage,
  isLoading,
  emptyMessage = 'No items found.',
  gridItemRender,
  renderDetails,
  onItemDelete,
  viewMode = 'full'
}: TableViewProps<T>) {
  const { viewMode: appViewMode } = useAppStore();

  const asciiColumns = React.useMemo(() => 
    columns.map(col => ({
      ...col,
      width: col.width || 20
    })), [columns]);

  if (isLoading) {
    return appViewMode === 'ascii' ? (
      <AsciiTable data={[]} columns={asciiColumns} isLoading={true} />
    ) : (
      <div className="animate-pulse">Loading...</div>
    );
  }

  if (data.length === 0) {
    return appViewMode === 'ascii' ? (
      <AsciiTable
        data={[]}
        columns={asciiColumns}
        emptyMessage={emptyMessage}
      />
    ) : (
      <div className="text-center text-gray-500 dark:text-dark-text-secondary py-8">
        {emptyMessage}
      </div>
    );
  }

  if (appViewMode === 'ascii') {
    return (
      <AsciiTable
        data={data}
        columns={asciiColumns}
        onRowClick={onRowClick}
        handleGoToPage={handleGoToPage}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
      />
    );
  }

  if (appViewMode === 'compact') {
    return (
      <MonospaceGrid
        data={data}
        columns={columns}
        onRowClick={onRowClick}
        handleGoToPage={handleGoToPage}
        gridItemRender={gridItemRender}
        renderDetails={renderDetails}
        onItemDelete={onItemDelete}
        viewMode={viewMode}
      />
    );
  }

  // Normal view (default)
  return (
    <MonospaceTable
      data={data}
      columns={columns}
      onRowClick={onRowClick}
      handleGoToPage={handleGoToPage}
      renderDetails={renderDetails}
      onItemDelete={onItemDelete}
      viewMode={viewMode}
    />
  );
}

export default TableView;