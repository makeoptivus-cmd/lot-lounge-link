import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Play, Image as ImageIcon, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { storage, MediaData } from "@/lib/storage";
import { indexedDBStorage } from "@/lib/indexedDBStorage";
import { MAX_UPLOAD_BYTES } from "@/lib/mediaTypes";

interface MediaUploadProps {
  ownerId: string;
  onMediaAdded?: () => void;
}

export default function MediaUpload({ ownerId, onMediaAdded }: MediaUploadProps) {
  const [media, setMedia] = useState<MediaData[]>(storage.getMediaByOwnerId(ownerId));
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlMapRef = useRef(new Map<string, string>());

  useEffect(() => {
    let isActive = true;

    const loadPreviews = async () => {
      for (const item of media) {
        if (item.type === "photo" || item.type === "video") {
          if (previewUrlMapRef.current.has(item.id)) {
            continue;
          }

          try {
            const stored = await indexedDBStorage.getMediaFile(item.id);
            if (stored && isActive) {
              const url = URL.createObjectURL(stored.data);
              previewUrlMapRef.current.set(item.id, url);
              setPreviewUrls(prev => ({ ...prev, [item.id]: url }));
              continue;
            }

            const legacyData = (item as { data?: string }).data;
            if (legacyData && isActive) {
              previewUrlMapRef.current.set(item.id, legacyData);
              setPreviewUrls(prev => ({ ...prev, [item.id]: legacyData }));
            }
          } catch (error) {
            console.error("Failed to load media preview:", error);
          }
        }
      }
    };

    loadPreviews();

    return () => {
      isActive = false;
    };
  }, [media]);

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
          mediaId = crypto.randomUUID();
          const uploadedAt = new Date().toISOString();

          await indexedDBStorage.addMediaFile({
            id: mediaId,
            ownerId,
            type: kind,
            data: file,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt,
            mimeType: file.type || "application/octet-stream",
          });

          const mediaData: MediaData = {
            id: mediaId,
            ownerId,
            type: kind,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt,
            mimeType: file.type || "application/octet-stream",
          };

          storage.addMedia(mediaData);
          setMedia(storage.getMediaByOwnerId(ownerId));
          onMediaAdded?.();

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

  const handleDelete = async (mediaId: string) => {
    await indexedDBStorage.deleteMediaFile(mediaId);
    storage.deleteMedia(mediaId);
    setMedia(storage.getMediaByOwnerId(ownerId));
    setSelectedMedia(prev => {
      const newSet = new Set(prev);
      newSet.delete(mediaId);
      return newSet;
    });
    const previewUrl = previewUrlMapRef.current.get(mediaId);
    if (previewUrl) {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      previewUrlMapRef.current.delete(mediaId);
      setPreviewUrls(prev => {
        const next = { ...prev };
        delete next[mediaId];
        return next;
      });
    }
    toast.success("Media deleted");
  };

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMedia(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId);
      } else {
        newSet.add(mediaId);
      }
      return newSet;
    });
  };

  const deleteSelectedMedia = async () => {
    for (const mediaId of selectedMedia) {
      await indexedDBStorage.deleteMediaFile(mediaId);
      storage.deleteMedia(mediaId);
      const previewUrl = previewUrlMapRef.current.get(mediaId);
      if (previewUrl) {
        if (previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
        previewUrlMapRef.current.delete(mediaId);
      }
    }
    setMedia(storage.getMediaByOwnerId(ownerId));
    setSelectedMedia(new Set());
    toast.success(`Deleted ${selectedMedia.size} item(s)`);
  };

  const handleOpenDocument = async (mediaId: string, fileName: string) => {
    try {
      const stored = await indexedDBStorage.getMediaFile(mediaId);
      if (!stored) {
        toast.error("Document not found");
        return;
      }
      const url = URL.createObjectURL(stored.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to open document");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="media-input">Upload Photos & Videos</Label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  id="media-input"
                  type="file"
                  multiple
                  accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/rtf"
                  onChange={handleFileSelect}
                  className="hidden"
                  title="Select files to upload"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  variant="outline"
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Select Files"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  JPG, PNG, MP4, MOV, WebM, PDF, DOC, DOCX (max 1GB each, stored locally)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display media */}
      {media.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">Uploaded Media ({media.length})</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className={`relative cursor-pointer transition-all ${selectedMedia.has(item.id) ? 'ring-2 ring-blue-500 rounded-lg' : ''
                      }`}
                    onClick={() => toggleMediaSelection(item.id)}
                  >
                    {item.type === "photo" ? (
                      previewUrls[item.id] ? (
                        <img
                          src={previewUrls[item.id]}
                          alt={item.fileName}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-full h-32 rounded-lg border bg-muted/40" />
                      )
                    ) : item.type === "video" ? (
                      <div className="relative w-full h-32 bg-black rounded-lg border flex items-center justify-center">
                        {previewUrls[item.id] && (
                          <video
                            src={previewUrls[item.id]}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                        <Play className="absolute h-8 w-8 text-white pointer-events-none" />
                      </div>
                    ) : (
                      <div className="relative w-full h-32 bg-muted/40 rounded-lg border flex flex-col items-center justify-center gap-2 p-3 text-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.fileName}
                        </p>
                        <button
                          type="button"
                          className="text-xs text-blue-600 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDocument(item.id, item.fileName);
                          }}
                        >
                          Download
                        </button>
                      </div>
                    )}

                    {/* Checkbox */}
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedMedia.has(item.id)}
                        onChange={() => toggleMediaSelection(item.id)}
                        className="w-4 h-4 cursor-pointer"
                        title="Select media for deletion"
                      />
                    </div>

                    {/* Type badge */}
                    <div className="absolute top-1 left-1 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      {item.type === "photo" ? (
                        <>
                          <ImageIcon className="h-3 w-3" /> Photo
                        </>
                      ) : item.type === "video" ? (
                        <>
                          <Play className="h-3 w-3" /> Video
                        </>
                      ) : (
                        <>
                          <FileText className="h-3 w-3" /> Doc
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delete Management Section */}
              {selectedMedia.size > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-red-900">Delete Management</p>
                      <p className="text-xs text-red-700 mt-1">
                        {selectedMedia.size} item(s) selected
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
