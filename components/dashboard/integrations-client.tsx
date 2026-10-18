"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  getIntegrationsAction,
  createIntegrationAction,
  deleteIntegrationAction,
  runAnalysisAction,
  getLatestAuditReportAction,
  getDailyAuditUsageAction,
} from "@/actions/integrations";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { toast } from "sonner";
import { AuditReportView } from "./audit-report-view";
import { isValidWebsiteUrl } from "@/lib/validations/integration";
import {
  Search,
  Link as LinkIcon,
  ShoppingBag,
  BarChart3,
  RefreshCw,
  Loader2,
  Globe,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  LayoutTemplate,
  Zap,
  Clock,
  Smartphone,
  Image as ImageIcon,
  Megaphone,
  Calendar,
  AlertTriangle,
  Bot,
  Sparkles,
  Gauge,
  MonitorSmartphone,
  ChevronRight,
  Filter,
  Download,
  Eye,
  FileSpreadsheet,
  Check,
  Trash2
} from "lucide-react";

export function IntegrationsClient({
  role = "USER",
  initialReport = null,
  initialTab = "latest",
}: {
  role?: string;
  initialReport?: any | null;
  initialTab?: "latest" | "list";
}) {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlToAnalyze, setUrlToAnalyze] = useState("");
  const urlScannerRef = useRef<HTMLDivElement>(null);
  const analyzeBtnRef = useRef<HTMLButtonElement>(null);

  // Click outside to close URL scanner input
  useEffect(() => {
    if (!showUrlInput) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        urlScannerRef.current?.contains(target) ||
        analyzeBtnRef.current?.contains(target)
      ) {
        return;
      }
      setShowUrlInput(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowUrlInput(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showUrlInput]);

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [pendingFromDate, setPendingFromDate] = useState("");
  const [pendingToDate, setPendingToDate] = useState("");
  const [platformType, setPlatformType] = useState("ALL");
  const [pendingPlatformType, setPendingPlatformType] = useState("ALL");

  // Modals & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopifyModalOpen, setShopifyModalOpen] = useState(false);
  const [shopifyUrl, setShopifyUrl] = useState("");

  const [ga4ModalOpen, setGa4ModalOpen] = useState(false);
  const [ga4WebsiteUrl, setGa4WebsiteUrl] = useState("");

  // Concurrency state: Only 1 website analysis allowed at a time
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const isAnyAnalyzing = analyzingId !== null || integrations.some((i) => i.status === "SYNCING");

  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab");

  // Tab State: 'latest' | 'list'
  const [activeTab, setActiveTab] = useState<'latest' | 'list'>(() => {
    if (role === "ADMIN") return "list";
    if (queryTab === "list") return "list";
    if (queryTab === "latest") return "latest";
    return initialTab === "list" ? "list" : "latest";
  });

  useEffect(() => {
    if (role === "ADMIN") return;
    if (queryTab === "list") {
      setActiveTab("list");
    } else if (queryTab === "latest") {
      setActiveTab("latest");
    }
  }, [queryTab, role]);

  const handleTabSwitch = (tab: "latest" | "list") => {
    setActiveTab(tab);
    if (tab === "latest" && !latestReport && role === "USER") {
      loadLatestReport();
    }
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Audit Report State
  const [latestReport, setLatestReport] = useState<any | null>(initialReport);
  const [loadingReport, setLoadingReport] = useState(false);

  // Daily Audit Usage (3 per day limit for USER role)
  const [dailyUsage, setDailyUsage] = useState<{ usedToday: number; limit: number; remaining: number; isAdmin: boolean }>({
    usedToday: 0,
    limit: 3,
    remaining: 3,
    isAdmin: role === "ADMIN",
  });

  const fetchDailyUsage = useCallback(async () => {
    if (role === "ADMIN") return;
    const res = await getDailyAuditUsageAction();
    if (res?.success && res.data) {
      setDailyUsage(res.data);
    }
  }, [role]);

  useEffect(() => {
    fetchDailyUsage();
  }, [fetchDailyUsage]);

  const loadLatestReport = useCallback(async (integrationId?: string) => {
    setLoadingReport(true);
    const res = await getLatestAuditReportAction(integrationId);
    if (res?.data) {
      setLatestReport(res.data);
    }
    setLoadingReport(false);
  }, []);

  useEffect(() => {
    if (!initialReport && role === "USER") {
      loadLatestReport();
    }
  }, [loadLatestReport, role, initialReport]);

  const handleRunAnalysis = async (integrationId: string) => {
    if (isAnyAnalyzing) return;
    setAnalyzingId(integrationId);
    const result = await runAnalysisAction(integrationId);
    setAnalyzingId(null);
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success("AI CRO audit generated successfully!");
      if (result.auditReport) {
        setLatestReport(result.auditReport);
      } else {
        await loadLatestReport(integrationId);
      }
      handleTabSwitch('latest');
      fetchDailyUsage();
    }
    fetchIntegrations();
  };

  const handleAnalyzeUrl = async () => {
    if (!isValidWebsiteUrl(urlToAnalyze)) return;
    setIsSubmitting(true);
    const result = await createIntegrationAction({
      websiteUrl: urlToAnalyze.trim(),
      platformType: "CUSTOM_URL"
    });
    setIsSubmitting(false);
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success("Website connected successfully!");
      setUrlToAnalyze("");
      setShowUrlInput(false);
      handleTabSwitch("list");
      fetchIntegrations();
    }
  };

  const handleConnectShopify = async () => {
    if (!shopifyUrl) return;
    setIsSubmitting(true);

    // Sanitize the URL (remove spaces, http://, https://, and trailing slashes)
    let cleanUrl = shopifyUrl.trim().replace(/\s+/g, "").replace(/^https?:\/\//, "").replace(/\/+$/, "");

    // Format the shopify URL
    const formattedUrl = cleanUrl.includes("myshopify.com") ? cleanUrl : `${cleanUrl}.myshopify.com`;

    // Redirect to our backend OAuth initiation route
    window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(formattedUrl)}`;
  };

  const handleConnectGA4 = async () => {
    const cleanUrl = ga4WebsiteUrl.trim();
    if (!cleanUrl || !isValidWebsiteUrl(cleanUrl)) {
      toast.error("Please enter a valid website URL for this GA4 property.");
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200)); // Simulate Google OAuth delay
    const result = await createIntegrationAction({
      websiteUrl: cleanUrl,
      platformType: "GA4",
    });
    setIsSubmitting(false);
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success("Google Analytics 4 connected successfully!");
      setGa4ModalOpen(false);
      setGa4WebsiteUrl("");
      handleTabSwitch("list");
      fetchIntegrations();
    }
  };

  const handleDeleteIntegration = async (id: string, url: string) => {
    if (
      !confirm(
        `Are you sure you want to disconnect ${url}? All associated audit data for this integration will be removed.`
      )
    ) {
      return;
    }
    setIsSubmitting(true);
    const res = await deleteIntegrationAction(id);
    setIsSubmitting(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Website disconnected successfully.");
      fetchIntegrations();
      if (latestReport?.integrationId === id) {
        setLatestReport(null);
      }
    }
  };

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    const skip = (currentPage - 1) * itemsPerPage;
    const result = await getIntegrationsAction({
      skip,
      take: itemsPerPage,
      search: debouncedSearch,
      from: fromDate,
      to: toDate,
      platformType: platformType,
    });

    if (result.data) {
      setIntegrations(result.data.integrations);
      setTotal(result.data.total);
    }
    setLoading(false);
  }, [currentPage, itemsPerPage, debouncedSearch, fromDate, toDate, platformType]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const totalPages = Math.ceil(total / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, total);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(dateString));
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "GA4":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">GA4</span>;
      case "SHOPIFY":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Shopify</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-amber-50 text-amber-700 border border-amber-100">Link</span>;
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* WHITE BLOCK CONTAINER */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 relative">

        {/* HEADER: Title on Left, Buttons on Right */}
        <div className="p-6 border-b border-zinc-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900">
                {role === "ADMIN" ? "Platform Integrations" : "Integrations & Audits"}
              </h1>
              {role === "USER" && (
                <span
                  className={`inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-[4px] text-xs font-semibold border ${dailyUsage.usedToday >= 3
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Daily Limit: {dailyUsage.usedToday}/3 Audits
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              {role === "ADMIN" ? "Manage all connected websites across the platform." : "Manage connected websites and view your latest AI audit reports."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {role === "USER" && (
              <>
                <button
                  ref={analyzeBtnRef}
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  disabled={isAnyAnalyzing}
                  className="flex items-center gap-2 h-[48px] px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LinkIcon className="h-4 w-4" />
                  Analyze URL
                </button>

                <button
                  onClick={() => setShopifyModalOpen(true)}
                  disabled={isAnyAnalyzing}
                  className="flex items-center gap-2 h-[48px] px-4 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Connect Shopify
                </button>

                <button
                  onClick={() => setGa4ModalOpen(true)}
                  disabled={isAnyAnalyzing}
                  className="flex items-center gap-2 h-[48px] px-4 bg-[#E37400] text-white rounded-lg text-sm font-medium hover:bg-[#c26300] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BarChart3 className="h-4 w-4" />
                  Connect GA4
                </button>
              </>
            )}

            {role === "ADMIN" && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${loading ? 'text-indigo-500 animate-pulse' : 'text-zinc-400'}`} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search integrations..."
                    className="w-full sm:w-[250px] pl-9 pr-4 h-[48px] bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setPendingFromDate(fromDate);
                      setPendingToDate(toDate);
                      setPendingPlatformType(platformType);
                      setIsFilterOpen(!isFilterOpen);
                    }}
                    className={`relative flex items-center justify-center w-[48px] h-[48px] bg-white border rounded-lg transition-colors cursor-pointer ${fromDate || toDate || platformType !== 'ALL'
                      ? 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                      : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                      }`}
                  >
                    <Filter className="w-5 h-5" />
                    {(fromDate || toDate || platformType !== 'ALL') && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-indigo-50"></span>
                    )}
                  </button>

                  {isFilterOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-[360px] bg-white border border-zinc-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                        <div className="mb-5">
                          <label className="block text-sm font-semibold text-zinc-900 mb-3">Integration Type</label>
                          <select
                            value={pendingPlatformType}
                            onChange={(e) => setPendingPlatformType(e.target.value)}
                            className="w-full h-[48px] px-3 text-sm bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                          >
                            <option value="ALL">All Integrations</option>
                            <option value="CUSTOM_URL">Link</option>
                            <option value="SHOPIFY">Shopify</option>
                            <option value="GA4">GA4</option>
                          </select>
                        </div>

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
                              setPendingPlatformType("ALL");
                              setFromDate("");
                              setToDate("");
                              setPlatformType("ALL");
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
                              setPlatformType(pendingPlatformType);
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
            )}
          </div>
        </div>

        {/* URL SCANNER SECTION (FULL WIDTH) */}
        {showUrlInput && (
          <div
            ref={urlScannerRef}
            className="p-6 border-b border-zinc-100 bg-zinc-50/50 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <div className="w-full">
              <label className="block text-sm font-semibold text-zinc-900 mb-2">Enter Website URL to Analyze</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className={`h-5 w-5 transition-colors ${urlToAnalyze.trim()
                      ? isValidWebsiteUrl(urlToAnalyze)
                        ? "text-emerald-500"
                        : "text-rose-400"
                      : "text-zinc-400"
                      }`} />
                  </div>
                  <input
                    type="text"
                    className={`block w-full pl-12 pr-10 h-[48px] border rounded-lg text-sm bg-white transition-all outline-none ${urlToAnalyze.trim() && !isValidWebsiteUrl(urlToAnalyze)
                      ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : isValidWebsiteUrl(urlToAnalyze)
                        ? "border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        : "border-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      }`}
                    placeholder="https://yourwebsite.com or example.com"
                    value={urlToAnalyze}
                    onChange={(e) => setUrlToAnalyze(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isValidWebsiteUrl(urlToAnalyze) && !isSubmitting) {
                        handleAnalyzeUrl();
                      }
                    }}
                    autoFocus
                  />
                  {isValidWebsiteUrl(urlToAnalyze) && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAnalyzeUrl}
                  disabled={isSubmitting || !isValidWebsiteUrl(urlToAnalyze)}
                  className="w-full sm:w-auto h-[48px] px-8 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Scan Now"}
                </button>
              </div>
              {urlToAnalyze.trim().length > 0 && !isValidWebsiteUrl(urlToAnalyze) && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Please enter a valid website URL (e.g. example.com or https://example.com)
                </p>
              )}
            </div>
          </div>
        )}

        {/* TABS */}
        {role === "USER" && (
          <div className="px-6 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleTabSwitch('latest')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'latest' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
              >
                Latest Analyzed Data
              </button>
              <button
                onClick={() => handleTabSwitch('list')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${activeTab === 'list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
              >
                Total Integrations
              </button>
            </div>
          </div>
        )}

        {/* TAB CONTENT */}
        <div className="p-6">
          {activeTab === 'latest' ? (
            <AuditReportView
              report={latestReport}
              loading={loadingReport}
              onGoToIntegrations={() => handleTabSwitch('list')}
              onReanalyze={handleRunAnalysis}
              isAnalyzing={isAnyAnalyzing}
              formatDate={formatDate}
            />
          ) : (
            <div className="space-y-4">
              {/* Integrations Table */}
              <div className="border border-zinc-200/60 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50/50 border-b border-zinc-100 text-zinc-500 font-medium">
                      <tr>
                        <th className="p-3.5">Website / Link</th>
                        <th className="p-3.5">{role === "ADMIN" ? "Integration Type" : "Platform"}</th>
                        {role === "ADMIN" && <th className="p-3.5">User</th>}
                        <th className="p-3.5">Connected On</th>
                        {role === "ADMIN" && <th className="p-3.5 text-center">Audits Generated</th>}
                        {role === "USER" && <th className="p-3.5 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {loading ? (
                        <tr>
                          <td colSpan={role === "ADMIN" ? 5 : 4} className="p-3.5 py-12 text-center text-zinc-500">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                            Loading integrations...
                          </td>
                        </tr>
                      ) : integrations.length === 0 ? (
                        <tr>
                          <td colSpan={role === "ADMIN" ? 5 : 4} className="p-3.5 py-12 text-center text-zinc-500">
                            No integrations found. Connect a platform or analyze a URL to get started.
                          </td>
                        </tr>
                      ) : (
                        integrations.map((integration) => {
                          const isThisAnalyzing = analyzingId === integration.id || integration.status === "SYNCING";
                          const isRowDisabled = isAnyAnalyzing && !isThisAnalyzing;

                          return (
                            <tr key={integration.id} className="hover:bg-zinc-50/60 transition-colors group">
                              <td className="p-3.5 align-middle">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                                    <Globe className="w-4 h-4" />
                                  </div>
                                  <span className="font-medium text-zinc-900">{integration.websiteUrl}</span>
                                </div>
                              </td>
                              <td className="p-3.5 align-middle">
                                {getPlatformBadge(integration.platformType)}
                              </td>
                              {role === "ADMIN" && (
                                <td className="p-3.5 align-middle">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-zinc-900">{integration.user?.name || "Unknown"}</span>
                                    <span className="text-xs text-zinc-500">{integration.user?.email || "No email"}</span>
                                  </div>
                                </td>
                              )}
                              <td className="p-3.5 align-middle text-zinc-500 whitespace-nowrap">
                                {formatDate(integration.createdAt)}
                              </td>
                              {role === "ADMIN" && (
                                <td className="p-3.5 align-middle text-center">
                                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs border border-zinc-200">
                                    {integration.auditsGenerated || 0}
                                  </span>
                                </td>
                              )}
                              {role === "USER" && (
                                <td className="p-3.5 align-middle text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {integration.auditsGenerated === 0 ? (
                                      <button
                                        onClick={() => handleRunAnalysis(integration.id)}
                                        disabled={isAnyAnalyzing}
                                        title={isRowDisabled ? "Another analysis is currently in progress. Please wait until it completes." : undefined}
                                        className={`inline-flex items-center justify-center gap-2 h-[38px] px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${isThisAnalyzing
                                          ? "bg-indigo-500 text-white cursor-wait opacity-90"
                                          : isRowDisabled
                                            ? "bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-60"
                                            : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] cursor-pointer"
                                          }`}
                                      >
                                        {isThisAnalyzing ? (
                                          <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            Analyzing...
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles className="w-4 h-4" />
                                            Analyze Now
                                          </>
                                        )}
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleRunAnalysis(integration.id)}
                                        disabled={isAnyAnalyzing}
                                        title={isRowDisabled ? "Another analysis is currently in progress. Please wait until it completes." : undefined}
                                        className={`inline-flex items-center justify-center gap-2 h-[38px] px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${isThisAnalyzing
                                          ? "bg-indigo-50 text-indigo-600 border border-indigo-200 cursor-wait opacity-90"
                                          : isRowDisabled
                                            ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed opacity-60"
                                            : "bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 active:scale-[0.98] cursor-pointer"
                                          }`}
                                      >
                                        {isThisAnalyzing ? (
                                          <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                                            Analyzing...
                                          </>
                                        ) : (
                                          <>
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            Re-Analyze
                                          </>
                                        )}
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteIntegration(integration.id, integration.websiteUrl)}
                                      disabled={isThisAnalyzing || isSubmitting}
                                      title="Disconnect and remove this website"
                                      className="inline-flex items-center justify-center w-[38px] h-[38px] text-zinc-400 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
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
                            className={`w-[40px] h-[40px] flex items-center justify-center text-sm font-medium rounded-lg transition-colors cursor-pointer ${currentPage === pageNum
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
                      disabled={currentPage === totalPages || total === 0}
                      className="px-3 h-[40px] flex items-center justify-center text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SHOPIFY OAUTH SIMULATION MODAL */}
      {shopifyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShopifyModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 text-center border-b border-zinc-100">
              <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Connect Shopify</h3>
              <p className="text-sm text-zinc-500">Enable deep E-commerce analytics by connecting your website.</p>
            </div>

            <div className="p-6 bg-zinc-50 flex flex-col gap-4">
              <div className="text-left">
                <label className="block text-[14px] font-semibold text-gray-700 mb-3">Shopify Website URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="text"
                    value={shopifyUrl}
                    onChange={(e) => setShopifyUrl(e.target.value)}
                    placeholder="your-website-name"
                    className="w-full h-[48px] pl-10 pr-4 border border-zinc-200 rounded-lg text-[16px] focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleConnectShopify}
                  disabled={isSubmitting || !shopifyUrl}
                  className="w-full h-[48px] px-4 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center justify-center shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Install App"}
                </button>
                <button
                  onClick={() => setShopifyModalOpen(false)}
                  disabled={isSubmitting}
                  className="w-full h-[48px] px-4 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GA4 OAUTH SIMULATION MODAL */}
      {ga4ModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setGa4ModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 text-center border-b border-zinc-100">
              <div className="w-16 h-16 rounded-full bg-[#E37400]/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-[#E37400]" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Connect Google Analytics</h3>
              <p className="text-sm text-zinc-500">Authorize CRO Platform to read your traffic and conversion data securely via Google.</p>
            </div>
            <div className="p-6 bg-zinc-50 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">Connected Website URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="text"
                    value={ga4WebsiteUrl}
                    onChange={(e) => setGa4WebsiteUrl(e.target.value)}
                    placeholder="example.com or https://example.com"
                    className="w-full h-[48px] pl-10 pr-4 border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-[#E37400] focus:border-[#E37400] outline-none bg-white transition-colors"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1.5">Enter the exact website domain tracked by your Google Analytics property.</p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleConnectGA4}
                  disabled={isSubmitting || !ga4WebsiteUrl.trim()}
                  className="w-full h-[48px] px-4 text-sm font-medium text-white bg-[#4285F4] rounded-lg hover:bg-[#3367D6] flex items-center justify-center shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in & Connect GA4"}
                </button>
                <button
                  onClick={() => setGa4ModalOpen(false)}
                  disabled={isSubmitting}
                  className="w-full h-[48px] px-4 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


