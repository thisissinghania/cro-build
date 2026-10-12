"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuditsAction, deleteAuditAction } from "@/actions/audits";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { AuditReportView } from "./audit-report-view";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  Globe,
  Loader2,
  Download,
} from "lucide-react";

export function AuditsClient({ role = "USER" }: { role?: string }) {
  const [audits, setAudits] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search State
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [pendingFromDate, setPendingFromDate] = useState("");
  const [pendingToDate, setPendingToDate] = useState("");

  // Modals
  const [selectedAuditForView, setSelectedAuditForView] = useState<any | null>(null);
  const [selectedAuditForDelete, setSelectedAuditForDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    const skip = (currentPage - 1) * itemsPerPage;
    const result = await getAuditsAction({
      skip,
      take: itemsPerPage,
      search: debouncedSearch,
      from: fromDate,
      to: toDate,
    });

    if (result.data) {
      setAudits(result.data.audits);
      setTotal(result.data.total);
    }
    setLoading(false);
  }, [currentPage, itemsPerPage, debouncedSearch, fromDate, toDate]);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!selectedAuditForDelete) return;
    setIsDeleting(true);
    const res = await deleteAuditAction(selectedAuditForDelete.id);
    setIsDeleting(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setSelectedAuditForDelete(null);
      fetchAudits();
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(dateString));
  };

  const totalPages = Math.ceil(total / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, total);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "UI_UX":
        return "UI & UX Friction";
      case "CHECKOUT":
        return "Checkout Drop-off";
      case "SPEED":
        return "Speed & Loading";
      case "PRICING":
        return "Pricing & Bundles";
      case "COPYWRITING":
        return "Copy & Trust";
      default:
        return category;
    }
  };

  if (selectedAuditForView) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <AuditReportView
          report={selectedAuditForView}
          showReanalyze={false}
          onBack={() => setSelectedAuditForView(null)}
          formatDate={formatDate}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 relative">
        
        {/* Header & Controls */}
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-t-2xl">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">AI Audits</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage AI-generated conversion rate optimization reports.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${loading ? "text-indigo-500 animate-pulse" : "text-zinc-400"}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audits..."
                className="w-full sm:w-[250px] pl-9 pr-4 h-[48px] bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setPendingFromDate(fromDate);
                  setPendingToDate(toDate);
                  setIsFilterOpen(!isFilterOpen);
                }}
                className={`relative flex items-center justify-center w-[48px] h-[48px] bg-white border rounded-lg transition-colors cursor-pointer ${
                  fromDate || toDate
                    ? "border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                }`}
                title="Filter by Date"
              >
                <Filter className="w-5 h-5" />
                {(fromDate || toDate) && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-indigo-50"></span>
                )}
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-[340px] bg-white border border-zinc-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-zinc-900 mb-3">Date Range</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-sm text-zinc-600 mb-1.5 block">From</span>
                          <input
                            type="date"
                            value={pendingFromDate}
                            onChange={(e) => setPendingFromDate(e.target.value)}
                            className="w-full h-[48px] px-3 text-sm bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div>
                          <span className="text-sm text-zinc-600 mb-1.5 block">To</span>
                          <input
                            type="date"
                            value={pendingToDate}
                            onChange={(e) => setPendingToDate(e.target.value)}
                            className="w-full h-[48px] px-3 text-sm bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2 pt-5 border-t border-zinc-100">
                      <button
                        onClick={() => {
                          setPendingFromDate("");
                          setPendingToDate("");
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

        {/* Audits Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-sm text-zinc-500 font-medium bg-zinc-50/50">
                <th className="px-6 py-4">Audit Report</th>
                <th className="px-6 py-4">Website / Link</th>
                {role === "ADMIN" && <th className="px-6 py-4">Requested By</th>}
                <th className="px-6 py-4">Date &amp; Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={role === "ADMIN" ? 6 : 5} className="px-6 py-12 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading audits...
                  </td>
                </tr>
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={role === "ADMIN" ? 6 : 5} className="px-6 py-12 text-center text-zinc-500">
                    No AI audits found. Go to Integrations and run an audit on your website.
                  </td>
                </tr>
              ) : (
                audits.map((audit, index) => {
                  const displayIndex = total - (startIndex + index);
                  return (
                    <tr key={audit.id} className="hover:bg-zinc-50/60 transition-colors group">
                      {/* Audit Report Title & Score */}
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900">
                              CRO Audit #{1000 + displayIndex}
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5">
                              Health Score: <span className="font-semibold text-indigo-600">{audit.overallScore}/100</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Website Domain */}
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2 text-zinc-900 font-medium">
                          <Globe className="w-4 h-4 text-zinc-400" />
                          <span>{audit.websiteUrl}</span>
                        </div>
                      </td>

                      {/* Requested By (ADMIN ONLY) */}
                      {role === "ADMIN" && (
                        <td className="px-6 py-4 align-middle">
                          <div>
                            <div className="font-medium text-zinc-900">{audit.user?.name || "Unknown"}</div>
                            <div className="text-xs text-zinc-500 mt-0.5">{audit.user?.email || "No email"}</div>
                          </div>
                        </td>
                      )}

                      {/* Date & Time */}
                      <td className="px-6 py-4 align-middle text-zinc-600 whitespace-nowrap" suppressHydrationWarning>
                        {formatDate(audit.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 align-middle">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Audit */}
                          <button
                            onClick={() => setSelectedAuditForView(audit)}
                            className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                            title="View Full Audit"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Download Excel */}
                          <a
                            href={`/api/audit/${audit.id}/export`}
                            download
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                            title="Download Excel Report"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          {/* Delete Audit */}
                          <button
                            onClick={() => setSelectedAuditForDelete(audit)}
                            className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            title="Delete Audit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination */}
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
                  <span key={`ellipsis-${pageNum}`} className="w-[40px] h-[40px] flex items-center justify-center text-zinc-400">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || total === 0}
              className="px-3 h-[40px] flex items-center justify-center text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>



      {/* DELETE CONFIRMATION MODAL */}
      {selectedAuditForDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedAuditForDelete(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-rose-50 text-rose-600 mb-5 mx-auto border border-rose-100">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 text-center mb-3">Delete Audit</h3>
            <p className="text-[16px] text-zinc-600 text-center mb-8 leading-relaxed">
              Are you sure you want to delete this AI CRO Audit report for <strong className="text-zinc-900 font-semibold">{selectedAuditForDelete.websiteUrl}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedAuditForDelete(null)}
                disabled={isDeleting}
                className="flex-1 h-[48px] text-[16px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 h-[48px] text-[16px] font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
