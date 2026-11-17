"use client";

import type { BoardPage, BoardMessage } from "@/types/board";
import type { CreateBoardMessageInput } from "@/utils/validation";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

const API_URL = "/api/board";
const KEY = ["board"];

type Envelope<T> = { success: boolean; data?: T; error?: string; message?: string };

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body: Envelope<T> = await res.json();
  if (!body.success || body.data === undefined) {
    // Rate-limit responses use `message` instead of `error`.
    throw new Error(body.error || body.message || "Request failed");
  }
  return body.data;
}

const useBoardMessages = () =>
  useInfiniteQuery({
    queryKey: KEY,
    queryFn: ({ pageParam }) =>
      request<BoardPage>(pageParam ? `${API_URL}?before=${pageParam}` : API_URL),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => last.nextCursor,
  });

const useCreateBoardMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBoardMessageInput) =>
      request<BoardMessage>(API_URL, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    // Put the new message at the top right away instead of refetching every page.
    onSuccess: (message) =>
      queryClient.setQueryData<InfiniteData<BoardPage, number | null>>(KEY, (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((p, i) => (i === 0 ? { ...p, items: [message, ...p.items] } : p)),
            }
          : old,
      ),
  });
};

const useDeleteBoardMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => request<number>(`${API_URL}/${id}`, { method: "DELETE" }),
    onSuccess: (_, id) =>
      queryClient.setQueryData<InfiniteData<BoardPage, number | null>>(KEY, (old) =>
        old
          ? { ...old, pages: old.pages.map((p) => ({ ...p, items: p.items.filter((m) => m.id !== id) })) }
          : old,
      ),
  });
};

export { useBoardMessages, useCreateBoardMessage, useDeleteBoardMessage };
