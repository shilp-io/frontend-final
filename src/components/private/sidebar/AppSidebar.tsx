'use client';

import { Home, Plus, Settings, User, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import History from "./History";
import { useState } from "react";
import { CreatePanel } from "@/components/private";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

// Menu items with app router paths
const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const { signOut, user: userData } = useAuth();
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login"); // Using Next.js router for navigation
    } catch (error) {
      console.error("Failed to sign out:", error);
      // You might want to show an error notification here
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>atoms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <Link 
                  key={item.title} 
                  href={item.url}
                  className="block mb-2"
                >
                  <SidebarMenuItem className="flex items-center gap-3 py-2">
                    <item.icon className="h-5 w-5" />
                    <span className="text-[15px]">{item.title}</span>
                  </SidebarMenuItem>
                </Link>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="outline"
                    className="w-full relative z-20"
                    onClick={() => setIsCreatePanelOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create New</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <CreatePanel
                isOpen={isCreatePanelOpen}
                onClose={() => setIsCreatePanelOpen(false)}
                showTabs="show"
              />
              
              <div className="mt-4 font-mono">
                <History />
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  {userData?.display_name || "User"}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem asChild>
                  <Link href="/account">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleSignOut}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}