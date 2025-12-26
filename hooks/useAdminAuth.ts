"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

const AUTH_QUERY_KEY = ["auth", "check"];

const checkAuthFn = async (): Promise<boolean> => {
  const res = await fetch("/api/auth/check");
  const data = await res.json();
  return data.success && data.data.authenticated;
};

const loginFn = async (password: string): Promise<boolean> => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ password }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error("Login failed");
  }
  return true;
};

const logoutFn = async (): Promise<void> => {
  await fetch("/api/auth/logout", {
    method: "POST",
  });
};

const useAdminAuth = (redirectOnFail: boolean = true) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: isAuthenticated = false,
    isLoading,
    refetch: checkAuth,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: checkAuthFn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: loginFn,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, true);
    },
    onError: (error) => {
      toast.error((error as Error).message || "Login failed");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutFn,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, false);
      router.push("/admin/login");
    },
    onError: (error) => {
      toast.error((error as Error).message || "Logout failed");
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectOnFail) {
      router.push("/admin/login");
    }
  }, [isLoading, isAuthenticated, redirectOnFail, router]);

  const login = async (password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync(password);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      toast.error((error as Error).message || "Logout failed");
      return false;
    }
  };

  return {
    isAuthenticated,
    isLoading,
    checkAuth,
    login,
    logout,
  };
};

export default useAdminAuth;
export { useAdminAuth };
