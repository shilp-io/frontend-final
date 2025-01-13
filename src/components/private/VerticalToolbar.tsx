'use client';

import React from 'react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/public/toggles/ThemeToggle';
import { ViewModeToggle } from '@/components/public/toggles/ViewModeToggle';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const VerticalToolbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { state } = useSidebar();

    // Convert pathname to breadcrumb segments
    const segments = pathname
        .split('/')
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));

    return (
        <div
            className={cn(
                'fixed left-2 top-4 z-50 flex flex-col gap-2 transition-all duration-200',
                state === 'expanded' && 'left-[17rem]',
            )}
        >
            <div className="flex items-center gap-1">
                <div className="h-10 w-10 flex items-center justify-center">
                    <SidebarTrigger className="h-5 w-5" />
                </div>
                <div className="flex items-center h-6 gap-1 px-1 bg-muted/50 rounded font-mono text-[10px] text-muted-foreground">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-transparent"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-3 w-3" />
                    </Button>
                    {segments.map((segment, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <span className="opacity-40">/</span>}
                            <span className="hover:text-foreground cursor-default transition-colors">
                                {segment}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className="h-10 w-10 flex items-center justify-center">
                <ThemeToggle />
            </div>
            <div className="h-10 w-10 flex items-center justify-center">
                <ViewModeToggle />
            </div>
        </div>
    );
};

export default VerticalToolbar;
