import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/public/ThemeToggle';

const VerticalToolbar = () => {
  return (
    <div className="left-1 top-1 flex flex-col gap-2">
      <div className="h-10 w-10 flex items-center justify-center">
        <SidebarTrigger className="h-5 w-5" />
      </div>
      <div className="h-10 w-10 flex items-center justify-center">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default VerticalToolbar;