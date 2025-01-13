import React, { useEffect, useState } from 'react';
import {
    FileText,
    Book,
    FolderOpen,
    Boxes,
    ChevronRight,
    ChevronDown,
} from 'lucide-react';
import { useProjectStore } from '@/lib/store/projectStore';
import { useRequirementStore } from '@/lib/store/requirementStore';
import { useCollectionStore } from '@/lib/store/collectionStore';
import { useDocumentStore } from '@/lib/store/documentStore';
import { useRecentStore } from '@/lib/store/recentStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { UUID } from '@/types';

interface RecentItemView {
    id: UUID;
    name: string;
}

const History: React.FC = () => {
    const { selectProject } = useProjectStore();
    const { selectRequirement } = useRequirementStore();
    const { selectCollection } = useCollectionStore();
    const { selectDocument } = useDocumentStore();
    const { getRecentItemsByType } = useRecentStore();

    // State for expanded sections and item limits
    const [expandedSections, setExpandedSections] = useState<
        Record<string, boolean>
    >({
        projects: true,
        requirements: true,
        collections: true,
        documents: true,
    });
    const [showMore, setShowMore] = useState<Record<string, boolean>>({
        projects: false,
        requirements: false,
        collections: false,
        documents: false,
    });

    // Initialize state for recent items
    const [recentItems, setRecentItems] = useState<{
        projects: RecentItemView[];
        requirements: RecentItemView[];
        collections: RecentItemView[];
        documents: RecentItemView[];
    }>({
        projects: [],
        requirements: [],
        collections: [],
        documents: [],
    });

    // Fetch recent items on client side only
    useEffect(() => {
        const updateRecentItems = () => {
            setRecentItems({
                projects: getRecentItemsByType(
                    'project',
                    showMore.projects ? 10 : 3,
                ),
                requirements: getRecentItemsByType(
                    'requirement',
                    showMore.requirements ? 10 : 3,
                ),
                collections: getRecentItemsByType(
                    'collection',
                    showMore.collections ? 10 : 3,
                ),
                documents: getRecentItemsByType(
                    'document',
                    showMore.documents ? 10 : 3,
                ),
            });
        };
        updateRecentItems();
    }, [getRecentItemsByType, showMore]);

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const toggleShowMore = (section: string) => {
        setShowMore((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const renderSection = (
        title: string,
        items: RecentItemView[],
        icon: React.ReactNode,
        onClick: (id: UUID) => void,
        path: string,
    ) => {
        const sectionKey = title.toLowerCase();
        const isExpanded = expandedSections[sectionKey];
        const isShowingMore = showMore[sectionKey];

        return (
            <div className="space-y-1.5">
                <div className="flex items-center justify-between group">
                    <Link
                        href={path}
                        className="flex items-center space-x-2 text-xs font-medium text-gray-500 dark:text-dark-text-secondary px-2 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        {icon}
                        <span>{title}</span>
                    </Link>
                    <button
                        onClick={() => toggleSection(sectionKey)}
                        className="p-1 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                        ) : (
                            <ChevronRight className="w-3 h-3" />
                        )}
                    </button>
                </div>
                {isExpanded && (
                    <div className="space-y-0.5 relative pl-2">
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700/50" />
                        {items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onClick(item.id)}
                                className={cn(
                                    'group flex items-center w-full px-2 py-1 text-left rounded-sm transition-colors text-xs relative',
                                    'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/20',
                                )}
                            >
                                <div className="absolute -left-2 top-1/2 h-px w-2 bg-gray-200 dark:bg-gray-700/50 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="truncate">{item.name}</span>
                            </button>
                        ))}
                        {items.length === 0 && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 italic px-2">
                                None
                            </div>
                        )}
                        {items.length > 0 && (
                            <button
                                onClick={() => toggleShowMore(sectionKey)}
                                className="w-full px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-left"
                            >
                                {isShowingMore ? '← show less' : '→ show more'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {renderSection(
                    'Projects',
                    recentItems.projects,
                    <FileText className="w-3 h-3" />,
                    selectProject,
                    '/projects',
                )}
                {renderSection(
                    'Requirements',
                    recentItems.requirements,
                    <Book className="w-3 h-3" />,
                    selectRequirement,
                    '/projects/requirements',
                )}
                {renderSection(
                    'Collections',
                    recentItems.collections,
                    <FolderOpen className="w-3 h-3" />,
                    selectCollection,
                    '/collections',
                )}
                {renderSection(
                    'Documents',
                    recentItems.documents,
                    <Boxes className="w-3 h-3" />,
                    selectDocument,
                    '/documents',
                )}
            </div>
        </div>
    );
};

export default History;
