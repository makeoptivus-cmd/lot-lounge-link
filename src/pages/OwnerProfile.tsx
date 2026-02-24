import { useState, useMemo, useEffect, useRef } from "react";
import { Users, MapPin, Eye, Handshake, Scale, UserCheck, Building, FileCheck, Search, ChevronDown, ChevronUp, Image as ImageIcon, Play, Trash2, Download, X, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import MediaUpload from "@/components/MediaUpload";
import EditableRecord from "@/components/EditableRecord";
import { storage, MediaData } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateOwnerProfilePDF, generateOwnerProfilePDFPreview, downloadCachedPDF } from "@/lib/pdfExport";
import { indexedDBStorage } from "@/lib/indexedDBStorage";
import { MediaValue, isMediaRef } from "@/lib/mediaTypes";

const sectionConfig = [
  { key: "owner", label: "Land Owner Details", icon: Users, stage: 1 },
  { key: "land", label: "Land Details", icon: MapPin, stage: 2 },
  { key: "site", label: "Site Visit", icon: Eye, stage: 3 },
  { key: "meeting", label: "Owner Meeting & Price", icon: Handshake, stage: 4 },
  { key: "mediation", label: "Mediation", icon: Scale, stage: 5 },
  { key: "buyer", label: "Buyer to Seller Meeting", icon: UserCheck, stage: 6 },
  { key: "place", label: "Meeting Place", icon: Building, stage: 7 },
  { key: "advance", label: "Advance & Registration", icon: FileCheck, stage: 8 },
] as const;

