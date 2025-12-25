export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string | null;
  projectUrl: string | null;
  githubUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateProject {
  title: string;
  description: string;
  tags: string[];
  imageUrl?: string | null;
  projectUrl?: string | null;
  githubUrl?: string | null;
}

export interface UpdateProject {
  title?: string;
  description?: string;
  tags?: string[];
  imageUrl?: string | null;
  projectUrl?: string | null;
  githubUrl?: string | null;
}
