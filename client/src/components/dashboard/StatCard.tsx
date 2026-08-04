import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  trend,
  icon,
}: {
  label: string;
  value: string;
  trend: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/80">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-xs text-emerald-400">{trend}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
