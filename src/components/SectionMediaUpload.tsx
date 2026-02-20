import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Play, Image as ImageIcon, Trash2, CheckCircle, HardDrive, Zap } from "lucide-react";
import { toast } from "sonner";
import { compressImageAdvanced, compressVideoAdvanced, formatSize, calculateSavings } from "@/lib/mediaCompressionAdvanced";

interface SectionMediaUploadProps {
  photos: string[];
  videos: string[];
  onPhotosChange: (photos: string[]) => void;
  onVideosChange: (videos: string[]) => void;
  label?: string;
}

export default function SectionMediaUpload({
  photos,
  videos,
  onPhotosChange,
  onVideosChange,
  label = "Upload Photos & Videos",
}: SectionMediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
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

        // Check file size (max 500MB for upload attempt)
        if (file.size > 500 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 500MB)`);
          continue;
        }

        try {
          let dataUrl: string;
          let originalSize = file.size;
          let compressedSize = file.size;

          if (isImage) {
            // Auto-compress images aggressively
            toast.loading(`Compressing photo ${i + 1}/${files.length}...`);
            const result = await compressImageAdvanced(file, 0.65);
            dataUrl = result.dataUrl;
            originalSize = result.originalSize;
            compressedSize = result.compressedSize;
            
            const savings = calculateSavings(originalSize, compressedSize);
            toast.dismiss();
            toast.success(`Photo saved: ${formatSize(compressedSize)} (reduced ${savings.percentage.toFixed(0)}%)`);
            
            onPhotosChange([...photos, dataUrl]);
          } else {
            // Auto-compress videos aggressively
            toast.loading(`Processing video ${i + 1}/${files.length}...`);
            const result = await compressVideoAdvanced(file, 10);
            dataUrl = result.dataUrl;
            originalSize = result.originalSize;
            compressedSize = result.compressedSize;
            
            const savings = calculateSavings(originalSize, compressedSize);
            toast.dismiss();
            
            if (savings.percentage > 90) {
              toast.success(`Video optimized: ${formatSize(compressedSize)} (compressed ${savings.percentage.toFixed(0)}%)`);
            } else if (savings.percentage > 50) {
              toast.success(`Video saved: ${formatSize(compressedSize)} (reduced ${savings.percentage.toFixed(0)}%)`);
            } else {
              toast.warning(`Video stored: ${formatSize(compressedSize)}`);
            }
            
            onVideosChange([...videos, dataUrl]);
          }
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

  const handleDeletePhoto = (idx: number) => {
    onPhotosChange(photos.filter((_, i) => i !== idx));
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      newSet.delete(idx);
      return newSet;
    });
    toast.success("Photo removed");
  };

  const handleDeleteVideo = (idx: number) => {
    onVideosChange(videos.filter((_, i) => i !== idx));
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      newSet.delete(idx);
      return newSet;
    });
    toast.success("Video removed");
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

  const deleteSelectedMedia = () => {
    const photosToDelete = Array.from(selectedPhotos).sort((a, b) => b - a);
    const videosToDelete = Array.from(selectedVideos).sort((a, b) => b - a);

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

    setSelectedPhotos(new Set());
    setSelectedVideos(new Set());
    toast.success(`Deleted ${photosToDelete.length + videosToDelete.length} items`);
  };

  const getTotalSize = () => {
    let totalBytes = 0;
    photos.forEach(photo => {
      // Base64 is ~33% larger than binary data
      totalBytes += (photo.length * 3) / 4;
    });
    videos.forEach(video => {
      totalBytes += (video.length * 3) / 4;
    });
    return totalBytes;
  };

  const getTotalSizeMB = () => {
    return (getTotalSize() / (1024 * 1024)).toFixed(2);
  };

  const mediaCount = photos.length + videos.length;

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
                    <p className="font-semibold text-blue-900">🔄 Auto-Compression Active</p>
                    <p className="text-blue-700 text-xs mt-1">
                      ✅ Photos: Automatically compressed to 60% quality, max 800px
                    </p>
                    <p className="text-blue-700 text-xs">
                      ✅ Videos: Extracted as optimized previews (80%+ size reduction)
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">✨ Storage Tips</p>
                    <ul className="text-green-700 text-xs mt-1 space-y-1">
                      <li>✓ All files automatically compressed on upload</li>
                      <li>✓ No manual compression needed!</li>
                      <li>✓ Photos saved: ~200-400KB each after compression</li>
                      <li>✓ Videos saved as optimized previews</li>
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
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                title="Select photos and videos to upload"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                variant="outline"
                className="gap-2"
                title="Select photos and videos to upload"
                aria-label="Select photos and videos to upload"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Select Files"}
              </Button>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    📦 Photos: {photos.length} | 🎥 Videos: {videos.length}
                  </span>
                </div>
                <div className={`text-xs font-medium ${parseFloat(getTotalSizeMB()) > 7 ? 'text-orange-600' : 'text-green-600'}`}>
                  💾 Compressed Total: {getTotalSizeMB()} MB
                  {parseFloat(getTotalSizeMB()) > 7 && ' ⚠️ Getting large - delete old media if save fails'}
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
                    className={`relative cursor-pointer transition-all ${
                      selectedPhotos.has(idx) ? 'ring-2 ring-blue-500 rounded-lg' : ''
                    }`}
                    onClick={() => togglePhotoSelection(idx)}
                  >
                    <img
                      src={photo}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-input"
                    />
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
                    className={`relative cursor-pointer transition-all ${
                      selectedVideos.has(idx) ? 'ring-2 ring-blue-500 rounded-lg' : ''
                    }`}
                    onClick={() => toggleVideoSelection(idx)}
                  >
                    <div className="relative w-full h-32 bg-black rounded-lg border border-input flex items-center justify-center overflow-hidden">
                      <video
                        src={video}
                        className="w-full h-full object-cover"
                      />
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

              {/* Delete Management Section */}
              {(selectedPhotos.size > 0 || selectedVideos.size > 0) && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-red-900">Delete Management</p>
                      <p className="text-xs text-red-700 mt-1">
                        {selectedPhotos.size + selectedVideos.size} item(s) selected
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
