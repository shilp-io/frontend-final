'use client';

import React, { useState } from "react";
import { FolderOpen, Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TableManager from "@/components/private/skeleton/TableManager";
import { useCollectionStore } from "@/lib/store/collectionStore";
import { useRecentStore } from "@/lib/store/recentStore";
import { useCollections } from "@/hooks/db/useCollections";
import type { Collection } from "@/types";
import type { Column } from "@/components/private";
import { CreatePanel } from "@/components/private";

const formatDate = (date: string | null) => {
	if (!date) return "N/A";
	return new Date(date).toLocaleDateString();
};

const getAccessLevelColor = (level: string) => {
	switch (level) {
		case 'public':
			return 'border-green-500 text-green-500';
		case 'organization':
			return 'border-blue-500 text-blue-500';
		case 'project':
			return 'border-yellow-500 text-yellow-500';
		case 'private':
			return 'border-red-500 text-red-500';
		default:
			return 'border-muted text-muted-foreground';
	}
};

export default function CollectionsPage() {
	const { selectCollection } = useCollectionStore();
	const { addRecentItem } = useRecentStore();
	const { collections } = useCollections();
	const [isLoading, setIsLoading] = useState(true);
	const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);

	// Simulate loading state for now
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	const handleCollectionSelect = async (collection: Collection) => {
		selectCollection(collection.id);
		addRecentItem(collection.id, collection.name, 'collection');
	};

	const handleNewCollection = () => {
		setIsCreatePanelOpen(true);
	};

	const columns: Column<Collection>[] = [
		{
			header: "Name",
			accessor: (collection: Collection) => collection.name,
			width: 30,
			isSortable: true
		},
		{
			header: "Access Level",
			accessor: (collection: Collection) => collection.access_level,
			width: 20,
			renderCell: (collection: Collection) => (
				<Badge
					variant="outline"
					className={getAccessLevelColor(collection.access_level)}
				>
					{collection.access_level}
				</Badge>
			),
			isSortable: true
		},
		{
			header: "Last Modified",
			accessor: (collection: Collection) => formatDate(collection.updated_at),
			width: 20,
			isSortable: true
		}
	];

	const renderGridItem = (collection: Collection) => (
		<div className="space-y-6 p-4 border rounded-lg">
			<div>
				<h2 className="text-xl font-bold">{collection.name}</h2>
			</div>
			<Badge
				variant="outline"
				className={getAccessLevelColor(collection.access_level)}
			>
				{collection.access_level}
			</Badge>
			{collection.description && (
				<p className="text-muted-foreground line-clamp-2">{collection.description}</p>
			)}
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<FolderOpen className="h-4 w-4" />
				<span>Last modified: {formatDate(collection.updated_at)}</span>
			</div>
			{collection.tags && collection.tags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{collection.tags.slice(0, 3).map((tag: string, index: number) => (
						<Badge key={index} variant="secondary">{tag}</Badge>
					))}
					{collection.tags.length > 3 && (
						<Badge variant="secondary">+{collection.tags.length - 3}</Badge>
					)}
				</div>
			)}
		</div>
	);

	const renderDetails = (collection: Collection) => (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold">{collection.name}</h2>
			</div>
			<Badge
				variant="outline"
				className={getAccessLevelColor(collection.access_level)}
			>
				{collection.access_level}
			</Badge>
			{collection.description && (
				<p className="text-muted-foreground">{collection.description}</p>
			)}
			<div className="space-y-2">
				<h3 className="text-lg font-semibold flex items-center">
					<FolderOpen className="mr-2 h-5 w-5" /> Collection Details
				</h3>
				<p className="text-muted-foreground">Created: {formatDate(collection.created_at)}</p>
				<p className="text-muted-foreground">Last Modified: {formatDate(collection.updated_at)}</p>
				{collection.parent_id && (
					<p className="text-muted-foreground">Parent Collection ID: {collection.parent_id}</p>
				)}
			</div>
			{collection.tags && collection.tags.length > 0 && (
				<div className="space-y-2">
					<h3 className="text-lg font-semibold flex items-center">
						<Tags className="mr-2 h-5 w-5" /> Tags
					</h3>
					<div className="flex flex-wrap gap-2">
						{collection.tags.map((tag: string, index: number) => (
							<Badge key={index} variant="secondary">{tag}</Badge>
						))}
					</div>
				</div>
			)}
		</div>
	);

	return (
		<div className="flex min-h-screen w-full bg-background text-foreground p-4">
			<div className="container mx-auto">
				<TableManager
					title="Collections"
					description="Manage and organize your collections"
					data={collections}
					isLoading={isLoading}
					columns={columns}
					onItemSelect={handleCollectionSelect}
					onNewItem={handleNewCollection}
					renderGridItem={renderGridItem}
					renderDetails={renderDetails}
					newItemLabel="New Collection"
					searchPlaceholder="Search collections..."
					emptyMessage="No collections found. Create a new collection to get started."
					handleGoToPage={(collection: Collection) => `/collections/${collection.id}`}
				/>
				<CreatePanel
					isOpen={isCreatePanelOpen}
					onClose={() => setIsCreatePanelOpen(false)}
					initialTab="collection"
					showTabs="collection"
				/>
			</div>
		</div>
	);
}
