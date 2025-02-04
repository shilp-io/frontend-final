"use client";

import * as React from "react";
import { useState } from "react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { motion, LayoutGroup } from "framer-motion";
import { Filter } from "lucide-react";
import { useAppStore } from "@/lib/store/appStore"; // Import useAppStore
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidePanel } from "@/components/private/skeleton/panels/SidePanel";
import type { Project, Requirement, Collection, ExternalDoc } from "@/types";
import { transitionConfig } from "@/lib/animations";
import { cn } from "@/lib/utils";

export type SupportedDataTypes =
  | Project
  | Requirement
  | Collection
  | ExternalDoc;

interface Column<T extends SupportedDataTypes> {
  header: string;
  width?: number;
  accessor: (item: T) => string;
  renderCell?: (item: T) => React.ReactNode;
  isSortable?: boolean;
}

interface MonospaceTableProps<T extends SupportedDataTypes> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  handleGoToPage?: (item: T) => void;
  renderDetails?: (item: T) => React.ReactNode;
  onItemDelete?: (item: T) => void;
  viewMode?: "split" | "full";
  isLoading?: boolean;
  emptyMessage?: string;
  showFilter?: boolean;
  filterComponent?: React.ReactNode;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "border-green-500 text-green-500";
    case "active":
    case "approved":
    case "in_progress":
      return "border-blue-500 text-blue-500";
    case "on_hold":
    case "pending_review":
      return "border-yellow-500 text-yellow-500";
    case "archived":
    case "rejected":
      return "border-red-500 text-red-500";
    case "draft":
      return "border-gray-500 text-gray-500";
    default:
      return "border-muted text-muted-foreground";
  }
};

const priorities = ["critical", "high", "medium", "low"]; // Define priorities

export function TestTable<T extends SupportedDataTypes>({
  data,
  columns,
  onRowClick,
  handleGoToPage,
  renderDetails,
  onItemDelete,
  viewMode = "full",
  isLoading = false,
  emptyMessage = "No items found.",
  showFilter = true,
  filterComponent,
}: MonospaceTableProps<T>) {
  const [sortKey, setSortKey] = React.useState<number>(0);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [selectedItem, setSelectedItem] = React.useState<T | null>(null);
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState<string>("");
  const [editingPriorityId, setEditingPriorityId] = React.useState<string | null>(null);
  const [editingPriorityValue, setEditingPriorityValue] = React.useState<string>("");
  const isEditable = useAppStore((state) => state.isEditable); // Get isEditable from app store

  const sortedData = React.useMemo(() => {
    if (isLoading) return [];

    return [...data].sort((a, b) => {
      if (!columns[sortKey].isSortable) return 0;
      const aValue = columns[sortKey].accessor(a);
      const bValue = columns[sortKey].accessor(b);
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder, columns, isLoading]);

  const toggleSort = (index: number) => {
    if (!columns[index].isSortable) return;
    if (index === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(index);
      setSortOrder("asc");
    }
  };

  const handleRowClick = (item: T) => {
    if (isEditable) return; // Do nothing if in edit mode
    if (onRowClick) {
      onRowClick(item);
    }
    if (renderDetails) {
      setSelectedItem(item);
    }
  };

  const handleDoubleClick = (item: T, colIndex: number) => {
    if (!isEditable) return;
    if (colIndex === 0) {
      setEditingItemId(item.id);
      setEditingValue(columns[0].accessor(item)); // Assuming the title is in the first column
    } else if (columns[colIndex].header.toLowerCase() === "priority") {
      setEditingPriorityId(item.id);
      setEditingPriorityValue(columns[colIndex].accessor(item));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditingPriorityValue(e.target.value);
  };

  const handleInputBlur = () => {
    // Save the new title here
    console.log("Current Title: ", editingValue);
    setEditingItemId(null);
  };

  const handleSelectBlur = () => {
    // Save the new priority here
    console.log("Current Priority: ", editingPriorityValue);
    setEditingPriorityId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded-lg" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <LayoutGroup>
      <motion.div
        className={cn("relative space-y-4 pt-4")}
        layout
        transition={transitionConfig}
      >
        {showFilter && (
          <div className="bg-background border border-border rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-4">
              {filterComponent || (
                <Button
                  variant="outline"
                  size="sm"
                  className="inline-flex items-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="relative overflow-hidden font-mono border rounded-lg p-4">
          {sortedData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead
                      key={column.header}
                      style={{
                        width: column.width ? `${column.width}px` : undefined,
                      }}
                    >
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort(index)}
                        className={`h-8 text-left font-medium ${column.isSortable ? "hover:bg-accent hover:text-accent-foreground cursor-pointer" : "cursor-default"}`}
                        disabled={!column.isSortable}
                      >
                        {column.header}
                        {column.isSortable && (
                          <CaretSortIcon className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item, index) => (
                  <TableRow
                    key={index}
                    className={`font-mono ${onRowClick || renderDetails ? "cursor-pointer hover:bg-accent" : ""}`}
                    onClick={() => handleRowClick(item)}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell
                        key={`${index}-${colIndex}`}
                        onDoubleClick={() => handleDoubleClick(item, colIndex)}
                      >
                        {editingItemId === item.id && colIndex === 0 ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            autoFocus
                            className="w-full bg-transparent border-b border-dashed border-gray-400 focus:outline-none"
                          />
                        ) : editingPriorityId === item.id && column.header.toLowerCase() === "priority" ? (
                          <select
                            value={editingPriorityValue}
                            onChange={handleSelectChange}
                            onBlur={handleSelectBlur}
                            autoFocus
                            className="w-full bg-transparent border-b border-dashed border-gray-400 focus:outline-none"
                          >
                            {priorities.map((priority) => (
                              <option key={priority} value={priority}>
                                {priority}
                              </option>
                            ))}
                          </select>
                        ) : column.renderCell ? (
                          column.renderCell(item)
                        ) : column.header.toLowerCase().includes("status") ? (
                          <Badge
                            variant="outline"
                            className={getStatusColor(column.accessor(item))}
                          >
                            {column.accessor(item)}
                          </Badge>
                        ) : (
                          column.accessor(item)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </motion.div>

      {renderDetails && viewMode === "split" && (
        <SidePanel
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onNavigate={
            selectedItem ? () => handleGoToPage?.(selectedItem) : undefined
          }
          showNavigateButton={!!handleGoToPage}
          showEditButton={!!onItemDelete}
          onOptionSelect={(option) => {
            if (option === "delete" && selectedItem) {
              onItemDelete?.(selectedItem);
              setSelectedItem(null);
            }
          }}
        >
          {selectedItem && renderDetails(selectedItem)}
        </SidePanel>
      )}
    </LayoutGroup>
  );
}
