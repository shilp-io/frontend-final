'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjects, useRequirements } from '@/hooks'
import { useToast } from "@/components/ui/use-toast"

const requirementFormSchema = z.object({
  title: z.string().min(1, 'Requirement title is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'pending_review', 'approved', 'in_progress', 'testing', 'completed', 'rejected'] as const),
  priority: z.enum(['low', 'medium', 'high', 'critical'] as const),
  assigned_to: z.string().optional(),
  reviewer: z.string().optional(),
  acceptance_criteria: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  project_id: z.string().min(1, 'Project is required'),
})

type RequirementFormValues = z.infer<typeof requirementFormSchema>

const defaultValues: Partial<RequirementFormValues> = {
  title: '',
  description: '',
  status: 'draft',
  priority: 'medium',
  acceptance_criteria: [],
  tags: [],
  assigned_to: '',
  reviewer: '',
  project_id: '',
}

interface RequirementFormProps {
  projectId?: string
  onSuccess: () => void
}

export default function RequirementForm({ projectId, onSuccess }: RequirementFormProps) {
  const form = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementFormSchema),
    defaultValues: {
      ...defaultValues,
      project_id: projectId || '',
    },
  })

  const [criteria, setCriteria] = React.useState<string>('')
  const { projects, isLoading: isLoadingProjects } = useProjects()
  const { createRequirement } = useRequirements(projectId)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()

  async function onSubmit(data: RequirementFormValues) {
    try {
      setIsSubmitting(true)
      await createRequirement({
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        assigned_to: data.assigned_to || null,
        reviewer: data.reviewer || null,
        acceptance_criteria: data.acceptance_criteria || [],
        tags: data.tags || [],
        project_id: data.project_id,
        parent_id: null,
        original_req: null,
        current_req: null,
        history_req: null,
        rewritten_ears: null,
        rewritten_incose: null,
        selected_format: null,
        metadata: {}
      })
      toast({
        variant: "default",
        title: "Success",
        description: "Requirement created successfully",
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to create requirement:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create requirement',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddCriteria = () => {
    if (criteria.trim()) {
      const currentCriteria = form.getValues('acceptance_criteria') || []
      form.setValue('acceptance_criteria', [...currentCriteria, criteria.trim()])
      setCriteria('')
    }
  }

  const handleRemoveCriteria = (index: number) => {
    const currentCriteria = form.getValues('acceptance_criteria') || []
    form.setValue(
      'acceptance_criteria',
      currentCriteria.filter((_, i) => i !== index)
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!projectId && (
          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingProjects ? (
                      <SelectItem value="" disabled>
                        Loading projects...
                      </SelectItem>
                    ) : projects?.length === 0 ? (
                      <SelectItem value="" disabled>
                        No projects found
                      </SelectItem>
                    ) : (
                      projects?.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter requirement title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter requirement description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assigned_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To</FormLabel>
                <FormControl>
                  <Input placeholder="Enter assignee name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reviewer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reviewer</FormLabel>
                <FormControl>
                  <Input placeholder="Enter reviewer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormLabel>Acceptance Criteria</FormLabel>
          <div className="flex gap-2">
            <Input
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="Add acceptance criteria"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCriteria()
                }
              }}
            />
            <Button type="button" onClick={handleAddCriteria}>
              Add
            </Button>
          </div>
          <ul className="space-y-2">
            {form.watch('acceptance_criteria')?.map((criterion, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="flex-1">{criterion}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCriteria(index)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Requirement'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 