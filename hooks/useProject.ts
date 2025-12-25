import { ApiResponse } from "@/types/api";
import { CreateProject, Project, UpdateProject } from "@/types/project";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

const API_URL = "/api/projects";

const fetchProjects = async (): Promise<Project[]> => {
  const res = await fetch(API_URL);
  const data: ApiResponse<Project[]> = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch projects");
  }

  return data.data || [];
};

const fetchProjectById = async (id: number): Promise<Project> => {
  const res = await fetch(`${API_URL}/${id}`);
  const data: ApiResponse<Project> = await res.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || "Failed to fetch project");
  }

  return data.data;
};

const createProject = async (data: CreateProject): Promise<number> => {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response: ApiResponse<{ id: number }> = await res.json();

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create project");
  }

  return response.data.id;
};

const updateProject = async ({
  id,
  data,
}: {
  id: number;
  data: UpdateProject;
}) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response: ApiResponse<void> = await res.json();

  if (!response.success) {
    throw new Error(response.error || "Failed to update project");
  }
};

const deleteProject = async (id: number) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  const response: ApiResponse<void> = await res.json();

  if (!response.success) {
    throw new Error(response.error || "Failed to delete project");
  }
};

const useProjects = (): UseQueryResult<Project[], Error> => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
};

const useProjectById = (id: number): UseQueryResult<Project, Error> => {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProjectById(id),
    enabled: !!id,
  });
};

const useCreateProject = (): UseMutationResult<
  number,
  Error,
  CreateProject
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

const useUpdateProject = (): UseMutationResult<
  void,
  Error,
  { id: number; data: UpdateProject }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProject }) =>
      updateProject({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

const useDeleteProject = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export {
  useProjects,
  useProjectById,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
};
