"use client";

import React, { useState } from "react";
import { useProjectStore } from "@/lib/store/projectStore";
import { useRequirementStore } from "@/lib/store/requirementStore";
import { useRecentStore } from "@/lib/store/recentStore";
import { useProjects } from "@/hooks/db/useProjects";
import type { Project } from "@/types";
import type { Column } from "@/components/private";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  ProjectItem,
  ProjectPanel,
  TableManager,
  CreatePanel,
} from "@/components/private";

import LayoutView from "@/components/private/skeleton/views/LayoutView";

const formatDate = (date: string | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "border-green-500 text-green-500";
    case "active":
      return "border-blue-500 text-blue-500";
    case "on_hold":
      return "border-yellow-500 text-yellow-500";
    case "archived":
      return "border-gray-500 text-gray-500";
    default:
      return "border-muted text-muted-foreground";
  }
};

export default function ProjectsPage() {
  const { selectProject } = useProjectStore();
  const { setActiveProject } = useRequirementStore();
  const { addRecentItem } = useRecentStore();
  const { projects, isLoading, deleteProject } = useProjects();
  const router = useRouter();
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);

  const handleProjectSelect = async (project: Project) => {
    selectProject(project.id);
    setActiveProject(project.id);
    addRecentItem(project.id, project.name, "project");
  };

  const handleProjectDelete = async (project: Project) => {
    await deleteProject(project.id);
  };

  const handleGoToPage = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  const onNewProject = () => {
    setIsCreatePanelOpen(true);
  };

  const columns: Column<Project>[] = [
    {
      header: "Project Name",
      accessor: (project: Project) => project.name,
      width: 30,
      isSortable: true,
    },
    {
      header: "Status",
      accessor: (project: Project) => project.status,
      width: 20,
      renderCell: (project: Project) => (
        <Badge variant="outline" className={getStatusColor(project.status)}>
          {project.status}
        </Badge>
      ),
      isSortable: true,
    },
    {
      header: "Timeline",
      accessor: (project: Project) =>
        `${formatDate(project.start_date)} - ${formatDate(project.target_end_date)}`,
      width: 40,
      isSortable: true,
    },
  ];

  return (
      <div className="flex min-h-screen w-full bg-background text-foreground p-4">
        <div className="container mx-auto">
        <LayoutView>
          <TableManager
            title="Projects"
            description="Manage and organize your projects"
            data={projects}
            isLoading={isLoading}
            columns={columns}
            onItemSelect={handleProjectSelect}
            handleGoToPage={handleGoToPage}
            onNewItem={onNewProject}
            onItemDelete={handleProjectDelete}
            renderGridItem={(project) => <ProjectItem project={project} />}
            renderDetails={(project) => <ProjectPanel project={project} />}
            newItemLabel="New Project"
            searchPlaceholder="Search projects..."
            emptyMessage="No projects found. Create a new project to get started."
          />
          <CreatePanel
            isOpen={isCreatePanelOpen}
            onClose={() => setIsCreatePanelOpen(false)}
            initialTab="project"
            showTabs="project"
          />
          </LayoutView>
        </div>
      </div>
  );
}
