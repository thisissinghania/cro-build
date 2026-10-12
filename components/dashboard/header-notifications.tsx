"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Sparkles, Globe, AlertTriangle, CheckCheck, ArrowRight } from "lucide-react";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/actions/notifications";

export interface HeaderNotificationItem {
  id: string;
  title: string;
  message: string;
  type: "audit" | "integration" | "alert";
  timeAgo: string;
  url: string;
  read?: boolean;
}

interface HeaderNotificationsProps {
  notifications: HeaderNotificationItem[];
}

export function HeaderNotifications({ notifications = [] }: HeaderNotificationsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  // Show only latest 5 items in the compact dropdown
  const [items, setItems] = useState<HeaderNotificationItem[]>(notifications.slice(0, 5));
  const [hasUnread, setHasUnread] = useState(notifications.some((i) => !i.read));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(notifications.slice(0, 5));
    setHasUnread(notifications.some((i) => !i.read));
  }, [notifications]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    setHasUnread(false);
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    await markAllNotificationsReadAction();
    router.refresh();
  };

  const handleItemClick = async (item: HeaderNotificationItem) => {
    setIsOpen(false);
    if (!item.read) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
      await markNotificationReadAction(item.id);
      router.refresh();
    }
    router.push(item.url);
  };

  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer border border-transparent hover:border-zinc-200"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-sm ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Floating Notifications Dropdown (Compact & Scrollable) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-[350px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-200/80 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-900">Notifications</h3>
              {hasUnread && unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[12px] font-medium bg-rose-50 text-rose-600 rounded-md border border-rose-100">
                  {unreadCount} New
                </span>
              )}
            </div>

            {hasUnread && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark read
              </button>
            )}
          </div>

          {/* Compact Scrollable List (shows latest 3-5 notifications) */}
          <div className="max-h-[220px] overflow-y-auto divide-y divide-zinc-100">
            {items.length === 0 ? (
              <div className="py-8 px-4 text-center text-zinc-500 text-xs">
                <Bell className="w-6 h-6 text-zinc-300 mx-auto mb-1.5" />
                <p className="font-medium text-zinc-700">All caught up!</p>
                <p className="text-zinc-400">No new notifications.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3 flex items-start gap-2.5 hover:bg-zinc-50 transition-colors cursor-pointer ${
                    !item.read ? "bg-indigo-50/20" : ""
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      item.type === "audit"
                        ? "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100"
                        : item.type === "alert"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                    }`}
                  >
                    {item.type === "audit" ? (
                      <Sparkles className="w-3.5 h-3.5" />
                    ) : item.type === "alert" ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <Globe className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-zinc-900 leading-tight mb-0.5">
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] font-medium text-zinc-400 mt-1 block" suppressHydrationWarning>
                      {item.timeAgo}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Link to Dedicated Notifications Page */}
          <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-center text-xs">
            <Link
              href="/dashboard/notifications"
              onClick={() => setIsOpen(false)}
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:underline transition-colors"
            >
              View all notifications <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
