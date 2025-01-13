'use client';

import * as React from 'react';
import { X, ExternalLink, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { detailsVariants } from '@/lib/animations';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const EDIT_OPTIONS = [{ label: 'Delete', value: 'delete' }] as const;

export interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate?: () => void;
    onOptionSelect?: (option: (typeof EDIT_OPTIONS)[number]['value']) => void;
    children: React.ReactNode;
    showNavigateButton?: boolean;
    showEditButton?: boolean;
    className?: string;
    width?: string;
}

export function SidePanel({
    isOpen,
    onClose,
    onNavigate,
    onOptionSelect,
    children,
    showNavigateButton = false,
    showEditButton = false,
    className = '',
    width = '35%',
}: SidePanelProps) {
    const [isAnimating, setIsAnimating] = React.useState(false);

    const handleClose = () => {
        if (!isAnimating) {
            setIsAnimating(true);
            onClose();
        }
    };

    const handleAnimationComplete = () => {
        setTimeout(() => {
            setIsAnimating(false);
        }, 100);
    };

    const customVariants = {
        ...detailsVariants,
        visible: {
            ...detailsVariants.visible,
            width,
        },
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    layout="position"
                    variants={customVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onAnimationComplete={handleAnimationComplete}
                    className={`fixed top-0 right-0 h-full border-l border-border bg-background shadow-lg z-50 ${className}`}
                >
                    <ScrollArea className="h-full">
                        <div className="p-6">
                            <div className="flex justify-end mb-4 space-x-2">
                                {showEditButton && onOptionSelect && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                title="Edit options"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="font-mono backdrop-blur-sm">
                                            {EDIT_OPTIONS.map((option) => (
                                                <DropdownMenuItem
                                                    key={option.value}
                                                    onClick={() =>
                                                        onOptionSelect(
                                                            option.value,
                                                        )
                                                    }
                                                >
                                                    {option.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                                {showNavigateButton && onNavigate && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={onNavigate}
                                        title="Go to item"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleClose}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            {children}
                        </div>
                    </ScrollArea>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
