"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { apiClient } from "@/lib/api";
import { CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const { isChecking } = useAuthGuard({ requireAuth: false });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isChecking) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiClient("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      router.push(CONFIG.ROUTES.LOGIN);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-800 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-4 pt-8">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            AP
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Account
          </CardTitle>
          <CardDescription className="text-slate-500">
            Register a new account to access the Academic Portal
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                className="border-slate-300 focus-visible:ring-blue-600 h-10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                className="border-slate-300 focus-visible:ring-blue-600 h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-8 pt-2">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 shadow-md transition-all cursor-pointer"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <p className="text-sm text-center text-slate-600">
              Already have an account?{" "}
              <Link
                href={CONFIG.ROUTES.LOGIN}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}