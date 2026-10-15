"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Filter,
  Sparkles,
  Globe,
  AlertTriangle,
  ArrowRight,
  Eye,
  CheckCircle2,
  CheckCheck,
} from "lucide-react";
import {
  getNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationItem,
} from "@/actions/notifications";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface NotificationsClientProps {
  initialNotifications?: NotificationItem[];
  initialTotal?: number;
}

export function NotificationsClient({
  initialNotifications = [],
  initialTotal = 0,
}: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search State
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"ALL" | "AUDIT" | "INTEGRATION" | "ALERT">("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [pendingType, setPendingType] = useState<"ALL" | "AUDIT" | "INTEGRATION" | "ALERT">("ALL");
  const [pendingFromDate, setPendingFromDate] = useState("");
  const [pendingToDate, setPendingToDate] = useState("");

  const hasActiveFilters = selectedType !== "ALL" || Boolean(fromDate) || Boolean(toDate);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const skip = (currentPage - 1) * itemsPerPage;
    const res = await getNotificationsAction({
      search: debouncedSearch,
      type: selectedType,
      from: fromDate,
      to: toDate,
      skip,
      take: itemsPerPage,
    });

    if (res.success && res.data) {
      setNotifications(res.data);
      setTotal(res.total);
    }
    setLoading(false);
  }, [currentPage, itemsPerPage, debouncedSearch, selectedType, fromDate, toDate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    await markAllNotificationsReadAction();
    fetchNotifications();
  };

  const handleItemView = async (item: NotificationItem) => {
    if (!item.read) {
      setNotifications((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
      await markNotificationReadAction(item.id);
    }
  };

  const totalPages = Math.ceil(total / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, total);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours.toString().padStart(2, "0");

    return `${month} ${day}, ${year} ${formattedHours}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 relative">
        {/* Header & Controls (Same design as AI Audits page) */}
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-t-2xl">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Notifications</h1>
            <p className="text-sm text-zinc-500 mt-1">Review all real-time alerts, AI audits, and website integration events.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllRead}
              className="h-[48px] px-4 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 hover:text-indigo-600 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  loading ? "text-indigo-500 animate-pulse" : "text-zinc-400"
                }`}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search notifications..."
                className="w-full sm:w-[250px] pl-9 pr-4 h-[48px] bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setPendingType(selectedType);
                  setPendingFromDate(fromDate);
                  setPendingToDate(toDate);
                  setIsFilterOpen(!isFilterOpen);
                }}
                className={`relative flex items-center justify-center w-[48px] h-[48px] bg-white border rounded-lg transition-colors cursor-pointer ${
                  hasActiveFilters
                    ? "border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                }`}
                title="Filter Notifications"
              >
                <Filter className="w-5 h-5" />
                {hasActiveFilters && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-indigo-50"></span>
                )}
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-[340px] bg-white border border-zinc-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Event Type Filter */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-zinc-900 mb-2">Event Type</label>
                      <select
                        value={pendingType}
                        onChange={(e) => setPendingType(e.target.value as any)}
                        className="w-full h-[44px] px-3 text-sm bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                      >
                        <option value="ALL">All Events</option>
                        <option value="AUDIT">AI CRO Audits</option>
                        <option value="INTEGRATION">Website Connections</option>
                        <option value="ALERT">Conversion Alerts</option>
                      </select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-zinc-900 mb-2">Date Range</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-sm text-zinc-600 mb-1.5 block">From</span>
                          <input
                            type="date"
                            value={pendingFromDate}
                            onChange={(e) => setPendingFromDate(e.target.value)}
                            className="w-full h-[44px] px-3 text-sm bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div>
                          <span className="text-sm text-zinc-600 mb-1.5 block">To</span>
                          <input
                            type="date"
                            value={pendingToDate}
                            onChange={(e) => setPendingToDate(e.target.value)}
                            className="w-full h-[44px] px-3 text-sm bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2 pt-5 border-t border-zinc-100">
                      <button
                        onClick={() => {
                          setPendingType("ALL");
                          setPendingFromDate("");
                          setPendingToDate("");
                          setSelectedType("ALL");
                          setFromDate("");
                          setToDate("");
                          setCurrentPage(1);
                          setIsFilterOpen(false);
                        }}
                        className="px-4 h-[36px] text-sm font-medium bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors cursor-pointer outline-none shadow-sm"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => {
                          setSelectedType(pendingType);
                          setFromDate(pendingFromDate);
                          setToDate(pendingToDate);
                          setCurrentPage(1);
                          setIsFilterOpen(false);
                        }}
                        className="px-5 h-[36px] text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors cursor-pointer outline-none shadow-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Notifications Table (Same design as AI Audits table) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-sm text-zinc-500 font-medium bg-zinc-50/50">
                <th className="p-3.5">Event Type</th>
                <th className="p-3.5">Notification Details</th>
                <th className="p-3.5">Target Website</th>
                <th className="p-3.5">Date &amp; Time</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-3.5 py-12 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                      <span>Loading notifications...</span>
                    </div>
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-3.5 py-12 text-center text-zinc-500">
                    <Bell className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-base font-semibold text-zinc-800 mb-1">No notifications found</p>
                    <p className="text-sm text-zinc-400">
                      {hasActiveFilters || search
                        ? "Try clearing your filters or search term."
                        : "Notifications will appear here as you run audits or connect websites."}
                    </p>
                  </td>
                </tr>
              ) : (
                notifications.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                    {/* Event Type */}
                    <td className="p-3.5 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            item.type === "AUDIT"
                              ? "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100"
                              : item.type === "ALERT"
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                          }`}
                        >
                          {item.type === "AUDIT" ? (
                            <Sparkles className="w-4 h-4" />
                          ) : item.type === "ALERT" ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium px-2.5 py-1 rounded-md ${
                            item.type === "AUDIT"
                              ? "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100"
                              : item.type === "ALERT"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          }`}
                        >
                          {item.type === "AUDIT" ? "AI Audit" : item.type === "ALERT" ? "CRO Alert" : "Website"}
                        </span>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="p-3.5 align-middle max-w-md">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-semibold text-zinc-900 leading-snug">{item.title}</p>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" title="Unread" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">{item.message}</p>
                    </td>

                    {/* Target Website */}
                    <td className="p-3.5 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-2 text-zinc-900 font-medium">
                        <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span>{item.target}</span>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="p-3.5 align-middle text-zinc-600 whitespace-nowrap" suppressHydrationWarning>
                      {formatDate(item.date)}
                    </td>

                    {/* Action */}
                    <td className="p-3.5 align-middle text-right whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        <Link
                          href={item.url}
                          onClick={() => handleItemView(item)}
                          className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination (Same exact pagination as AI Audits page) */}
        <div className="p-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-[36px] px-2 bg-white border border-zinc-200 text-zinc-700 text-sm rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-zinc-500 ml-2 sm:ml-4">
              Showing {total === 0 ? 0 : startIndex + 1} to {endIndex} of {total}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || total === 0}
              className="px-3 h-[40px] flex items-center justify-center text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-[40px] h-[40px] flex items-center justify-center text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-indigo-50 text-indigo-600 font-bold"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return (
                  <span
                    key={`ellipsis-${pageNum}`}
                    className="w-[40px] h-[40px] flex items-center justify-center text-zinc-400"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || total === 0}
              className="px-3 h-[40px] flex items-center justify-center text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
