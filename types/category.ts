export interface NoteCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
}

export interface UpdateNoteCategory {
  name?: string;
  description?: string | null;
  icon?: string | null;
}
