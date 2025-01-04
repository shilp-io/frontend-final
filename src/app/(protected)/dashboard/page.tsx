'use client';

import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/db/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils/dateUtils';
import { AsciiTable } from '@/components/private/AsciiTable';
import { Project } from '@/types/entities';

export default function DashboardPage() {
  const router = useRouter();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { loading: authLoading } = useAuth();
  const projectList = Object.values(projects);

  const handleProjectClick = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  const columns = [
    {
      header: 'Project Name',
      width: 38,
      accessor: (project: Project) => project.name,
    },
    {
      header: 'Status',
      width: 10,
      accessor: (project: Project) => project.status,
    },
    {
      header: 'Start',
      width: 10,
      accessor: (project: Project) => formatDate(project.start_date) || '-',
    },
    {
      header: 'Target',
      width: 10,
      accessor: (project: Project) => formatDate(project.target_end_date) || '-',
    },
  ];

  if (authLoading) {
    return <AsciiTable data={[]} columns={columns} isLoading={true} />;
  }

  return (
    <AsciiTable
      data={projectList}
      columns={columns}
      onRowClick={handleProjectClick}
      isLoading={projectsLoading}
      emptyMessage="No projects found."
    />
  );
}