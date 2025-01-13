'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useProjects } from '@/hooks/db/useProjects';
import { useToast } from '@/components/ui/use-toast';
import { useProjectStore } from '@/lib/store/projectStore';

const projectFormSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    status: z.enum(['active', 'on_hold', 'completed', 'archived']),
    start_date: z.date().optional(),
    target_end_date: z.date().optional(),
    actual_end_date: z.date().optional(),
    tags: z.array(z.string()).optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const defaultValues: Partial<ProjectFormValues> = {
    status: 'active',
    name: '',
};

interface ProjectFormProps {
    onSuccess: () => void;
}

export default function ProjectForm({ onSuccess }: ProjectFormProps) {
    const { createProject } = useProjects();
    const { toast } = useToast();
    const { selectProject } = useProjectStore();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues,
    });

    async function onSubmit(data: ProjectFormValues) {
        try {
            setIsSubmitting(true);
            const project = await createProject({
                name: data.name,
                status: data.status,
                description: data.description || null,
                start_date: data.start_date?.toISOString() || null,
                target_end_date: data.target_end_date?.toISOString() || null,
                actual_end_date: data.actual_end_date?.toISOString() || null,
                tags: data.tags || null,
                metadata: {
                    source: 'web_app',
                    template_version: '1.0',
                },
            });
            toast({
                variant: 'default',
                title: 'Success',
                description: 'Project created successfully',
            });
            // Select the newly created project to open it in the side panel
            if (project) {
                selectProject(project.id, project.name);
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to create project:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to create project',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter project name"
                                    {...field}
                                />
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
                                    placeholder="Enter project description"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select project status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="on_hold">
                                        On Hold
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Completed
                                    </SelectItem>
                                    <SelectItem value="archived">
                                        Archived
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !field.value &&
                                                        'text-muted-foreground',
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, 'PPP')
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date('1900-01-01')
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="target_end_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Target End Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !field.value &&
                                                        'text-muted-foreground',
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, 'PPP')
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date('1900-01-01')
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Project'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
