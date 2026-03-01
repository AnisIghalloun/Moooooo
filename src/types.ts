export interface Mod {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  downloads: number;
  imageUrl: string;
  downloadUrl?: string;
  createdAt: string;
  longDescription?: string;
}

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
}
