import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, FolderKanban, LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
];

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 px-4 py-2 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
        {/* Left */}
          <Link href="/dashboard" className="flex items-center gap-3 w-36">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sm font-bold text-sky-300">TF</div>
            <span className="hidden text-sm font-semibold text-white sm:inline">TaskFlow</span>
          </Link>

        {/* Center (nav) */}
        <nav className="hidden flex-1 justify-center md:flex">
          <div className="flex gap-2 whitespace-nowrap">
            {navItems.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2 justify-end w-36">
          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
            <Bell className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white md:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="gap-2 rounded-xl border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 hover:bg-slate-800">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-300">{initials}</div>
                <span className="hidden text-sm font-medium sm:inline">{user?.name || "User"}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile menu */}
      <nav className={`mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-2 md:hidden ${mobileMenuOpen ? "flex" : "hidden"}`}>
        <div className="flex flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default DashboardHeader;
