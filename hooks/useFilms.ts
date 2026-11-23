"use client";

import { ApiResponse } from "@/types/api";
import { FilmReview } from "@/types/film";
import { CreateFilmReviewInput, UpdateFilmReviewInput } from "@/utils/validation";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

const API_URL = "/api/films";

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

const useFilmReviews = (): UseQueryResult<FilmReview[], Error> =>
  useQuery({ queryKey: ["films"], queryFn: () => request<FilmReview[]>(API_URL) });

const useFilmReviewById = (id: number): UseQueryResult<FilmReview, Error> =>
  useQuery({
    queryKey: ["films", id],
    queryFn: () => request<FilmReview>(`${API_URL}/${id}`),
    enabled: Number.isInteger(id) && id > 0,
  });

const useCreateFilmReview = (): UseMutationResult<{ id: number }, Error, CreateFilmReviewInput> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => request<{ id: number }>(API_URL, jsonInit("POST", data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["films"] }),
  });
};

const useUpdateFilmReview = (): UseMutationResult<
  number,
  Error,
  { id: number; data: UpdateFilmReviewInput }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => request<number>(`${API_URL}/${id}`, jsonInit("PUT", data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["films"] }),
  });
};

const useDeleteFilmReview = (): UseMutationResult<number, Error, number> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => request<number>(`${API_URL}/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["films"] }),
  });
};

export {
  useFilmReviews,
  useFilmReviewById,
  useCreateFilmReview,
  useUpdateFilmReview,
  useDeleteFilmReview,
};
