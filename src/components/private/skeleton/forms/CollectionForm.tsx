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
import { useToast } from '@/components/ui/use-toast';
import { useCollections } from '@/hooks/db/useCollections';
import { useCollectionStore } from '@/lib/store/collectionStore';
import { AccessLevel } from '@/types/enums';

const collectionFormSchema = z.object({
    name: z.string().min(1, 'Collection name is required'),
    description: z.string().optional(),
    access_level: z.enum([
        'private',
        'project',
        'organization',
        'public',
    ] as const),
    tags: z.array(z.string()).optional(),
});

type CollectionFormValues = z.infer<typeof collectionFormSchema>;

const defaultValues: Partial<CollectionFormValues> = {
    name: '',
    description: '',
    access_level: AccessLevel.PRIVATE,
    tags: [],
};

interface CollectionFormProps {
    onSuccess: () => void;
}

export default function CollectionForm({ onSuccess }: CollectionFormProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { toast } = useToast();
    const { createCollection } = useCollections();
    const { selectCollection } = useCollectionStore();

    const form = useForm<CollectionFormValues>({
        resolver: zodResolver(collectionFormSchema),
        defaultValues,
    });

    async function onSubmit(data: CollectionFormValues) {
        try {
            setIsSubmitting(true);
            const collection = await createCollection({
                name: data.name,
                description: data.description || null,
                access_level: data.access_level,
                tags: data.tags || null,
                metadata: {
                    source: 'web_app',
                    template_version: '1.0',
                },
            });
            toast({
                variant: 'default',
                title: 'Success',
                description: 'Collection created successfully',
            });
            // Select the newly created collection to open it in the side panel
            if (collection) {
                selectCollection(collection.id);
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to create collection:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to create collection',
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
                            <FormLabel>Collection Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter collection name"
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
                                    placeholder="Enter collection description"
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
                    name="access_level"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Access Level</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select access level" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={AccessLevel.PRIVATE}>
                                        Private
                                    </SelectItem>
                                    <SelectItem value={AccessLevel.PROJECT}>
                                        Project
                                    </SelectItem>
                                    <SelectItem
                                        value={AccessLevel.ORGANIZATION}
                                    >
                                        Organization
                                    </SelectItem>
                                    <SelectItem value={AccessLevel.PUBLIC}>
                                        Public
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Collection'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
