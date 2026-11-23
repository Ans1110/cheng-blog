"use client";

import { ApiResponse } from "@/types/api";
import type { IveVideo, IveVideoMeta } from "@/types/ive";
import type {
  CreateIveVideoInput,
  IveCoverInput,
  UpdateIveVideoInput,
} from "@/utils/validation";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

const API_URL = "/api/ive";

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

const useIveVideos = (): UseQueryResult<IveVideo[], Error> =>
  useQuery({ queryKey: ["ive"], queryFn: () => request<IveVideo[]>(API_URL) });

/** Looks a link up on YouTube / Bilibili without saving it. */
const usePreviewIveVideo = (): UseMutationResult<IveVideoMeta, Error, string> =>
  useMutation({
    mutationFn: (url) => request<IveVideoMeta>(`${API_URL}/preview`, jsonInit("POST", { url })),
  });

const useCreateIveVideo = (): UseMutationResult<{ id: number }, Error, CreateIveVideoInput> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => request<{ id: number }>(API_URL, jsonInit("POST", data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ive"] }),
  });
};

const useUpdateIveVideo = (): UseMutationResult<
  number,
  Error,
  { id: number; data: UpdateIveVideoInput }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => request<number>(`${API_URL}/${id}`, jsonInit("PUT", data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ive"] }),
  });
};

const useDeleteIveVideo = (): UseMutationResult<number, Error, number> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => request<number>(`${API_URL}/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ive"] }),
  });
};

export type IveCover = { coverUrl: string | null; position: { x: number; y: number } };

const useIveCover = (): UseQueryResult<IveCover, Error> =>
  useQuery({ queryKey: ["ive", "cover"], queryFn: () => request<IveCover>(`${API_URL}/cover`) });

const useUpdateIveCover = (): UseMutationResult<IveCover, Error, IveCoverInput> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => request<IveCover>(`${API_URL}/cover`, jsonInit("PUT", input)),
    onSuccess: (data) => queryClient.setQueryData(["ive", "cover"], data),
  });
};

export {
  useIveCover,
  useUpdateIveCover,
  useIveVideos,
  usePreviewIveVideo,
  useCreateIveVideo,
  useUpdateIveVideo,
  useDeleteIveVideo,
};
