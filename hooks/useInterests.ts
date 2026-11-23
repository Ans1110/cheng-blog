"use client";

import { ApiResponse } from "@/types/api";
import { Interest } from "@/types/interest";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

const API_URL = "/api/interests";

const fetchInterests = async (): Promise<Interest[]> => {
  const res = await fetch(API_URL);
  const data: ApiResponse<Interest[]> = await res.json();
  if (!data.success) throw new Error(data.error || "Failed to fetch interests");
  return data.data || [];
};

const createInterest = async (name: string): Promise<number> => {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: { "Content-Type": "application/json" },
  });
  const response: ApiResponse<{ id: number }> = await res.json();
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to add interest");
  }
  return response.data.id;
};

const deleteInterest = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  const response: ApiResponse<number> = await res.json();
  if (!response.success) throw new Error(response.error || "Failed to delete interest");
};

const useInterests = (): UseQueryResult<Interest[], Error> =>
  useQuery({ queryKey: ["interests"], queryFn: fetchInterests });

const useCreateInterest = (): UseMutationResult<number, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInterest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["interests"] }),
  });
};

const useDeleteInterest = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInterest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["interests"] }),
  });
};

export { useInterests, useCreateInterest, useDeleteInterest };
