'use client';

import { Terminal, Table, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store/appStore';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export function ViewModeToggle() {
    const { viewMode, setViewMode } = useAppStore();

    const cycleViewMode = () => {
        const modes = ['normal', 'ascii', 'compact'] as const;
        const currentIndex = modes.indexOf(viewMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setViewMode(modes[nextIndex]);
    };

    const getIcon = () => {
        switch (viewMode) {
            case 'normal':
                return <Table className="h-[1.2rem] w-[1.2rem]" />;
            case 'ascii':
                return <Terminal className="h-[1.2rem] w-[1.2rem]" />;
            case 'compact':
                return <LayoutGrid className="h-[1.2rem] w-[1.2rem]" />;
        }
    };

    const getTooltipText = () => {
        switch (viewMode) {
            case 'normal':
                return 'Normal View';
            case 'ascii':
                return 'ASCII View';
            case 'compact':
                return 'Compact View';
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={cycleViewMode}
                        className="h-9 w-9"
                    >
                        {getIcon()}
                        <span className="sr-only">Toggle view mode</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{getTooltipText()}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
