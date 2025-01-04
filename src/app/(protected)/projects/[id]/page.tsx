'use client';

import { useRouter, useParams } from 'next/navigation';
import { formatDate } from '@/lib/utils/dateUtils';
import { useProject } from '@/hooks/db/useProject';
import { useRequirements } from '@/hooks/db/useRequirements';
import { AsciiTable } from '@/components/private/AsciiTable';
import { Requirement } from '@/types/entities';

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const { project, isLoading: projectLoading } = useProject(projectId);
  const { requirements, isLoading: requirementsLoading, error } = useRequirements(projectId);

  const handleRequirementClick = (requirement: Requirement) => {
    router.push(`/projects/requirements/${requirement.id}`);
  };

  const columns = [
    {
      header: 'Title',
      width: 38,
      accessor: (req: Requirement) => req.title,
    },
    {
      header: 'Status',
      width: 10,
      accessor: (req: Requirement) => req.status,
    },
    {
      header: 'Priority',
      width: 10,
      accessor: (req: Requirement) => req.priority,
    },
    {
      header: 'Updated',
      width: 10,
      accessor: (req: Requirement) => formatDate(req.updated_at) || '-',
    },
  ];

  if (!project) {
    return <AsciiTable data={[]} columns={columns} emptyMessage="Project not found." />;
  }

  return (
    <AsciiTable
      data={requirements}
      columns={columns}
      onRowClick={handleRequirementClick}
      isLoading={projectLoading || requirementsLoading}
      error={error || undefined}
      emptyMessage="No requirements found."
    />
  );
} 