'use client'

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SidePanel, ProjectForm, RequirementForm, CollectionForm, DocumentForm } from '@/components/private'

export interface CreatePanelProps {
    isOpen: boolean
    onClose: () => void
    initialTab?: 'project' | 'requirement' | 'collection' | 'document'
    projectId?: string // For creating requirements under a project
    collectionId?: string // For creating documents under a collection
    showTabs?: 'show' | 'project' | 'requirement' | 'collection' | 'document'
}

export function CreatePanel({
    isOpen,
    onClose,
    initialTab = 'project',
    projectId,
    collectionId,
    showTabs = 'show'
}: CreatePanelProps) {
    const [activeTab, setActiveTab] = React.useState(initialTab)

    const handleClose = () => {
        onClose()
        // Reset to initial tab when closing
        setActiveTab(initialTab)
    }

    // If showTabs is not 'show', render only the specified form
    if (showTabs !== 'show') {
        return (
            <SidePanel
                isOpen={isOpen}
                onClose={handleClose}
                width="40%"
                className="overflow-hidden"
            >
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold">Create New {showTabs.charAt(0).toUpperCase() + showTabs.slice(1)}</h2>
                        <p className="text-muted-foreground">Fill in the details below</p>
                    </div>

                    {showTabs === 'project' && <ProjectForm onSuccess={handleClose} />}
                    {showTabs === 'requirement' && <RequirementForm projectId={projectId} onSuccess={handleClose} />}
                    {showTabs === 'collection' && <CollectionForm onSuccess={handleClose} />}
                    {showTabs === 'document' && <DocumentForm collectionId={collectionId} onSuccess={handleClose} />}
                </div>
            </SidePanel>
        )
    }

    // Original implementation with tabs
    return (
        <SidePanel
            isOpen={isOpen}
            onClose={handleClose}
            width="40%"
            className="overflow-hidden"
        >
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold">Create New Item</h2>
                    <p className="text-muted-foreground">Select the type of item you want to create</p>
                </div>

                <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as any)}>
                    <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="project">Project</TabsTrigger>
                        <TabsTrigger value="requirement">
                            Requirement
                        </TabsTrigger>
                        <TabsTrigger value="collection">Collection</TabsTrigger>
                        <TabsTrigger value="document">
                            Document
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="project" className="mt-6">
                        <ProjectForm onSuccess={handleClose} />
                    </TabsContent>

                    <TabsContent value="requirement" className="mt-6">
                        <RequirementForm
                            projectId={projectId}
                            onSuccess={handleClose}
                        />
                    </TabsContent>

                    <TabsContent value="collection" className="mt-6">
                        <CollectionForm onSuccess={handleClose} />
                    </TabsContent>

                    <TabsContent value="document" className="mt-6">
                        <DocumentForm
                            collectionId={collectionId}
                            onSuccess={handleClose}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </SidePanel>
    )
}
