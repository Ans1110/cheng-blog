export interface NoteCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
