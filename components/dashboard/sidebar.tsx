"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Globe,
  FileText,
  Settings,
  LogOut,
  Sparkles
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useSidebar } from "./sidebar-provider";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, role: "ALL" },
  { name: "Users", href: "/dashboard/users", icon: Users, role: "ADMIN" },
  { name: "Integrations", href: "/dashboard/integrations", icon: Globe, role: "ALL" },
  { name: "AI Audits", href: "/dashboard/audits", icon: FileText, role: "ALL" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, role: "ALL" },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole = "USER" }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen } = useSidebar();

  const filteredNavItems = navItems.filter(item => item.role === "ALL" || item.role === userRole);

  return (
    <aside 
      className={`hidden md:flex flex-col w-64 h-screen bg-zinc-950 border-r border-zinc-800 text-zinc-300 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 ${
        isOpen ? 'translate-x-0 ml-0' : '-translate-x-full -ml-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-20 px-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            CROBuild
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="mb-4 px-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Menu
        </div>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 h-[48px] rounded-lg transition-all duration-200 group cursor-pointer ${isActive
                ? "bg-indigo-500/10 text-indigo-400"
                : "hover:bg-zinc-900 hover:text-white"
                }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile / Logout */}
      <div className="p-4 border-t border-zinc-800/50">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center w-full h-[48px] gap-4 px-4 rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white group cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-zinc-500 group-hover:text-rose-400 transition-colors" />
            <span className="font-medium group-hover:text-rose-400 transition-colors">Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
