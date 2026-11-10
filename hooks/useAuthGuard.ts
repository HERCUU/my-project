"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { CONFIG } from "@/lib/config";

interface UseAuthGuardOptions {
  requireAuth?: boolean;
  redirectTo?: string;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { requireAuth = true, redirectTo } = options;
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const authenticated = isAuthenticated();

    if (requireAuth && !authenticated) {
      router.replace(redirectTo || CONFIG.ROUTES.LOGIN);
    } else if (!requireAuth && authenticated) {
      router.replace(redirectTo || CONFIG.ROUTES.DASHBOARD);
    } else {
      setIsChecking(false);
    }
  }, [requireAuth, redirectTo, router]);

  return { isChecking };
}