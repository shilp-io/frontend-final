"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useRequirementStore } from "@/lib/store/requirementStore";
import { useRecentStore } from "@/lib/store/recentStore";
import { useRequirements } from "@/hooks/db/useRequirements";
import { useUserStore } from "@/lib/store/userStore";
import type { Requirement } from "@/types";
import type { Column } from "@/components/private";
import { useRouter } from "next/navigation";
import {
  CreatePanel,
  RequirementItem,
  RequirementPanel,
  TableManager,
} from "@/components/private";

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "border-green-500 text-green-500";
    case "in_progress":
      return "border-blue-500 text-blue-500";
    case "testing":
      return "border-purple-500 text-purple-500";
    case "pending_review":
      return "border-yellow-500 text-yellow-500";
    case "rejected":
      return "border-red-500 text-red-500";
    case "approved":
      return "border-emerald-500 text-emerald-500";
    default:
      return "border-muted text-muted-foreground";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "critical":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    case "high":
      return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
    case "medium":
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    case "low":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function RequirementsPage() {
  const { selectRequirement } = useRequirementStore();
  const { addRecentItem } = useRecentStore();
  const { user } = useUserStore();
  const { requirements, isLoading } = useRequirements(undefined, user?.id);
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const router = useRouter();

  const handleRequirementSelect = async (requirement: Requirement) => {
    selectRequirement(requirement.id);
    addRecentItem(requirement.id, requirement.title, "requirement");
  };

  const handleGoToPage = (requirement: Requirement) => {
    router.push(`/projects/requirements/${requirement.id}`);
  };

  const columns: Column<Requirement>[] = [
    {
      header: "Title",
      accessor: (requirement: Requirement) => requirement.title,
      width: 30,
      isSortable: true,
    },
    {
      header: "Description",
      accessor: (requirement: Requirement) => requirement.description || "",
      width: 40,
      isSortable: true,
    },
    {
      header: "Status",
      accessor: (requirement: Requirement) => requirement.status,
      width: 15,
      renderCell: (requirement: Requirement) => (
        <Badge variant="outline" className={getStatusColor(requirement.status)}>
          {requirement.status}
        </Badge>
      ),
      isSortable: true,
    },
    {
      header: "Priority",
      accessor: (requirement: Requirement) => requirement.priority,
      width: 15,
      renderCell: (requirement: Requirement) => (
        <Badge className={getPriorityColor(requirement.priority)}>
          {requirement.priority}
        </Badge>
      ),
      isSortable: true,
    },
    {
      header: "Assigned To",
      accessor: (requirement: Requirement) =>
        requirement.assigned_to || "Unassigned",
      width: 20,
      isSortable: true,
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground p-4">
      <div className="container mx-auto">
        <TableManager
          title="Requirements"
          description="Manage and organize your project requirements"
          data={requirements}
          isLoading={isLoading}
          columns={columns}
          onItemSelect={handleRequirementSelect}
          handleGoToPage={handleGoToPage}
          onNewItem={() => setIsCreatePanelOpen(true)}
          renderGridItem={(requirement) => (
            <RequirementItem requirement={requirement} />
          )}
          renderDetails={(requirement) => (
            <RequirementPanel requirement={requirement} />
          )}
          newItemLabel="New Requirement"
          searchPlaceholder="Search requirements..."
          emptyMessage="No requirements found. Create a new requirement to get started."
        />
        <CreatePanel
          isOpen={isCreatePanelOpen}
          onClose={() => setIsCreatePanelOpen(false)}
          initialTab="requirement"
          showTabs="requirement"
        />
      </div>
    </div>
  );
}
