import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/private/AppSidebar'
import { ThemeToggle } from '@/components/public/ThemeToggle'
import VerticalToolbar from '@/components/private/VerticalToolbar'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <VerticalToolbar />
            {children}
        </SidebarProvider>
    )
}