function formatTime12h(timeValue?: string) {
  if (!timeValue) return "";
  const [rawHours, rawMinutes] = timeValue.split(":");
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes ?? "0");
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return timeValue;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${period}`;
}

interface SectionHighlights {
  [recordId: string]: "orange" | "red" | "";
}

function CollapsibleSection({
  icon: Icon,
  stage,
  title,
  count,
  children,
  defaultOpen = true,
}: {
  icon: any;
  stage: number;
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold",
            `bg-[hsl(var(--stage-${stage}))]`
          )}
        >
          {stage}
        </div>
        <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
        <span className="font-display font-semibold text-foreground flex-1">{title}</span>
        {count > 0 && (
          <Badge variant="secondary" className="mr-2">
            {count} record{count !== 1 ? "s" : ""}
          </Badge>
        )}
        {count === 0 && <span className="mr-2 text-xs text-muted-foreground">No records</span>}
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {open && count > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="border-t pt-4 pb-4 space-y-3">{children}</CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function MediaViewerModal({
  media,
  isOpen,
  onClose,
}: {
  media: { type: "photo" | "video"; url: string; fileName: string } | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!media) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogClose className="absolute right-4 top-4" />
        {media.type === "photo" ? (
          <div className="flex flex-col gap-3">
            <img src={media.url} alt={media.fileName} className="w-full h-auto rounded-lg" />
            <p className="text-sm text-muted-foreground">📷 {media.fileName}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <video src={media.url} controls className="w-full h-auto rounded-lg bg-black" />
            <p className="text-sm text-muted-foreground">🎥 {media.fileName}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SectionMediaGrid({
  photos,
  videos,
  documents,
  onDeletePhoto,
  onDeleteVideo,
  onDeleteDocument,
}: {
  photos: MediaValue[];
  videos: MediaValue[];
  documents?: MediaValue[];
  onDeletePhoto: (idx: number) => void;
  onDeleteVideo: (idx: number) => void;
  onDeleteDocument?: (idx: number) => void;
}) {
  const [viewingMedia, setViewingMedia] = useState<{
    type: "photo" | "video";
    url: string;
    fileName: string;
  } | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(new Set());
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const previewUrlMapRef = useRef(new Map<string, string>());
  const documentsList = documents ?? [];
  const totalSelected = selectedPhotos.size + selectedVideos.size + selectedDocuments.size;

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
          setPreviewUrls((prev) => ({ ...prev, [item.id]: url }));
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
      previewUrlMapRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlMapRef.current.clear();
    };
  }, []);

  const resolvePreviewUrl = (item: MediaValue) => {
    if (!isMediaRef(item)) return item;
    return previewUrls[item.id];
  };

  const resolveFileName = (item: MediaValue, fallback: string) => {
    if (!isMediaRef(item)) return fallback;
    return item.fileName || fallback;
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
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

  const hasMedia = photos.length > 0 || videos.length > 0 || documentsList.length > 0;
  if (!hasMedia) return null;

  const handleDeleteSelected = async () => {
    if (totalSelected === 0) return;

    const confirmDelete = window.confirm(`Delete ${totalSelected} selected item(s)?`);
    if (!confirmDelete) return;

    const selectedPhotoIndexes = Array.from(selectedPhotos).sort((a, b) => b - a);
    const selectedVideoIndexes = Array.from(selectedVideos).sort((a, b) => b - a);
    const selectedDocumentIndexes = Array.from(selectedDocuments).sort((a, b) => b - a);

    for (const idx of selectedPhotoIndexes) {
      const item = photos[idx];
      if (item && isMediaRef(item)) {
        await indexedDBStorage.deleteMediaFile(item.id);
        const previewUrl = previewUrlMapRef.current.get(item.id);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          previewUrlMapRef.current.delete(item.id);
        }
      }
      onDeletePhoto(idx);
    }

    for (const idx of selectedVideoIndexes) {
      const item = videos[idx];
      if (item && isMediaRef(item)) {
        await indexedDBStorage.deleteMediaFile(item.id);
        const previewUrl = previewUrlMapRef.current.get(item.id);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          previewUrlMapRef.current.delete(item.id);
        }
      }
      onDeleteVideo(idx);
    }

    if (onDeleteDocument) {
      for (const idx of selectedDocumentIndexes) {
        const item = documentsList[idx];
        if (item && isMediaRef(item)) {
          await indexedDBStorage.deleteMediaFile(item.id);
        }
        onDeleteDocument(idx);
      }
    }

    setSelectedPhotos(new Set());
    setSelectedVideos(new Set());
    setSelectedDocuments(new Set());
    toast.success(`Deleted ${totalSelected} item(s)`);
  };

  return (
    <>
      <div className="border-t pt-3 mt-3">
        {photos.length > 0 && (
          <div>
            <h6 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Photos ({photos.length})
            </h6>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {photos.map((photo, idx) => (
                <div
                  key={`photo-${idx}`}
                  className={`relative group rounded cursor-pointer ${selectedPhotos.has(idx) ? "ring-2 ring-blue-500" : ""
                    }`}
                  onClick={() => {
                    const newSelected = new Set(selectedPhotos);
                    if (newSelected.has(idx)) newSelected.delete(idx);
                    else newSelected.add(idx);
                    setSelectedPhotos(newSelected);
                  }}
                >
                  {resolvePreviewUrl(photo) ? (
                    <img
                      src={resolvePreviewUrl(photo) as string}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-full h-24 rounded-lg border bg-muted/40" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resolvePreviewUrl(photo) &&
                          setViewingMedia({
                            type: "photo",
                            url: resolvePreviewUrl(photo) as string,
                            fileName: resolveFileName(photo, `Photo ${idx + 1}`),
                          });
                      }}
                      title="View photo full size"
                      aria-label="View photo"
                      className="bg-blue-600 hover:bg-blue-700 p-1.5 rounded-full transition-colors"
                    >
                      <Eye className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-3">
            <h6 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Videos ({videos.length})
            </h6>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {videos.map((video, idx) => (
                <div
                  key={`video-${idx}`}
                  className={`relative group rounded cursor-pointer ${selectedVideos.has(idx) ? "ring-2 ring-blue-500" : ""
                    }`}
                  onClick={() => {
                    const newSelected = new Set(selectedVideos);
                    if (newSelected.has(idx)) newSelected.delete(idx);
                    else newSelected.add(idx);
                    setSelectedVideos(newSelected);
                  }}
                >
                  <div className="relative w-full h-24 bg-black rounded-lg border flex items-center justify-center">
                    {resolvePreviewUrl(video) && (
                      <video src={resolvePreviewUrl(video)} className="w-full h-full object-cover" />
                    )}
                    <Play className="absolute h-5 w-5 text-white pointer-events-none" />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resolvePreviewUrl(video) &&
                          setViewingMedia({
                            type: "video",
                            url: resolvePreviewUrl(video) as string,
                            fileName: resolveFileName(video, `Video ${idx + 1}`),
                          });
                      }}
                      title="View video full size"
                      aria-label="View video"
                      className="bg-blue-600 hover:bg-blue-700 p-1.5 rounded-full transition-colors"
                    >
                      <Eye className="h-3 w-3 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {documentsList.length > 0 && (
          <div className="mt-3">
            <h6 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Documents ({documentsList.length})
            </h6>
            <div className="space-y-2">
              {documentsList.map((doc, idx) => (
                <div
                  key={`doc-${idx}`}
                  className={`flex items-center justify-between gap-3 rounded-lg border border-input p-3 ${selectedDocuments.has(idx) ? "ring-2 ring-blue-500" : ""
                    }`}
                  onClick={() => {
                    const newSelected = new Set(selectedDocuments);
                    if (newSelected.has(idx)) newSelected.delete(idx);
                    else newSelected.add(idx);
                    setSelectedDocuments(newSelected);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="text-xs">
                      <p className="font-medium text-foreground">
                        {resolveFileName(doc, `Document ${idx + 1}`)}
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalSelected > 0 && (
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleDeleteSelected}>
              Delete {totalSelected} Selected
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              setSelectedPhotos(new Set());
              setSelectedVideos(new Set());
              setSelectedDocuments(new Set());
            }}>
              Deselect All
            </Button>
          </div>
        )}
      </div>
      <MediaViewerModal media={viewingMedia} isOpen={!!viewingMedia} onClose={() => setViewingMedia(null)} />
    </>
  );
}

export default function OwnerProfilePage() {
  const [owners, setOwners] = useState(storage.getLandOwners());
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [search, setSearch] = useState("");
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [selectedSections, setSelectedSections] = useState({
    owner: true,
    land: true,
    site: true,
    meeting: true,
    mediation: true,
    buyer: true,
    place: true,
    advance: true,
  });

  // Highlight states for each section
  const [ownerHighlights, setOwnerHighlights] = useState<SectionHighlights>({});
  const [landHighlights, setLandHighlights] = useState<SectionHighlights>({});
  const [siteHighlights, setSiteHighlights] = useState<SectionHighlights>({});
  const [meetingHighlights, setMeetingHighlights] = useState<SectionHighlights>({});
  const [mediationHighlights, setMediationHighlights] = useState<SectionHighlights>({});
  const [buyerHighlights, setBuyerHighlights] = useState<SectionHighlights>({});
  const [placeHighlights, setPlaceHighlights] = useState<SectionHighlights>({});
  const [advanceHighlights, setAdvanceHighlights] = useState<SectionHighlights>({});

  const filteredOwners = useMemo(() => {
    const q = search.toLowerCase();
    return owners.filter(
      (o) =>
        o.areaName.toLowerCase().includes(q) ||
        o.contactNumber.includes(q) ||
        o.address.toLowerCase().includes(q)
    );
  }, [owners, search]);

  const selectedOwner = owners.find((o) => o.id === selectedOwnerId);

  const ownerData = useMemo(() => {
    if (!selectedOwnerId) return null;
    const media = storage.getMediaByOwnerId(selectedOwnerId);
    return {
      landDetails: storage.getLandDetails().filter((d) => d.ownerId === selectedOwnerId),
      siteVisits: storage.getSiteVisits().filter((d) => d.ownerId === selectedOwnerId),
      ownerMeetings: storage.getOwnerMeetings().filter((d) => d.ownerId === selectedOwnerId),
      mediations: storage.getMediations().filter((d) => d.ownerId === selectedOwnerId),
      buyerSellerMeetings: storage.getBuyerSellerMeetings().filter((d) => d.ownerId === selectedOwnerId),
      meetingPlaces: storage.getMeetingPlaces().filter((d) => d.ownerId === selectedOwnerId),
      advanceRegistrations: storage.getAdvanceRegistrations().filter((d) => d.ownerId === selectedOwnerId),
      media: media,
    };
  }, [selectedOwnerId, refreshCounter]);

  const refreshOwners = () => {
    setOwners([...storage.getLandOwners()]);
    setRefreshCounter(c => c + 1);
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold font-display">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Owner Profile</h1>
        <p className="mt-1 text-muted-foreground">View and edit all details for a land owner in one place</p>
      </motion.div>

      {/* Search & Select Owner */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Search Owner</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  className="pl-9"
                  placeholder="Search by area, contact, address…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-select">Select Owner</Label>
              <select
                id="owner-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedOwnerId}
                onChange={(e) => setSelectedOwnerId(e.target.value)}
                title="Select owner"
              >
                <option value="">Choose an owner…</option>
                {filteredOwners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.areaName} — {o.contactNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedOwnerId && selectedOwner && (
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button
                onClick={() => setShowDownloadDialog(true)}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          )}

          {/* Download Options Dialog */}
          <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
            <DialogContent className="max-w-md">
              <div className="space-y-4">
                <div>
                  <h2 className="font-semibold text-lg mb-2">Download Report</h2>
                  <p className="text-sm text-muted-foreground mb-4">Select which sections to include in your PDF report:</p>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {sectionConfig.map((section) => (
                    <label key={section.key} className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedSections[section.key as keyof typeof selectedSections]}
                        onChange={(e) =>
                          setSelectedSections((prev) => ({
                            ...prev,
                            [section.key]: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border border-input"
                      />
                      <div className="flex items-center gap-2">
                        <section.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{section.label}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={async () => {
                      try {
                        setIsLoadingPreview(true);
                        const allSections = {
                          owner: true,
                          land: true,
                          site: true,
                          meeting: true,
                          mediation: true,
                          buyer: true,
                          place: true,
                          advance: true,
                        };
                        const { html } = await generateOwnerProfilePDFPreview(selectedOwnerId, {
                          includeOwner: allSections.owner,
                          includeLandDetails: allSections.land,
                          includeSiteVisit: allSections.site,
                          includeOwnerMeeting: allSections.meeting,
                          includeMediation: allSections.mediation,
                          includeBuyerSellerMeeting: allSections.buyer,
                          includeMeetingPlace: allSections.place,
                          includeAdvanceRegistration: allSections.advance,
                        });
                        setPreviewHtml(html);
                        setShowPreviewDialog(true);
                        setShowDownloadDialog(false);
                      } catch (err) {
                        toast.error("Failed to generate preview: " + (err instanceof Error ? err.message : "Unknown error"));
                      } finally {
                        setIsLoadingPreview(false);
                      }
                    }}
                    className="flex-1"
                    disabled={isLoadingPreview}
                  >
                    {isLoadingPreview ? "Generating Preview..." : "Preview & Download All"}
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        setIsLoadingPreview(true);
                        const { html } = await generateOwnerProfilePDFPreview(selectedOwnerId, {
                          includeOwner: selectedSections.owner,
                          includeLandDetails: selectedSections.land,
                          includeSiteVisit: selectedSections.site,
                          includeOwnerMeeting: selectedSections.meeting,
                          includeMediation: selectedSections.mediation,
                          includeBuyerSellerMeeting: selectedSections.buyer,
                          includeMeetingPlace: selectedSections.place,
                          includeAdvanceRegistration: selectedSections.advance,
                        });
                        setPreviewHtml(html);
                        setShowPreviewDialog(true);
                        setShowDownloadDialog(false);
                      } catch (err) {
                        toast.error("Failed to generate preview: " + (err instanceof Error ? err.message : "Unknown error"));
                      } finally {
                        setIsLoadingPreview(false);
                      }
                    }}
                    className="flex-1"
                    variant="default"
                    disabled={isLoadingPreview}
                  >
                    {isLoadingPreview ? "Generating Preview..." : "Preview & Download Selected"}
                  </Button>
                </div>

                <DialogClose asChild>
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>

          {/* PDF Preview Dialog */}
          <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">PDF Preview</h2>
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close preview">
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>

                {/* Preview Container */}
                <div className="border rounded-lg overflow-hidden bg-white max-h-96 overflow-y-auto">
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-96 border-none"
                    title="PDF Preview"
                  />
                </div>

                {/* Download Button */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={async () => {
                      try {
                        setIsLoadingPreview(true);
                        await downloadCachedPDF();
                        toast.success("PDF downloaded successfully");
                        setShowPreviewDialog(false);
                      } catch (err) {
                        toast.error("Failed to download PDF: " + (err instanceof Error ? err.message : "Unknown error"));
                      } finally {
                        setIsLoadingPreview(false);
                      }
                    }}
                    className="flex-1 gap-2"
                    disabled={isLoadingPreview}
                  >
                    <Download className="h-4 w-4" />
                    {isLoadingPreview ? "Downloading..." : "Download PDF"}
                  </Button>
                  <Button
                    onClick={() => setShowPreviewDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Owner Sections */}
      {selectedOwner && ownerData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Stage 1: Owner Info - EDITABLE */}
          <CollapsibleSection icon={Users} stage={1} title="Land Owner Details" count={1}>
            <EditableRecord
              title={selectedOwner.areaName}
              recordIndex={0}
              data={selectedOwner}
              fields={[
                { key: "areaName", label: "Owner Name" },
                { key: "contactNumber", label: "Contact" },
                { key: "age", label: "Age" },
                { key: "address", label: "Address" },
                { key: "ownerBackground", label: "Background", type: "textarea" },
              ]}
              onUpdate={(updates) => {
                const updated = { ...selectedOwner, ...updates };
                storage.updateLandOwner(updated);
                setOwners([...storage.getLandOwners()]);
                setSelectedOwnerId(updated.id);
              }}
              onDelete={() => {
                if (window.confirm("Delete this owner? This will remove all associated data.")) {
                  storage.deleteLandOwner(selectedOwner.id);
                  refreshOwners();
                  setSelectedOwnerId("");
                  toast.success("Owner deleted");
                }
              }}
              onHighlightToggle={(color) => {
                setOwnerHighlights({ [selectedOwner.id]: color });
              }}
              highlights={ownerHighlights}
            />
          </CollapsibleSection>

          {/* Media Section */}
          <Card className="overflow-hidden">
            <button className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors">
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold", `bg-[hsl(var(--stage-1))]`)}>
                📷
              </div>
              <ImageIcon className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="font-display font-semibold text-foreground flex-1">Photos & Videos</span>
              {ownerData.media.length > 0 && <Badge variant="secondary" className="mr-2">{ownerData.media.length} media</Badge>}
            </button>
            <CardContent className="border-t pt-4 pb-4">
              <div className="space-y-6">
                <MediaUpload
                  ownerId={selectedOwnerId}
                  onMediaAdded={() => refreshOwners()}
                />

                {ownerData.media.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Uploaded Media</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {ownerData.media.map((item) => (
                        <div key={item.id} className="relative group rounded-lg overflow-hidden border">
                          {item.type === "photo" ? (
                            <img
                              src={(item as any).data || ""}
                              alt={item.fileName}
                              className="w-full h-32 object-cover"
                            />
                          ) : item.type === "video" ? (
                            <video
                              src={(item as any).data || ""}
                              className="w-full h-32 object-cover"
                            />
                          ) : (
                            <div className="w-full h-32 bg-muted/40 flex items-center justify-center">
                              <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              indexedDBStorage.deleteMediaFile(item.id);
                              storage.deleteMedia(item.id);
                              refreshOwners();
                              toast.success("Media deleted");
                            }}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            title="Delete media"
                            aria-label="Delete media"
                          >
                            <Trash2 className="h-5 w-5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stage 2: Land Details (EDITABLE) */}
          <CollapsibleSection icon={MapPin} stage={2} title="Land Details" count={ownerData.landDetails.length}>
            {ownerData.landDetails.map((record, idx) => (
              <EditableRecord
                key={record.id}
                title={`Land ${idx + 1} - ${record.areaName || "Unnamed"}`}
                recordIndex={idx}
                data={record}
                fields={[
                  { key: "areaName", label: "Area Name" },
                  { key: "pattaNo", label: "Patta No" },
                  { key: "subdivisionNo", label: "Subdivision No" },
                  { key: "pattaPersonNames", label: "Patta Person Names" },
                  { key: "natureOfLand", label: "Nature of Land" },
                  { key: "acreOrCent", label: "Acre/Cent" },
                  { key: "fmSketch", label: "FM Sketch" },
                  { key: "siteSketch", label: "Site Sketch" },
                  { key: "ratePerCent", label: "Rate per Cent (₹)" },
                  { key: "ratePerSqFt", label: "Rate per Sq.Ft (₹)" },
                ]}
                onUpdate={(updates) => {
                  const updated = { ...record, ...updates };
                  storage.updateLandDetails(updated);
                  refreshOwners();
                }}
                onDelete={() => {
                  if (window.confirm(`Delete Land ${idx + 1}?`)) {
                    storage.deleteLandDetails(record.id);
                    refreshOwners();
                    toast.success("Land details deleted");
                  }
                }}
                onHighlightToggle={(color) => {
                  setLandHighlights({ ...landHighlights, [record.id]: color });
                }}
                highlights={landHighlights}
              />
            ))}
          </CollapsibleSection>

          {/* Stage 3: Site Visits (EDITABLE) */}
          <CollapsibleSection icon={Eye} stage={3} title="Site Visit" count={ownerData.siteVisits.length}>
            {ownerData.siteVisits.map((record, idx) => (
              <EditableRecord
                key={record.id}
                title={`Visit ${idx + 1} - ${record.visitDate || "Unnamed"}`}
                recordIndex={idx}
                data={record}
                fields={[
                  { key: "distanceKm", label: "Distance (KM)" },
                  { key: "visitDate", label: "Visit Date" },
                  { key: "notes", label: "Notes", type: "textarea" },
                ]}
                onUpdate={(updates) => {
                  const updated = { ...record, ...updates };
                  storage.updateSiteVisit(updated);
                  refreshOwners();
                }}
                onDelete={() => {
                  if (window.confirm(`Delete Visit ${idx + 1}?`)) {
                    storage.deleteSiteVisit(record.id);
                    refreshOwners();
                    toast.success("Site visit deleted");
                  }
                }}
                onHighlightToggle={(color) => {
                  setSiteHighlights({ ...siteHighlights, [record.id]: color });
                }}
                highlights={siteHighlights}
              />
            ))}
          </CollapsibleSection>

          {/* Stage 4: Owner Meetings (EDITABLE) */}
          <CollapsibleSection icon={Handshake} stage={4} title="Owner Meeting & Price" count={ownerData.ownerMeetings.length}>
            {ownerData.ownerMeetings.map((record, idx) => (
              <EditableRecord
                key={record.id}
                title={`Meeting ${idx + 1} - ${record.meetingDate || "Unnamed"}`}
                recordIndex={idx}
                data={record}
                fields={[
                  { key: "meetingDate", label: "Meeting Date" },
                  { key: "landRate", label: "Land Rate (₹)" },
                  { key: "finalPrice", label: "Final Price (₹)" },
                  { key: "negotiationDetails", label: "Negotiation Details", type: "textarea" },
                ]}
                onUpdate={(updates) => {
                  const updated = { ...record, ...updates };
                  storage.updateOwnerMeeting(updated);
                  refreshOwners();
                }}
                onDelete={() => {
                  if (window.confirm(`Delete Meeting ${idx + 1}?`)) {
                    storage.deleteOwnerMeeting(record.id);
                    refreshOwners();
                    toast.success("Owner meeting deleted");
                  }
                }}
                onHighlightToggle={(color) => {
                  setMeetingHighlights({ ...meetingHighlights, [record.id]: color });
                }}
                highlights={meetingHighlights}
              />
            ))}
          </CollapsibleSection>

          {/* Stage 5: Mediations (EDITABLE) */}
          <CollapsibleSection icon={Scale} stage={5} title="Mediation" count={ownerData.mediations.length}>
            {ownerData.mediations.map((record, idx) => (
              <EditableRecord
                key={record.id}
                title={`Mediation ${idx + 1} - ${record.mediatorName || "Unnamed"}`}
                recordIndex={idx}
                data={record}
                fields={[
                  { key: "mediatorName", label: "Mediator" },
                  { key: "mediationDate", label: "Date" },
                  { key: "outcome", label: "Outcome" },
                  { key: "mediationDetails", label: "Details", type: "textarea" },
                ]}
                onUpdate={(updates) => {
                  const updated = { ...record, ...updates };
                  storage.updateMediation(updated);
                  refreshOwners();
                }}
                onDelete={() => {
                  if (window.confirm(`Delete Mediation ${idx + 1}?`)) {
                    storage.deleteMediation(record.id);
                    refreshOwners();
                    toast.success("Mediation deleted");
                  }
                }}
                onHighlightToggle={(color) => {
                  setMediationHighlights({ ...mediationHighlights, [record.id]: color });
                }}
                highlights={mediationHighlights}
              />
            ))}
          </CollapsibleSection>

          {/* Stage 6: Buyer-Seller Meetings (EDITABLE) */}
          <CollapsibleSection icon={UserCheck} stage={6} title="Buyer to Seller Meeting" count={ownerData.buyerSellerMeetings.length}>
            {ownerData.buyerSellerMeetings.map((record, idx) => (
              <EditableRecord
                key={record.id}
                title={`Meeting ${idx + 1} - ${record.buyerName || "Unnamed"}`}
                recordIndex={idx}
                data={record}
                fields={[
                  { key: "buyerName", label: "Buyer Name" },
                  { key: "buyerContact", label: "Buyer Contact" },
                  { key: "sellerContact", label: "Seller Contact" },
                  { key: "meetingDate", label: "Meeting Date" },
                  { key: "meetingNotes", label: "Notes", type: "textarea" },
                ]}
                onUpdate={(updates) => {
                  const updated = { ...record, ...updates };
                  storage.updateBuyerSellerMeeting(updated);
                  refreshOwners();
                }}
                onDelete={() => {
                  if (window.confirm(`Delete Meeting ${idx + 1}?`)) {
                    storage.deleteBuyerSellerMeeting(record.id);
                    refreshOwners();
                    toast.success("Buyer-seller meeting deleted");
                  }
                }}
                onHighlightToggle={(color) => {
                  setBuyerHighlights({ ...buyerHighlights, [record.id]: color });
                }}
                highlights={buyerHighlights}
              />
            ))}
          </CollapsibleSection>

          {/* Stage 7: Meeting Place (EDITABLE) */}
          <CollapsibleSection icon={Building} stage={7} title="Meeting Place" count={ownerData.meetingPlaces.length}>
            {ownerData.meetingPlaces.map((record, idx) => (
              <EditableRecord
                key={record.id}
                title={`Meeting ${idx + 1} - ${record.placeName || "Unnamed"}`}
                recordIndex={idx}
                data={record}
                fields={[
                  { key: "placeName", label: "Place" },
                  { key: "placeAddress", label: "Address" },
                  { key: "meetingDate", label: "Date" },
                  { key: "meetingTime", label: "Time" },
                  { key: "meetingStartTime", label: "Starting Time" },
                  { key: "meetingEndTime", label: "Ending Time" },
                ]}
                onUpdate={(updates) => {
                  const updated = { ...record, ...updates };
                  storage.updateMeetingPlace(updated);
                  refreshOwners();
                }}
                onDelete={() => {
                  if (window.confirm(`Delete Meeting ${idx + 1}?`)) {
                    storage.deleteMeetingPlace(record.id);
                    refreshOwners();
                    toast.success("Meeting place deleted");
                  }
                }}
                onHighlightToggle={(color) => {
                  setPlaceHighlights({ ...placeHighlights, [record.id]: color });
                }}
                highlights={placeHighlights}
              />
            ))}
          </CollapsibleSection>

          {/* Stage 8: Advance & Registration (EDITABLE) */}
          <CollapsibleSection icon={FileCheck} stage={8} title="Advance & Registration" count={ownerData.advanceRegistrations.length}>
            {ownerData.advanceRegistrations.map((record, idx) => (
              <EditableRecord
                key={record.id}
                title={`Record ${idx + 1} - ${record.buyerName || "Unnamed"}`}
                recordIndex={idx}
                data={record}
                fields={[
                  { key: "buyerName", label: "Buyer" },
                  { key: "advanceAmount", label: "Advance Amount (₹)" },
                  { key: "registrationAmount", label: "Registration Amount (₹)" },
                  { key: "secondAmount", label: "Second Amount (₹)" },
                  { key: "finalAmount", label: "Final Amount (₹)" },
                  { key: "totalAmount", label: "Total Amount (₹)" },
                  { key: "advanceDate", label: "Advance Date" },
                  { key: "registrationDate", label: "Registration Date" },
                  { key: "notes", label: "Notes", type: "textarea" },
                ]}
                onUpdate={(updates) => {
                  const updated = { ...record, ...updates };
                  storage.updateAdvanceRegistration(updated);
                  refreshOwners();
                }}
                onDelete={() => {
                  if (window.confirm(`Delete Record ${idx + 1}?`)) {
                    storage.deleteAdvanceRegistration(record.id);
                    refreshOwners();
                    toast.success("Advance registration deleted");
                  }
                }}
                onHighlightToggle={(color) => {
                  setAdvanceHighlights({ ...advanceHighlights, [record.id]: color });
                }}
                highlights={advanceHighlights}
              />
            ))}
          </CollapsibleSection>
        </motion.div>
      )}

      {!selectedOwnerId && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="mx-auto h-12 w-12 mb-3 opacity-30" />
          <p className="font-medium">Select a land owner to view their complete profile</p>
        </div>
      )}


    </Layout>
  );
}
