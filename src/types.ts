export interface Note {
  id: string;
  title: string;
  content: string;
  path: string;
  tags: string[];
  lastModified: string;
  category: string;
  coverImage?: string;
}

export interface Folder {
  name: string;
  children: (Folder | Note)[];
}

export function isFolder(item: Folder | Note): item is Folder {
  return (item as Folder).children !== undefined;
}
