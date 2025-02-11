"use client";

import React, { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableView } from "@/components/private";
import { useAppStore } from "@/lib/store/appStore"; // Import useAppStore
import type { Column, SupportedDataTypes } from "./views/TableView";

interface TableManagerProps<T extends SupportedDataTypes> {
  title: string;
  description: string;
  data: T[];
  isLoading: boolean;
  columns: Column<T>[];
  onItemSelect: (item: T) => void;
  handleGoToPage: (item: T) => void;
  onNewItem?: () => void;
  onItemDelete?: (item: T) => void;
  renderGridItem: (item: T) => React.ReactNode;
  renderDetails: (item: T) => React.ReactNode;
  newItemLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

const TableManager = <T extends SupportedDataTypes>({
  title,
  description,
  data,
  isLoading,
  columns,
  onItemSelect,
  handleGoToPage,
  onNewItem,
  onItemDelete,
  renderGridItem,
  renderDetails,
  newItemLabel = "New Item",
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
}: TableManagerProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tableData] = useState(data); // Local state to manage table data
  const isEditable = useAppStore((state) => state.isEditable); // Get isEditable from app store
  const toggleEditable = useAppStore((state) => state.toggleEditable); // Get toggleEditable from app store

  // Function to handle adding a new requirement
  // TODO: Implement this function to add a new requirement
  const handleAddNewRequirement = async () => {
    //const { createRequirement } = useRequirements(projectId);
  };

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return tableData;
    const query = searchQuery.toLowerCase();
    return tableData.filter((item) => {
      const searchableFields = columns.map((col) => col.accessor(item));
      return searchableFields.some((field) =>
        field?.toLowerCase().includes(query),
      );
    });
  }, [tableData, searchQuery, columns]);

  return (
    <div className="w-full flex flex-col">
      {/* Fixed Header Section */}
      <div className="flex-none border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            </div>
            {onNewItem && (
              <div className="flex items-center gap-4">
                <Button
                  onClick={onNewItem}
                  className="inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {newItemLabel}
                </Button>
              </div>
            )}
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 rounded-md border bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button onClick={toggleEditable}>
              {isEditable ? "Disable Edit Mode" : "Enable Edit Mode"}
            </Button>
            {isEditable && (
              <Button
                onClick={handleAddNewRequirement}
                variant="outline"
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-grow overflow-auto">
        <div className="h-full">
          <TableView
            data={filteredItems}
            columns={columns}
            onRowClick={onItemSelect}
            handleGoToPage={handleGoToPage}
            isLoading={isLoading}
            emptyMessage={
              searchQuery ? `No items match your search.` : emptyMessage
            }
            gridItemRender={renderGridItem}
            renderDetails={renderDetails}
            onItemDelete={onItemDelete}
            viewMode="split"
          />
        </div>
      </div>
    </div>
  );
};

export default TableManager;
