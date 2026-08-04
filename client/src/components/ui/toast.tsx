"use client";

import * as React from "react";
import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="dark"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-50 group-[.toaster]:border-slate-700 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-slate-300",
          actionButton: "group-[.toast]:bg-sky-500 group-[.toast]:text-slate-950",
          cancelButton: "group-[.toast]:bg-slate-800 group-[.toast]:text-slate-100",
        },
      }}
    />
  );
}
