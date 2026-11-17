"use client";

import { ApiResponse } from "@/types/api";
import { DailyPost } from "@/types/daily";
import { CreateDailyPostInput, UpdateDailyPostInput } from "@/utils/validation";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

const API_URL = "/api/daily";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data: ApiResponse<T> = await res.json();
  if (!data.success || data.data === undefined) {
    throw new Error(data.error || "Request failed");
  }
  return data.data;
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
  headers: { "Content-Type": "application/json" },
});

const useDailyPosts = (): UseQueryResult<DailyPost[], Error> =>
  useQuery({ queryKey: ["daily"], queryFn: () => request<DailyPost[]>(API_URL) });

const useDailyPostById = (id: number): UseQueryResult<DailyPost, Error> =>
  useQuery({
    queryKey: ["daily", id],
    queryFn: () => request<DailyPost>(`${API_URL}/${id}`),
    enabled: Number.isInteger(id) && id > 0,
  });

const useCreateDailyPost = (): UseMutationResult<{ id: number }, Error, CreateDailyPostInput> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => request<{ id: number }>(API_URL, jsonInit("POST", data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daily"] }),
  });
};

const useUpdateDailyPost = (): UseMutationResult<
  number,
  Error,
  { id: number; data: UpdateDailyPostInput }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => request<number>(`${API_URL}/${id}`, jsonInit("PUT", data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daily"] }),
  });
};

const useDeleteDailyPost = (): UseMutationResult<number, Error, number> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => request<number>(`${API_URL}/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daily"] }),
  });
};

export {
  useDailyPosts,
  useDailyPostById,
  useCreateDailyPost,
  useUpdateDailyPost,
  useDeleteDailyPost,
};
