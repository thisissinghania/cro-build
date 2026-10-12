"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "./sidebar-provider";

export function SidebarToggle() {
  const { isOpen, toggle } = useSidebar();

  return (
    <button 
      onClick={toggle}
      className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-200 cursor-pointer group"
      title={isOpen ? "Close Sidebar" : "Open Sidebar"}
    >
      {isOpen ? (
        <PanelLeftClose className="w-6 h-6 transition-transform group-hover:scale-95" strokeWidth={1.5} />
      ) : (
        <PanelLeftOpen className="w-6 h-6 transition-transform group-hover:scale-95" strokeWidth={1.5} />
      )}
    </button>
  );
}
