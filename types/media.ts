export type GalleryMedia = {
  id: string;
  mediaType: string | null;
  previewUrl: string;
};

export type GalleryCategory = {
  name: string;
  items: GalleryMedia[];
};

export type DeliveryType = "print" | "digital";

export type SelectionState = {
  favorited: boolean;
  inAlbum: boolean;
  clientNote: string;
  deliveryType: DeliveryType | null;
};
