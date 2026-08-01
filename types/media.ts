export type GalleryMedia = {
  id: string;
  mediaType: string | null;
  previewUrl: string;
};

export type GalleryCategory = {
  name: string;
  items: GalleryMedia[];
};
