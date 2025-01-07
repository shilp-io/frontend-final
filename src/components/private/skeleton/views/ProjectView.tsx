import { Project, Requirement } from '@/types/entities';
import { formatDate } from '@/lib/utils/dateUtils';
import { CreatePanel, TableManager } from '@/components/private';
import type { Column } from '@/components/private';
import { useState } from 'react';

interface ProjectViewProps {
  project: Project | null;
  requirements: Requirement[];
  isLoading?: boolean;
  onRequirementClick?: (requirement: Requirement) => void;
  handleGoToPage?: (requirement: Requirement) => void;
  onRequirementDelete?: (requirement: Requirement) => void;
}

export function ProjectView({
  project,
  requirements,
  isLoading,
  onRequirementClick,
  handleGoToPage,
  onRequirementDelete,
}: ProjectViewProps) {
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);

  if (!project) {
    return <div className="p-4 text-gray-500">Project not found.</div>;
  }

  const columns: Column<Requirement>[] = [
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

  const renderGridItem = (requirement: Requirement) => (
    <div className="p-4 border rounded-lg">
      <h3 className="font-mono font-medium">{requirement.title}</h3>
      <p className="font-mono text-sm text-gray-500 mt-2">{requirement.description}</p>
    </div>
  );

  const renderDetails = (requirement: Requirement) => (
    <div className="p-4">
      <h3 className="font-mono text-lg font-medium">{requirement.title}</h3>
      <p className="font-mono text-sm text-gray-500 mt-2">{requirement.description}</p>
      <div className="mt-4 space-y-2">
        <div className="font-mono text-sm">
          <span className="text-gray-500">Status:</span> {requirement.status}
        </div>
        <div className="font-mono text-sm">
          <span className="text-gray-500">Priority:</span> {requirement.priority}
        </div>
      </div>
    </div>
  );

  const renderCreatePanel = () => (
    <CreatePanel
      isOpen={isCreatePanelOpen}
      onClose={() => setIsCreatePanelOpen(false)}
      initialTab="requirement"
      showTabs="requirement"
      projectId={project.id}
    />
  );

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-none w-full px-6 py-4">
        <div className="w-full grid grid-cols-2 gap-4 border border-gray-200 rounded-lg p-6 bg-white/50">
          <div className="font-mono text-sm text-gray-500">Title</div>
          <div className="font-mono">{project.name}</div>
          <div className="font-mono text-sm text-gray-500">Description</div>
          <div className="font-mono">{project.description || '-'}</div>
          <div className="font-mono text-sm text-gray-500">Created</div>
          <div className="font-mono">{formatDate(project.created_at)}</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <TableManager
          title="Requirements"
          description="Manage project requirements"
          data={requirements}
          columns={columns}
          onItemSelect={onRequirementClick || (() => { })}
          handleGoToPage={handleGoToPage || (() => { })}
          onItemDelete={onRequirementDelete}
          isLoading={isLoading || false}
          renderGridItem={renderGridItem}
          renderDetails={renderDetails}
          emptyMessage="No requirements found."
          onNewItem={() => setIsCreatePanelOpen(true)}
          newItemLabel="New Requirement"
        />
      </div>
      {renderCreatePanel()}
    </div>
  );
}
