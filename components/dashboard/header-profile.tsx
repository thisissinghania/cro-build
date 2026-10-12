import { User } from "lucide-react";

interface HeaderProfileProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export function HeaderProfile({ user }: HeaderProfileProps) {
  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const displayRole = user?.role ? user.role.toUpperCase() : "USER";

  return (
    <div className="flex items-center gap-3 pl-2 py-1">
      <div className="flex flex-col items-end text-right hidden sm:flex">
        <span className="text-sm font-semibold text-zinc-900 leading-none">
          {displayName}
        </span>
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-1">
          {displayRole}
        </span>
      </div>

      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
        <User className="w-4 h-4" />
      </div>
    </div>
  );
}
