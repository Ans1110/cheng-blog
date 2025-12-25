export interface Learning {
  id: number;
  year: number;
  title: string;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLearning {
  year: number;
  title: string;
  skills: string[];
}

export interface UpdateLearning {
  year?: number;
  title?: string;
  skills?: string[];
}
