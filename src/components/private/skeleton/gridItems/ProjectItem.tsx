import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types";

interface ProjectItemProps {
  project: Project;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'border-green-500 text-green-500';
    case 'active':
      return 'border-blue-500 text-blue-500';
    case 'on_hold':
      return 'border-yellow-500 text-yellow-500';
    case 'archived':
      return 'border-gray-500 text-gray-500';
    default:
      return 'border-muted text-muted-foreground';
  }
};

const formatDate = (date: string | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

export default function ProjectItem({ project }: ProjectItemProps) {
  return (
    <div className="space-y-6 p-4 border rounded-lg">
      <div>
        <h2 className="text-xl font-bold">{project.name}</h2>
      </div>
      <Badge
        variant="outline"
        className={getStatusColor(project.status)}
      >
        {project.status}
      </Badge>
      <p className="text-muted-foreground line-clamp-2">{project.description}</p>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarIcon className="h-4 w-4" />
        <span>{formatDate(project.start_date)} - {formatDate(project.target_end_date)}</span>
      </div>
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag: string, index: number) => (
            <Badge key={index} variant="secondary">{tag}</Badge>
          ))}
          {project.tags.length > 3 && (
            <Badge variant="secondary">+{project.tags.length - 3}</Badge>
          )}
        </div>
      )}
    </div>
  );
} 