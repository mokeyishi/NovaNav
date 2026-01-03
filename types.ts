
export interface Bookmark {
  id: string;
  name: string;
  url: string;
  description: string;
  icon: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  iconType: 'all' | 'tools' | 'media' | 'resources' | 'misc';
}
