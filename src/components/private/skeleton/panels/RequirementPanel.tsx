import { Tags, UserCircle2, RefreshCw, Sparkles, History, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Requirement } from "@/types";
import type { Json } from "@/types/supabase";
import { useGumloop } from "@/hooks/useGumloop";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RequirementPanelProps {
  requirement: Requirement;
  onUpdate?: (updatedRequirement: Requirement) => void;
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

export default function RequirementPanel({ requirement, onUpdate }: RequirementPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCurrentReq, setShowCurrentReq] = useState(false);
  const [showHistoryReq, setShowHistoryReq] = useState(false);
  const { startPipeline, getPipelineRun } = useGumloop();

  const handleAnalyze = async () => {
    if (!requirement.original_req || !requirement.selected_format) return;

    setIsAnalyzing(true);
    try {
      const response = await startPipeline({
        requirement: requirement.original_req,
        objective: `Analyze and improve requirement clarity using ${requirement.selected_format.toUpperCase()} format`
      });

      if (!response?.run_id) {
        throw new Error('No run ID received from pipeline');
      }

      const pipelineRun = getPipelineRun(response.run_id);
      const result = await pipelineRun;

      if (result.data?.state === 'DONE' && result.data?.outputs?.output && onUpdate) {
        const newCurrentReq = JSON.parse(JSON.stringify(result.data.outputs));
        const newHistoryReq = requirement.history_req ? [...requirement.history_req] : [];
        newHistoryReq.push(newCurrentReq);

        onUpdate({
          ...requirement,
          current_req: newCurrentReq,
          history_req: newHistoryReq,
          rewritten_ears: requirement.selected_format === 'ears' ? result.data.outputs.output : requirement.rewritten_ears,
          rewritten_incose: requirement.selected_format === 'incose' ? result.data.outputs.output : requirement.rewritten_incose
        });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{requirement.title}</h2>
        {requirement.original_req && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCurrentReq(true)}
              className="gap-2"
            >
              <Code className="h-4 w-4" />
              View Current
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistoryReq(true)}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              View History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !requirement.selected_format}
              className="gap-2"
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isAnalyzing ? "Analyzing..." : "Analyze & Improve"}
            </Button>
          </div>
        )}
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

      <p className="text-muted-foreground">{requirement.description}</p>
      
      {!requirement.original_req ? (
        <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Write a new requirement
          </h3>
          <div className="space-y-4">
            <Select
              value={requirement.selected_format ?? ''}
              onValueChange={(value) => onUpdate?.({ ...requirement, selected_format: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ears">EARS Format</SelectItem>
                <SelectItem value="incose">INCOSE Format</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Write a new requirement"
              value={requirement.original_req ?? ''}
              onChange={(e) => onUpdate?.({ ...requirement, original_req: e.target.value })}
              className="min-h-[100px] w-full"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !requirement.selected_format || !requirement.original_req}
              className="gap-2 w-full"
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isAnalyzing ? "Analyzing..." : "Analyze & Improve"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Original Requirement
            </h3>
            <p className="text-muted-foreground">{requirement.original_req}</p>
          </div>
          {(requirement.rewritten_ears || requirement.rewritten_incose) && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Improved Requirement
              </h3>
              <div className="space-y-4">
                <Select
                  value={requirement.selected_format || undefined}
                  onValueChange={(value) => onUpdate?.({ ...requirement, selected_format: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ears">EARS Format</SelectItem>
                    <SelectItem value="incose">INCOSE Format</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground">
                  {requirement.selected_format === 'ears'
                    ? requirement.rewritten_ears
                    : requirement.rewritten_incose}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

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

      <Dialog open={showCurrentReq} onOpenChange={setShowCurrentReq}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Current Requirement Analysis</DialogTitle>
          </DialogHeader>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            {JSON.stringify(requirement.current_req, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistoryReq} onOpenChange={setShowHistoryReq}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Requirement Analysis History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {requirement.history_req?.map((historyItem, index) => (
              <div key={index} className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Version {index + 1}</h4>
                <pre className="overflow-x-auto">
                  {JSON.stringify(historyItem, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 