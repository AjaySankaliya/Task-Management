import Link from "next/link";
import { BarChart3, FolderKanban, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Team", href: "/team", icon: Users },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950/80 p-4 lg:flex lg:flex-col">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sm font-semibold text-sky-300">
          TF
        </div>
        <div>
          <p className="text-sm font-semibold text-white">TaskFlow</p>
          <p className="text-xs text-slate-400">Workspace</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white",
              href === "/dashboard" && "bg-slate-800 text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <p className="text-sm font-medium text-white">Project health</p>
        <p className="mt-2 text-2xl font-semibold text-sky-300">84%</p>
        <p className="mt-1 text-xs text-slate-400">On track this sprint</p>

        <Button variant="secondary" className="mt-4 w-full justify-center">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
