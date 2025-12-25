import { ApiResponse } from "@/types/api";
import { CreateLearning, Learning, UpdateLearning } from "@/types/learning";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

const API_URL = "/api/learning";

const fetchLearning = async (): Promise<Learning[]> => {
  const res = await fetch(API_URL);
  const data: ApiResponse<Learning[]> = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch learning");
  }

  return data.data || [];
};

const fetchLearningById = async (id: number): Promise<Learning> => {
  const res = await fetch(`${API_URL}/${id}`);
  const data: ApiResponse<Learning> = await res.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || "Failed to fetch learning");
  }

  return data.data;
};

const createLearning = async (data: CreateLearning): Promise<number> => {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response: ApiResponse<{ id: number }> = await res.json();

  if (!response.success || !response.data?.id) {
    throw new Error(response.error || "Failed to create learning");
  }

  return response.data.id;
};

const updateLearning = async ({
  id,
  data,
}: {
  id: number;
  data: UpdateLearning;
}): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response: ApiResponse<void> = await res.json();

  if (!response.success) {
    throw new Error(response.error || "Failed to update learning");
  }
};

const deleteLearning = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  const response: ApiResponse<void> = await res.json();

  if (!response.success) {
    throw new Error(response.error || "Failed to delete learning");
  }
};

const useLearning = (): UseQueryResult<Learning[], Error> => {
  return useQuery({
    queryKey: ["learning"],
    queryFn: fetchLearning,
  });
};

const useLearningById = (id: number): UseQueryResult<Learning, Error> => {
  return useQuery({
    queryKey: ["learning", id],
    queryFn: () => fetchLearningById(id),
    enabled: !!id,
  });
};

const useCreateLearning = (): UseMutationResult<
  number,
  Error,
  CreateLearning
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLearning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning"] });
    },
  });
};

const useUpdateLearning = (): UseMutationResult<
  void,
  Error,
  { id: number; data: UpdateLearning }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLearning }) =>
      updateLearning({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning"] });
    },
  });
};

const useDeleteLearning = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLearning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning"] });
    },
  });
};

export {
  useLearning,
  useLearningById,
  useCreateLearning,
  useUpdateLearning,
  useDeleteLearning,
};
