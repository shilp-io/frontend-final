'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { motion, LayoutGroup } from 'framer-motion';
import { SidePanel } from '@/components/private';
import { transitionConfig } from '@/lib/animations';
import type { Project, Requirement, Collection, ExternalDoc } from '@/types';

type SupportedDataTypes = Project | Requirement | Collection | ExternalDoc;

interface Column<T extends SupportedDataTypes = SupportedDataTypes> {
    header: string;
    width?: number;
    accessor: (item: T) => string;
}

interface MonospaceGridProps<
    T extends SupportedDataTypes = SupportedDataTypes,
> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    handleGoToPage?: (item: T) => void;
    gridItemRender?: (item: T) => React.ReactNode;
    renderDetails?: (item: T) => React.ReactNode;
    onItemDelete?: (item: T) => void;
    viewMode?: 'split' | 'full';
}

export function MonospaceGrid<T extends SupportedDataTypes>({
    data,
    columns,
    onRowClick,
    handleGoToPage,
    gridItemRender,
    renderDetails,
    onItemDelete,
    viewMode = 'full',
}: MonospaceGridProps<T>) {
    const [selectedItem, setSelectedItem] = React.useState<T | null>(null);

    const handleItemClick = (item: T) => {
        if (onRowClick) {
            onRowClick(item);
        }
        if (renderDetails) {
            setSelectedItem(item);
        }
        if (handleGoToPage && !renderDetails) {
            handleGoToPage(item);
        }
    };

    return (
        <LayoutGroup>
            <motion.div
                className={`overflow-hidden relative space-y-4 pt-4`}
                layout
                transition={transitionConfig}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    {data.map((item, index) => (
                        <div key={index} onClick={() => handleItemClick(item)}>
                            {gridItemRender ? (
                                <div onClick={() => handleItemClick(item)}>
                                    {gridItemRender(item)}
                                </div>
                            ) : (
                                <div
                                    onClick={() => handleItemClick(item)}
                                    className="w-full bg-white dark:bg-dark-surface p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-border hover:border-red-200 transition-colors text-left font-mono cursor-pointer"
                                >
                                    <div className="flex items-start space-x-4">
                                        <FileText className="w-8 h-8 text-red-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 dark:text-dark-text-primary truncate">
                                                {columns[0]?.accessor(item)}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                                {columns
                                                    .slice(1)
                                                    .map((column, colIndex) => (
                                                        <span
                                                            key={colIndex}
                                                            className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-nav-hover/10 px-2 py-1 rounded truncate max-w-[200px]"
                                                        >
                                                            {column.accessor(
                                                                item,
                                                            )}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            {renderDetails && viewMode === 'split' && (
                <SidePanel
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onNavigate={
                        selectedItem
                            ? () => handleGoToPage?.(selectedItem)
                            : undefined
                    }
                    showNavigateButton={!!handleGoToPage}
                    showEditButton={!!onItemDelete}
                    onOptionSelect={(option) => {
                        if (option === 'delete' && selectedItem) {
                            onItemDelete?.(selectedItem);
                            setSelectedItem(null);
                        }
                    }}
                >
                    {selectedItem && renderDetails(selectedItem)}
                </SidePanel>
            )}
        </LayoutGroup>
    );
}
