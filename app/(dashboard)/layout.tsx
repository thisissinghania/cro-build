import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarProvider } from "@/components/dashboard/sidebar-provider";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true },
  });

  if (!dbUser || !dbUser.isActive) {
    // If the user has been deactivated by an admin while logged in, kick them out
    redirect("/");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-zinc-50">
        {/* Sidebar - Fixed on the left */}
        <Sidebar userRole={dbUser.role} />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0">
          <Header />

          {/* Scrollable Main Area */}
          <main className="flex-1 overflow-y-auto bg-zinc-50/50">
            <div className="p-4 md:p-6 w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
