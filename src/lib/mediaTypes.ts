export type MediaKind = "photo" | "video" | "document";

export interface MediaRef {
    id: string;
    type: MediaKind;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
}

export type MediaValue = MediaRef | string;

export const MAX_UPLOAD_BYTES = 1024 * 1024 * 1024;

export function isMediaRef(value: MediaValue): value is MediaRef {
    return typeof value !== "string";
}
