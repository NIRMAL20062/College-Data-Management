"use client";

import { usePathname } from "next/navigation";
import {
  BarChart2,
  BookOpen,
  ClipboardList,
  Code2,
  Home,
  Megaphone,
  MessageSquare,
  Settings,
  StickyNote,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import Link from "next/link";

const menuItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/exams", icon: BookOpen, label: "Exams" },
  { href: "/dashboard/progress", icon: BarChart2, label: "Progress" },
  { href: "/dashboard/notes", icon: StickyNote, label: "Notes" },
  { href: "/dashboard/tasks", icon: ClipboardList, label: "Tasks" },
  { href: "/dashboard/announcements", icon: Megaphone, label: "Announcements" },
  { href: "/dashboard/chatbot", icon: MessageSquare, label: "Chatbot" },
  { href: "/dashboard/code-analyzer", icon: Code2, label: "Code Analyzer" },
];

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-2">
          <Logo />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard/settings" passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname === "/dashboard/settings"}
                tooltip="Settings"
              >
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
