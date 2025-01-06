import { formatDate } from '@/lib/utils/dateUtils';
import { Tags, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Requirement } from "@/types";

interface RequirementViewProps {
  requirement: Requirement | null;
  isLoading?: boolean;
  error?: string | Error | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'border-green-500 text-green-500';
    case 'in_progress':
      return 'border-blue-500 text-blue-500';
    case 'testing':
      return 'border-purple-500 text-purple-500';
    case 'pending_review':
      return 'border-yellow-500 text-yellow-500';
    case 'rejected':
      return 'border-red-500 text-red-500';
    case 'approved':
      return 'border-emerald-500 text-emerald-500';
    default:
      return 'border-muted text-muted-foreground';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
    case 'high':
      return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
    case 'low':
      return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function RequirementView({
  requirement,
  isLoading,
  error,
}: RequirementViewProps) {
  if (isLoading) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.toString()}</div>;
  }

  if (!requirement) {
    return <div className="p-4 text-gray-500">Requirement not found.</div>;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-none w-full px-6 py-4">
        <div className="w-full space-y-6 border border-gray-200 rounded-lg p-6 bg-white/50">
          <div>
            <h2 className="text-2xl font-bold">{requirement.title}</h2>
          </div>
          
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={getStatusColor(requirement.status)}
            >
              {requirement.status}
            </Badge>
            <Badge className={getPriorityColor(requirement.priority)}>
              {requirement.priority}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="font-mono text-sm text-gray-500">Created</div>
            <div className="font-mono">{formatDate(requirement.created_at)}</div>
            <div className="font-mono text-sm text-gray-500">Updated</div>
            <div className="font-mono">{formatDate(requirement.updated_at)}</div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-muted-foreground">{requirement.description}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <UserCircle2 className="mr-2 h-5 w-5" /> Assignment
            </h3>
            <p className="text-muted-foreground">Assigned to: {requirement.assigned_to || 'Unassigned'}</p>
            <p className="text-muted-foreground">Reviewer: {requirement.reviewer || 'Not assigned'}</p>
          </div>

          {requirement.acceptance_criteria && requirement.acceptance_criteria.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Acceptance Criteria</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {requirement.acceptance_criteria.map((criteria, index) => (
                  <li key={index}>{criteria}</li>
                ))}
              </ul>
            </div>
          )}

          {requirement.tags && requirement.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center">
                <Tags className="mr-2 h-5 w-5" /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {requirement.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
