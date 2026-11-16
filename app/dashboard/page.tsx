"use client";

import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { clearTokens } from "@/lib/auth";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: true });

  if (isChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm font-medium text-slate-300">Verifying session...</p>
      </div>
    );
  }

  const handleLogout = () => {
    clearTokens();
    router.push(CONFIG.ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-10 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg shadow-inner">
              AP
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-none">
                Academic Portal
              </span>
              <span className="text-xs text-slate-400">Management System</span>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 font-medium shadow-sm transition-all cursor-pointer"
          >
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-6">
        {/* Hero Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-8 text-white shadow-lg border border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Authenticated Session Active
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-slate-300 mt-2 max-w-2xl text-sm leading-relaxed">
            You are securely logged in. Your active JWT session token is verified and stored in LocalStorage.
          </p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Security Status
              </CardDescription>
              <CardTitle className="text-xl text-slate-900">JWT Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Protected route guard is active and monitoring your session.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Database Connection
              </CardDescription>
              <CardTitle className="text-xl text-slate-900">MongoDB Online</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Backend API is synced and connected to port 5000.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                System Role
              </CardDescription>
              <CardTitle className="text-xl text-slate-900">Authorized User</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Full access to protected application routes and features.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}