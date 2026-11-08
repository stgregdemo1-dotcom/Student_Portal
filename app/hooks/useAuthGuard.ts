"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseAuthGuardOptions {
  requiredPrefix?: string; // e.g., "TCH", "ST", "ADM", "REG"
  redirectTo?: string;     // default: "/portal/log-in"
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { requiredPrefix = "", redirectTo = "/portal/log-in" } = options;
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const getCookie = (name: string): string => {
    if (typeof document === "undefined") return "";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || "";
    return "";
  };

  useEffect(() => {
    const cachedUsername = getCookie("username");
    const upperUsername = cachedUsername ? cachedUsername.toUpperCase() : "";

    const isValidPrefix = requiredPrefix 
      ? upperUsername.startsWith(requiredPrefix.toUpperCase()) 
      : Boolean(cachedUsername);

    if (!cachedUsername || !isValidPrefix) {
      setIsAuthenticated(false);
      setLoading(false);
      router.push(redirectTo);
      return;
    }

    setUsername(cachedUsername);
    setIsAuthenticated(true);
    setLoading(false);
  }, [requiredPrefix, redirectTo, router]);

  return { username, isAuthenticated, loading };
}