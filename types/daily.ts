export interface DailyImage {
  url: string;
  caption: string;
}

export interface DailyPost {
  id: number;
  title: string;
  content: string;
  images: DailyImage[];
  createdAt: string;
  updatedAt: string;
}
