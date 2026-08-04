import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { AppToaster } from "@/components/ui/toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <AppToaster />
      </body>
    </html>
  );
}