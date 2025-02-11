"use client";

import * as React from "react";
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
import { RequirementStatusArray } from "@/types/enums";
import { RequirementPriorityArray } from "@/types/enums";

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
      return "border-blue-500 text-blue-500";
    case "approved":
      return "border-emerald-500 text-emerald-500";
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical":
      return "border-red-500/10 text-red-500";
    case "high":
      return "border-orange-500/10 text-orange-500";
    case "medium":
      return "border-yellow-500/10 text-yellow-500";
    case "low":
      return "border-green-500/10 text-green-500";
    default:
      return "border-muted text-muted-foreground";
  }
};

const getDescriptionRows = (description: string) => {
  return description.split("\n").length;
};

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
  const [mockData, setMockData] = React.useState<T[]>(data);
  const [sortKey, setSortKey] = React.useState<number>(0);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [selectedItem, setSelectedItem] = React.useState<T | null>(null);
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
  const [editingTitleValue, setEditingValue] = React.useState<string>("");
  const [editingPriorityId, setEditingPriorityId] = React.useState<
    string | null
  >(null);
  const [editingPriorityValue, setEditingPriorityValue] =
    React.useState<string>("");
  const [editingStatusId, setEditingStatusId] = React.useState<string | null>(
    null,
  );
  const [editingStatusValue, setEditingStatusValue] =
    React.useState<string>("");
  const [editingDescriptionId, setEditingDescriptionId] = React.useState<
    string | null
  >(null);
  const [editingDescriptionValue, setEditingDescriptionValue] =
    React.useState<string>("");
  const [editingAssignedToId, setEditingAssignedToId] = React.useState<
    string | null
  >(null);
  const [editingAssignedToValue, setEditingAssignedToValue] =
    React.useState<string>("");
  const isEditable = useAppStore((state) => state.isEditable);

  const sortedData = React.useMemo(() => {
    if (isLoading) return [];

    return [...mockData].sort((a, b) => {
      if (!columns[sortKey].isSortable) return 0;
      const aValue = columns[sortKey].accessor(a);
      const bValue = columns[sortKey].accessor(b);
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [mockData, sortKey, sortOrder, columns, isLoading]);

  const toggleSort = (index: number) => {
    if (!columns[index].isSortable) return;
    if (index === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(index);
      setSortOrder("asc");
    }
  };

  // Row click for Requirement Side Panel
  const handleRowClick = (item: T) => {
    if (isEditable) return;
    if (onRowClick) {
      onRowClick(item);
    }
    if (renderDetails) {
      setSelectedItem(item);
    }
  };

  // Double click handlers
  const handleDoubleClick = (item: T, colIndex: number) => {
    if (!isEditable) return;
    if (columns[colIndex].header.toLowerCase() === "title") {
      setEditingItemId(item.id);
      setEditingValue(columns[colIndex].accessor(item));
    } else if (columns[colIndex].header.toLowerCase() === "priority") {
      setEditingPriorityId(item.id);
      setEditingPriorityValue(columns[colIndex].accessor(item));
    } else if (columns[colIndex].header.toLowerCase() === "status") {
      setEditingStatusId(item.id);
      setEditingStatusValue(columns[colIndex].accessor(item));
    } else if (columns[colIndex].header.toLowerCase() === "description") {
      setEditingDescriptionId(item.id);
      setEditingDescriptionValue(columns[colIndex].accessor(item));
    } else if (columns[colIndex].header.toLowerCase() === "assigned to") {
      setEditingAssignedToId(item.id);
      setEditingAssignedToValue(columns[colIndex].accessor(item));
    }
  };

  // Input change handlers

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditingPriorityValue(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditingStatusValue(e.target.value);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setEditingDescriptionValue(e.target.value);
  };

  const handleAssignedToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingAssignedToValue(e.target.value);
  };

  // Input blur handlers ** UPDATE THESE TO EDIT DATABASE **

  const handleTitleBlur = () => {
    setMockData((prevData) =>
      prevData.map((item) =>
        item.id === editingItemId
          ? { ...item, title: editingTitleValue }
          : item,
      ),
    );
    setEditingItemId(null);
  };

  const handlePriorityBlur = () => {
    setMockData((prevData) =>
      prevData.map((item) =>
        item.id === editingPriorityId
          ? { ...item, priority: editingPriorityValue }
          : item,
      ),
    );
    setEditingPriorityId(null);
  };

  const handleStatusBlur = () => {
    setMockData((prevData) =>
      prevData.map((item) =>
        item.id === editingStatusId
          ? { ...item, status: editingStatusValue }
          : item,
      ),
    );
    setEditingStatusId(null);
  };

  const handleDescriptionBlur = () => {
    setMockData((prevData) =>
      prevData.map((item) =>
        item.id === editingDescriptionId
          ? { ...item, description: editingDescriptionValue }
          : item,
      ),
    );
    setEditingDescriptionId(null);
  };

  const handleAssignedToBlur = () => {
    console.log(editingAssignedToValue);
    setMockData((prevData) =>
      prevData.map((item) =>
        item.id === editingAssignedToId
          ? { ...item, assigned_to: editingAssignedToValue }
          : item,
      ),
    );
    setEditingAssignedToId(null);
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
                    className={`font-mono ${onRowClick || renderDetails ? "cursor-pointer hover:gray" : ""}`}
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
                            value={editingTitleValue}
                            onChange={handleInputChange}
                            onBlur={handleTitleBlur}
                            autoFocus
                            className="w-full bg-transparent border-b border-dashed border-gray-400 focus:outline-none"
                          />
                        ) : editingPriorityId === item.id &&
                          column.header.toLowerCase() === "priority" ? (
                          <select
                            value={editingPriorityValue}
                            onChange={handleSelectChange}
                            onBlur={handlePriorityBlur}
                            autoFocus
                            className={`w-full bg-black border-b border-dashed border-gray-400 focus:outline-none ${getPriorityColor(editingPriorityValue)}`}
                          >
                            {RequirementPriorityArray.map((priority) => (
                              <option
                                key={priority}
                                value={priority}
                                className={getPriorityColor(priority)}
                              >
                                {priority}
                              </option>
                            ))}
                          </select>
                        ) : editingStatusId === item.id &&
                          column.header.toLowerCase() === "status" ? (
                          <select
                            value={editingStatusValue}
                            onChange={handleStatusChange}
                            onBlur={handleStatusBlur}
                            autoFocus
                            className={`w-full bg-black border-b border-dashed border-gray-400 focus:outline-none ${getStatusColor(editingStatusValue)}`}
                          >
                            {RequirementStatusArray.map((status) => (
                              <option
                                key={status}
                                value={status}
                                className={getStatusColor(status)}
                              >
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : editingDescriptionId === item.id &&
                          column.header.toLowerCase() === "description" ? (
                          <textarea
                            value={editingDescriptionValue}
                            onChange={handleDescriptionChange}
                            onBlur={handleDescriptionBlur}
                            autoFocus
                            className="w-full bg-transparent border-b border-dashed border-gray-400 focus:outline-none resize-none overflow-hidden"
                            rows={getDescriptionRows(editingDescriptionValue)}
                          />
                        ) : editingAssignedToId === item.id &&
                          column.header.toLowerCase() === "assigned to" ? (
                          <input
                            type="text"
                            value={editingAssignedToValue}
                            onChange={handleAssignedToChange}
                            onBlur={handleAssignedToBlur}
                            autoFocus
                            className="w-full bg-transparent border-b border-dashed border-gray-400 focus:outline-none"
                          />
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
