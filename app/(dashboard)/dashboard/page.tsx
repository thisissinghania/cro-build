import Link from "next/link";
import { redirect } from "next/navigation";
import {
  TrendingUp,
  ActivitySquare,
  MonitorSmartphone,
  Users,
  CreditCard,
  CheckCircle2,
  Globe,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { PlatformChart } from "@/components/dashboard/platform-chart";
import { UserChart } from "@/components/dashboard/user-chart";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function formatTimeAgo(date: Date | string) {
  const diffMs = new Date().getTime() - new Date(date).getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true, name: true, auditCredits: true },
  });

  if (!dbUser?.isActive) {
    redirect("/auth/login");
  }

  const role = dbUser.role || "USER";
  const userName = dbUser.name || session.user.name || session.user.email?.split("@")[0] || "User";

  // ADMIN DATA
  let adminIntegrationsCount = 0;
  let adminAuditsCount = 0;
  let adminRecentIntegrations: any[] = [];
  let adminRecentActivity: any[] = [];

  // USER DATA
  let userIntegrationsCount = 0;
  let userAuditsCount = 0;
  let latestAudit: any = null;
  let userAvgScore = 0;
  let userIntegrationsList: any[] = [];
  let userActivityList: any[] = [];
  let userWebsites: string[] = [];
  let userAuditsData: any[] = [];

  if (role === "ADMIN") {
    const [totalIntegrations, totalAudits, recentIntegrations, recentAudits] = await Promise.all([
      prisma.integration.count(),
      prisma.auditReport.count(),
      prisma.integration.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.auditReport.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    adminIntegrationsCount = totalIntegrations;
    adminAuditsCount = totalAudits;
    adminRecentIntegrations = recentIntegrations;

    adminRecentActivity = [
      ...recentAudits.map((a) => ({
        action: "AI CRO Audit Generated",
        user: `${a.websiteUrl} (${a.user?.name || a.user?.email || "User"})`,
        date: a.createdAt,
      })),
      ...recentIntegrations.map((i) => ({
        action: `New ${i.platformType} Connected`,
        user: `${i.websiteUrl} (${i.user?.name || i.user?.email || "User"})`,
        date: i.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  } else {
    const [integrations, totalIntegrations, audits] = await Promise.all([
      prisma.integration.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.integration.count({
        where: { userId: session.user.id, status: "ACTIVE" },
      }),
      prisma.auditReport.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    userIntegrationsCount = totalIntegrations;
    userAuditsCount = audits.length;
    userIntegrationsList = integrations;
    userWebsites = integrations.map((i) => i.websiteUrl);

    if (audits.length > 0) {
      latestAudit = audits[0];
      const sum = audits.reduce((acc, a) => acc + a.overallScore, 0);
      userAvgScore = Math.round(sum / audits.length);
    }

    userAuditsData = audits.map((a) => ({
      id: a.id,
      websiteUrl: a.websiteUrl,
      overallScore: a.overallScore,
      recommendationsCount: Array.isArray(a.recommendations) ? (a.recommendations as any[]).length : 0,
      createdAt: a.createdAt.toISOString(),
    }));

    userActivityList = [
      ...audits.map((a) => ({
        action: "AI CRO Audit Completed",
        target: `${a.websiteUrl} (Score: ${a.overallScore}/100)`,
        date: a.createdAt,
      })),
      ...integrations.map((i) => ({
        action: `Website Connected (${i.platformType === "SHOPIFY" ? "Shopify" : i.platformType === "GA4" ? "GA4" : "Custom"})`,
        target: i.websiteUrl,
        date: i.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Banner / Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute top-1/2 -translate-y-1/2 right-[-40px] opacity-15 pointer-events-none">
          <MonitorSmartphone className="w-[300px] h-[300px] text-white" />
        </div>

        <div className="relative z-10 w-full pr-24">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl mb-1">
            {role === "ADMIN" ? "Platform Overview" : `Welcome back, ${userName}! 👋`}
          </h1>
          <p className="text-[14px] text-white/90 truncate md:whitespace-normal">
            {role === "ADMIN"
              ? "Monitor all connected websites, track AI audit generations, and analyze global platform health in real-time."
              : "Track your conversion health, monitor active integrations, and review high-impact AI audit recommendations."}
          </p>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Integrations */}
        <div className="p-6 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500">
              {role === "ADMIN" ? "Total Integrations" : "Active Integrations"}
            </h3>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900">
            {role === "ADMIN" ? adminIntegrationsCount : userIntegrationsCount}
          </div>
          <p className="mt-2 text-sm text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {role === "ADMIN"
              ? "Platform websites connected"
              : userIntegrationsCount > 0
                ? `${userIntegrationsCount} website${userIntegrationsCount > 1 ? "s" : ""} active`
                : "No websites connected yet"}
          </p>
        </div>

        {/* Card 2: AI Audits */}
        <div className="p-6 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500">
              {role === "ADMIN" ? "AI Audits Generated" : "Your AI Audits"}
            </h3>
            <div className="p-2 bg-fuchsia-50 rounded-lg text-fuchsia-500">
              <ActivitySquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900">
            {role === "ADMIN" ? adminAuditsCount : userAuditsCount}
          </div>
          <p className="mt-2 text-sm text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {role === "ADMIN"
              ? "All-time AI reports"
              : latestAudit
                ? `Latest score: ${latestAudit.overallScore}/100`
                : "No audits generated yet"}
          </p>
        </div>

        {/* Card 3: CRO Health / MRR */}
        <div className="p-6 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-500">
              {role === "ADMIN" ? "Platform MRR" : "Avg. CRO Health"}
            </h3>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
              {role === "ADMIN" ? (
                <CreditCard className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="text-3xl font-bold text-zinc-900">
            {role === "ADMIN" ? "$18,450" : userAuditsCount > 0 ? `${userAvgScore}/100` : "N/A"}
          </div>
          <p className="mt-2 text-sm text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {role === "ADMIN"
              ? "+15% from last month"
              : latestAudit
                ? `Est. Loss: ${latestAudit.estimatedRevenueLoss}`
                : "Run audit to calculate"}
          </p>
        </div>
      </div>

      {/* Two Column Layout for Monitoring */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Integrations */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">
                {role === "ADMIN" ? "Recent Platform Integrations" : "Your Connected Websites"}
              </h2>
            </div>
            <Link
              href="/dashboard/integrations?tab=list"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-zinc-100">
            {role === "ADMIN" ? (
              adminRecentIntegrations.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-500">No platform integrations found.</div>
              ) : (
                adminRecentIntegrations.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-900 mb-0.5">{item.websiteUrl}</h3>
                      <p className="text-xs text-zinc-500">
                        {item.user?.name || item.user?.email || "Unknown User"} • {item.platformType}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 px-2.5 bg-zinc-50 rounded-lg border border-zinc-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <p className="text-xs text-zinc-700 font-medium">
                        {item.auditsGenerated || 0} Audits
                      </p>
                    </div>
                  </div>
                ))
              )
            ) : userIntegrationsList.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">
                <p className="mb-2">No connected websites yet.</p>
                <Link
                  href="/dashboard/integrations?tab=list"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Connect your first website <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              userIntegrationsList.map((item) => (
                <Link
                  key={item.id}
                  href="/dashboard/integrations?tab=list"
                  className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 mb-0.5 group-hover:text-indigo-600 transition-colors">{item.websiteUrl}</h3>
                      <p className="text-xs text-zinc-500">
                        Platform: <span className="font-medium text-zinc-700">{item.platformType === "SHOPIFY" ? "Shopify" : item.platformType === "GA4" ? "Google Analytics 4" : "Custom URL"}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 px-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <p className="text-xs text-emerald-700 font-medium">
                      {item.auditsGenerated > 0 ? "Audit Completed" : "Ready to Audit"}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Activity */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <ActivitySquare className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">
                {role === "ADMIN" ? "Platform Activity" : "Recent Activity"}
              </h2>
            </div>
            <Link
              href="/dashboard/audits"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              View audits <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-zinc-100">
            {role === "ADMIN" ? (
              adminRecentActivity.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-500">No platform activity recorded yet.</div>
              ) : (
                adminRecentActivity.map((activity, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-zinc-900 mb-0.5">{activity.action}</h3>
                        <p className="text-xs text-zinc-500">{activity.user}</p>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-400 whitespace-nowrap font-medium">
                      {formatTimeAgo(activity.date)}
                    </div>
                  </div>
                ))
              )
            ) : userActivityList.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">
                <p className="mb-2">No recent activity recorded yet.</p>
                <Link
                  href="/dashboard/integrations?tab=list"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Run your first AI audit <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              userActivityList.map((activity, i) => (
                <Link
                  key={i}
                  href={activity.action.includes("Audit") ? "/dashboard/audits" : "/dashboard/integrations?tab=list"}
                  className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-zinc-900 mb-0.5 group-hover:text-indigo-600 transition-colors">{activity.action}</h3>
                      <p className="text-xs text-zinc-500">{activity.target}</p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 whitespace-nowrap font-medium">
                    {formatTimeAgo(activity.date)}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Full Width Chart Section */}
      {role === "ADMIN" ? (
        <PlatformChart />
      ) : (
        <UserChart websites={userWebsites} audits={userAuditsData} />
      )}
    </div>
  );
}

