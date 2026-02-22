import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Play, Image as ImageIcon, Trash2, HardDrive } from "lucide-react";
import { toast } from "sonner";
import { storage, MediaData } from "@/lib/storage";

interface MediaUploadProps {
  ownerId: string;
  onMediaAdded?: () => void;
}

export default function MediaUpload({ ownerId, onMediaAdded }: MediaUploadProps) {
  const [media, setMedia] = useState<MediaData[]>(storage.getMediaByOwnerId(ownerId));
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");

        if (!isVideo && !isImage) {
          toast.error(`${file.name} is not a valid image or video`);
          continue;
        }

        // Check file size (max 150MB)
        if (file.size > 150 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 150MB)`);
          continue;
        }

        try {
          toast.loading(`Uploading ${file.name}...`);
          const reader = new FileReader();

          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;

            if (isImage) {
              const mediaData: MediaData = {
                id: crypto.randomUUID(),
                ownerId,
                type: "photo",
                data: dataUrl,
                fileName: file.name,
                uploadedAt: new Date().toISOString(),
              };
              try {
                storage.addMedia(mediaData);
                setMedia(storage.getMediaByOwnerId(ownerId));
                onMediaAdded?.();
                toast.dismiss();
                toast.success(`Photo uploaded: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
              } catch (error) {
                toast.dismiss();
                toast.error(`Failed to save ${file.name}. Try deleting old media or refresh the page.`);
              }
            } else {
              const mediaData: MediaData = {
                id: crypto.randomUUID(),
                ownerId,
                type: "video",
                data: dataUrl,
                fileName: file.name,
                uploadedAt: new Date().toISOString(),
              };
              try {
                storage.addMedia(mediaData);
                setMedia(storage.getMediaByOwnerId(ownerId));
                onMediaAdded?.();
                toast.dismiss();
                toast.success(`Video uploaded: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
              } catch (error) {
                toast.dismiss();
                toast.error(`Failed to save ${file.name}. Try deleting old media or refresh the page.`);
              }
            }
          };

          reader.onerror = () => {
            toast.dismiss();
            toast.error(`Failed to read ${file.name}`);
          };

          reader.readAsDataURL(file);
        } catch (error) {
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

  const handleDelete = (mediaId: string) => {
    storage.deleteMedia(mediaId);
    setMedia(storage.getMediaByOwnerId(ownerId));
    setSelectedMedia(prev => {
      const newSet = new Set(prev);
      newSet.delete(mediaId);
      return newSet;
    });
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

  const deleteSelectedMedia = () => {
    selectedMedia.forEach(mediaId => {
      storage.deleteMedia(mediaId);
    });
    setMedia(storage.getMediaByOwnerId(ownerId));
    setSelectedMedia(new Set());
    toast.success(`Deleted ${selectedMedia.size} item(s)`);
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
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  title="Select photos and videos to upload"
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
                  JPG, PNG, MP4, MOV, WebM (max 150MB each, no compression)
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
                    className={`relative cursor-pointer transition-all ${
                      selectedMedia.has(item.id) ? 'ring-2 ring-blue-500 rounded-lg' : ''
                    }`}
                    onClick={() => toggleMediaSelection(item.id)}
                  >
                    {item.type === "photo" ? (
                      <img
                        src={item.data}
                        alt={item.fileName}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="relative w-full h-32 bg-black rounded-lg border flex items-center justify-center">
                        <video
                          src={item.data}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Play className="absolute h-8 w-8 text-white pointer-events-none" />
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
                      ) : (
                        <>
                          <Play className="h-3 w-3" /> Video
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
