import { Bell, ChevronDown, LogOut, User } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur sm:px-6">
      <div className="text-lg font-semibold text-white">Dashboard</div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="gap-3 rounded-xl border border-slate-700 bg-slate-900 px-2.5 py-2 text-slate-100 hover:bg-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-300">
                {initials}
              </div>
              <span className="hidden text-sm font-medium sm:inline">{user?.name || "User"}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
