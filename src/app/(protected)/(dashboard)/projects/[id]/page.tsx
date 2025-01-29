"use client";

import { useRouter, useParams } from "next/navigation";
import { useProject } from "@/hooks/db/useProject";
import { useRequirements } from "@/hooks/db/useRequirements";
import { useRecentStore } from "@/lib/store/recentStore";
import { Requirement } from "@/types/entities";
import { ProjectView } from "@/components/private";

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const addRecentItem = useRecentStore((state) => state.addRecentItem);

  const { project, isLoading: projectLoading } = useProject(projectId);
  const { requirements, isLoading: requirementsLoading } =
    useRequirements(projectId);

  const handleRequirementClick = (requirement: Requirement) => {
    addRecentItem(requirement.id, requirement.title, "requirement");
  };

  const handleGoToPage = (requirement: Requirement) => {
    router.push(`/projects/requirements/${requirement.id}`);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <ProjectView
        project={project || null}
        requirements={requirements || []}
        isLoading={projectLoading || requirementsLoading}
        onRequirementClick={handleRequirementClick}
        handleGoToPage={handleGoToPage}
      />
    </div>
  );
}
