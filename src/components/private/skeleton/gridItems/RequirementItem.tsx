import { UserCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Requirement } from '@/types';

interface RequirementItemProps {
    requirement: Requirement;
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

export default function RequirementItem({ requirement }: RequirementItemProps) {
    return (
        <div className="space-y-6 p-4 border rounded-lg">
            <div>
                <h2 className="text-xl font-bold">{requirement.title}</h2>
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
            <p className="text-muted-foreground line-clamp-2">
                {requirement.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCircle2 className="h-4 w-4" />
                <span>{requirement.assigned_to || 'Unassigned'}</span>
            </div>
            {requirement.tags && requirement.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {requirement.tags
                        .slice(0, 3)
                        .map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary">
                                {tag}
                            </Badge>
                        ))}
                    {requirement.tags.length > 3 && (
                        <Badge variant="secondary">
                            +{requirement.tags.length - 3}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
