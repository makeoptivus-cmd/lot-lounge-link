import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Play, Image as ImageIcon, Trash2, CheckCircle, HardDrive, FileText } from "lucide-react";
import { toast } from "sonner";
import { indexedDBStorage } from "@/lib/indexedDBStorage";
import { MAX_UPLOAD_BYTES, MediaValue, MediaRef, isMediaRef } from "@/lib/mediaTypes";

interface SectionMediaUploadProps {
  photos: MediaValue[];
  videos: MediaValue[];
  documents?: MediaValue[];
  onPhotosChange: (photos: MediaValue[]) => void;
  onVideosChange: (videos: MediaValue[]) => void;
  onDocumentsChange?: (documents: MediaValue[]) => void;
  label?: string;
  ownerId?: string;
}

export default function SectionMediaUpload({
  photos,
  videos,
  documents,
  onPhotosChange,
  onVideosChange,
  onDocumentsChange,
  label = "Upload Photos & Videos",
  ownerId,
}: SectionMediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(new Set());
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlMapRef = useRef(new Map<string, string>());
  const documentsList = documents ?? [];

  useEffect(() => {
    let isActive = true;
    const allMedia = [...photos, ...videos];

    const loadPreviews = async () => {
      for (const item of allMedia) {
        if (!isMediaRef(item)) {
          continue;
        }
        if (item.type !== "photo" && item.type !== "video") {
          continue;
        }
        if (previewUrlMapRef.current.has(item.id)) {
          continue;
        }

        try {
          const stored = await indexedDBStorage.getMediaFile(item.id);
          if (!stored || !isActive) {
            continue;
          }
          const url = URL.createObjectURL(stored.data);
          previewUrlMapRef.current.set(item.id, url);
          setPreviewUrls(prev => ({ ...prev, [item.id]: url }));
        } catch (error) {
          console.error("Failed to load media preview:", error);
        }
      }
    };

    loadPreviews();

    return () => {
      isActive = false;
    };
  }, [photos, videos]);

  useEffect(() => {
    return () => {
      previewUrlMapRef.current.forEach(url => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      previewUrlMapRef.current.clear();
    };
  }, []);

  const getFileKind = (file: File) => {
    if (file.type.startsWith("image/")) return "photo" as const;
    if (file.type.startsWith("video/")) return "video" as const;

    const docMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "application/rtf",
    ];
    const docExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".rtf"];
    const hasDocExtension = docExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (docMimeTypes.includes(file.type) || hasDocExtension) return "document" as const;
    return null;
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const kind = getFileKind(file);

        if (!kind) {
          toast.error(`${file.name} is not a supported file`);
          continue;
        }

        if (file.size > MAX_UPLOAD_BYTES) {
          toast.error(`${file.name} is too large (max 1GB)`);
          continue;
        }

        let mediaId = "";
        try {
          toast.loading(`Uploading ${file.name}...`);
          if (kind === "document" && !onDocumentsChange) {
            toast.dismiss();
            toast.error("Document upload is not enabled for this form");
            continue;
          }
          mediaId = crypto.randomUUID();
          const uploadedAt = new Date().toISOString();

          await indexedDBStorage.addMediaFile({
            id: mediaId,
            ownerId: ownerId || "form",
            type: kind,
            data: file,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt,
            mimeType: file.type || "application/octet-stream",
          });

          const mediaRef: MediaRef = {
            id: mediaId,
            type: kind,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || "application/octet-stream",
            uploadedAt,
          };

          if (kind === "photo") {
            onPhotosChange([...photos, mediaRef]);
          } else if (kind === "video") {
            onVideosChange([...videos, mediaRef]);
          } else if (onDocumentsChange) {
            onDocumentsChange([...documentsList, mediaRef]);
          }

          if (kind === "photo" || kind === "video") {
            const previewUrl = URL.createObjectURL(file);
            previewUrlMapRef.current.set(mediaId, previewUrl);
            setPreviewUrls(prev => ({ ...prev, [mediaId]: previewUrl }));
          }

          toast.dismiss();
          toast.success(`${kind === "photo" ? "Photo" : kind === "video" ? "Video" : "Document"} uploaded: ${formatBytes(file.size)}`);
        } catch (error) {
          if (mediaId) {
            await indexedDBStorage.deleteMediaFile(mediaId);
            const previewUrl = previewUrlMapRef.current.get(mediaId);
            if (previewUrl) {
              if (previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
              }
              previewUrlMapRef.current.delete(mediaId);
            }
          }
          toast.dismiss();
          toast.error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error('File processing error:', error);
        }
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeletePhoto = (idx: number) => {
    const media = photos[idx];
    onPhotosChange(photos.filter((_, i) => i !== idx));
    if (media && isMediaRef(media)) {
      indexedDBStorage.deleteMediaFile(media.id);
      const previewUrl = previewUrlMapRef.current.get(media.id);
      if (previewUrl) {
        if (previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
        previewUrlMapRef.current.delete(media.id);
        setPreviewUrls(prev => {
          const next = { ...prev };
          delete next[media.id];
          return next;
        });
      }
    }
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      newSet.delete(idx);
      return newSet;
    });
    toast.success("Photo removed");
  };

  const handleDeleteVideo = (idx: number) => {
    const media = videos[idx];
    onVideosChange(videos.filter((_, i) => i !== idx));
    if (media && isMediaRef(media)) {
      indexedDBStorage.deleteMediaFile(media.id);
      const previewUrl = previewUrlMapRef.current.get(media.id);
      if (previewUrl) {
        if (previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
        previewUrlMapRef.current.delete(media.id);
        setPreviewUrls(prev => {
          const next = { ...prev };
          delete next[media.id];
          return next;
        });
      }
    }
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      newSet.delete(idx);
      return newSet;
    });
    toast.success("Video removed");
  };

  const handleDeleteDocument = (idx: number) => {
    if (!onDocumentsChange) return;
    const media = documentsList[idx];
    onDocumentsChange(documentsList.filter((_, i) => i !== idx));
    if (media && isMediaRef(media)) {
      indexedDBStorage.deleteMediaFile(media.id);
    }
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      newSet.delete(idx);
      return newSet;
    });
    toast.success("Document removed");
  };

  const togglePhotoSelection = (idx: number) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const toggleVideoSelection = (idx: number) => {
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const toggleDocumentSelection = (idx: number) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const deleteSelectedMedia = () => {
    const photosToDelete = Array.from(selectedPhotos).sort((a, b) => b - a);
    const videosToDelete = Array.from(selectedVideos).sort((a, b) => b - a);
    const documentsToDelete = Array.from(selectedDocuments).sort((a, b) => b - a);

    let newPhotos = [...photos];
    photosToDelete.forEach(idx => {
      newPhotos.splice(idx, 1);
    });
    onPhotosChange(newPhotos);

    let newVideos = [...videos];
    videosToDelete.forEach(idx => {
      newVideos.splice(idx, 1);
    });
    onVideosChange(newVideos);

    if (onDocumentsChange && documentsToDelete.length > 0) {
      let newDocuments = [...documentsList];
      documentsToDelete.forEach(idx => {
        const media = newDocuments[idx];
        if (media && isMediaRef(media)) {
          indexedDBStorage.deleteMediaFile(media.id);
        }
        newDocuments.splice(idx, 1);
      });
      onDocumentsChange(newDocuments);
    }

    setSelectedPhotos(new Set());
    setSelectedVideos(new Set());
    setSelectedDocuments(new Set());
    toast.success(`Deleted ${photosToDelete.length + videosToDelete.length + documentsToDelete.length} items`);
  };

  const getTotalSize = () => {
    let totalBytes = 0;
    photos.forEach(photo => {
      if (isMediaRef(photo)) {
        totalBytes += photo.fileSize;
      } else {
        totalBytes += (photo.length * 3) / 4;
      }
    });
    videos.forEach(video => {
      if (isMediaRef(video)) {
        totalBytes += video.fileSize;
      } else {
        totalBytes += (video.length * 3) / 4;
      }
    });
    documentsList.forEach(doc => {
      if (isMediaRef(doc)) {
        totalBytes += doc.fileSize;
      } else {
        totalBytes += (doc.length * 3) / 4;
      }
    });
    return totalBytes;
  };

  const getTotalSizeMB = () => {
    return (getTotalSize() / (1024 * 1024)).toFixed(2);
  };

  const mediaCount = photos.length + videos.length + documentsList.length;

  const resolvePreviewUrl = (item: MediaValue) => {
    if (!isMediaRef(item)) return item;
    return previewUrls[item.id];
  };

  const handleOpenDocument = async (media: MediaValue) => {
    if (!isMediaRef(media)) return;
    try {
      const stored = await indexedDBStorage.getMediaFile(media.id);
      if (!stored) {
        toast.error("Document not found");
        return;
      }
      const url = URL.createObjectURL(stored.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = media.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to open document");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Storage Info */}
          {mediaCount > 0 && (
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <HardDrive className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900">Full Quality Storage</p>
                    <p className="text-blue-700 text-xs mt-1">
                      Photos: Stored in full quality, up to 1GB each
                    </p>
                    <p className="text-blue-700 text-xs">
                      Videos: Stored without compression, up to 1GB each
                    </p>
                    <p className="text-blue-700 text-xs">
                      Documents: Stored locally, up to 1GB each
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">High Quality Files</p>
                    <ul className="text-green-700 text-xs mt-1 space-y-1">
                      <li>No compression applied</li>
                      <li>Original quality preserved</li>
                      <li>Maximum file size: 1GB each</li>
                      <li>Videos play without quality loss</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div>
            <Label htmlFor="section-media-input" className="block mb-2">
              {label}
            </Label>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                ref={fileInputRef}
                id="section-media-input"
                type="file"
                multiple
                accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/rtf"
                onChange={handleFileSelect}
                className="hidden"
                title="Select files to upload"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                variant="outline"
                className="gap-2"
                title="Select files to upload"
                aria-label="Select files to upload"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Select Files"}
              </Button>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Photos: {photos.length} | Videos: {videos.length} | Docs: {documentsList.length}
                  </span>
                </div>
                <div className={`text-xs font-medium ${parseFloat(getTotalSizeMB()) > 900 ? 'text-orange-600' : 'text-green-600'}`}>
                  Total Size: {getTotalSizeMB()} MB
                  {parseFloat(getTotalSizeMB()) > 900 && ' Approaching upload limit - consider removing old media'}
                </div>
              </div>
            </div>
          </div>

          {/* Display media */}
          {mediaCount > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Attached Media ({mediaCount})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {/* Photos */}
                {photos.map((photo, idx) => (
                  <div
                    key={`photo-${idx}`}
                    className={`relative cursor-pointer transition-all ${selectedPhotos.has(idx) ? 'ring-2 ring-blue-500 rounded-lg' : ''
                      }`}
                    onClick={() => togglePhotoSelection(idx)}
                  >
                    {resolvePreviewUrl(photo) ? (
                      <img
                        src={resolvePreviewUrl(photo)}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-input"
                      />
                    ) : (
                      <div className="w-full h-32 rounded-lg border border-input bg-muted/40" />
                    )}
                    {/* Checkbox */}
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedPhotos.has(idx)}
                        onChange={() => togglePhotoSelection(idx)}
                        className="w-4 h-4 cursor-pointer"
                        title="Select photo for deletion"
                      />
                    </div>
                    {/* Type badge */}
                    <div className="absolute top-1 left-1 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" /> Photo
                    </div>
                  </div>
                ))}

                {/* Videos */}
                {videos.map((video, idx) => (
                  <div
                    key={`video-${idx}`}
                    className={`relative cursor-pointer transition-all ${selectedVideos.has(idx) ? 'ring-2 ring-blue-500 rounded-lg' : ''
                      }`}
                    onClick={() => toggleVideoSelection(idx)}
                  >
                    <div className="relative w-full h-32 bg-black rounded-lg border border-input flex items-center justify-center overflow-hidden">
                      {resolvePreviewUrl(video) && (
                        <video
                          src={resolvePreviewUrl(video)}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <Play className="absolute h-8 w-8 text-white pointer-events-none" />
                    </div>
                    {/* Checkbox */}
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedVideos.has(idx)}
                        onChange={() => toggleVideoSelection(idx)}
                        className="w-4 h-4 cursor-pointer"
                        title="Select video for deletion"
                      />
                    </div>
                    {/* Type badge */}
                    <div className="absolute top-1 left-1 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <Play className="h-3 w-3" /> Video
                    </div>
                  </div>
                ))}
              </div>

              {/* Documents */}
              {documentsList.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase">Documents ({documentsList.length})</h5>
                  <div className="space-y-2">
                    {documentsList.map((doc, idx) => (
                      <div
                        key={`doc-${idx}`}
                        className={`flex items-center justify-between gap-3 rounded-lg border border-input p-3 ${selectedDocuments.has(idx) ? "ring-2 ring-blue-500" : ""
                          }`}
                        onClick={() => toggleDocumentSelection(idx)}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div className="text-xs">
                            <p className="font-medium text-foreground">
                              {isMediaRef(doc) ? doc.fileName : `Document ${idx + 1}`}
                            </p>
                            <p className="text-muted-foreground">
                              {isMediaRef(doc) ? formatBytes(doc.fileSize) : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDocument(doc);
                            }}
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            className="text-xs text-red-600 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(idx);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delete Management Section */}
              {(selectedPhotos.size > 0 || selectedVideos.size > 0 || selectedDocuments.size > 0) && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-red-900">Delete Management</p>
                      <p className="text-xs text-red-700 mt-1">
                        {selectedPhotos.size + selectedVideos.size + selectedDocuments.size} item(s) selected
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={deleteSelectedMedia}
                      className="gap-2"
                      title="Delete selected media"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
