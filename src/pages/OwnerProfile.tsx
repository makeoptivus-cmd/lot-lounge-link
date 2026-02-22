import { useState, useMemo } from "react";
import { Users, MapPin, Eye, Handshake, Scale, UserCheck, Building, FileCheck, Search, ChevronDown, ChevronUp, Image as ImageIcon, Play, Trash2, Download, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import MediaUpload from "@/components/MediaUpload";
import { storage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateOwnerProfilePDF } from "@/lib/pdfExport";

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

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 py-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
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
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold",
          `bg-[hsl(var(--stage-${stage}))]`
        )}>
          {stage}
        </div>
        <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
        <span className="font-display font-semibold text-foreground flex-1">{title}</span>
        {count > 0 && (
          <Badge variant="secondary" className="mr-2">
            {count} record{count !== 1 ? "s" : ""}
          </Badge>
        )}
        {count === 0 && (
          <span className="mr-2 text-xs text-muted-foreground">No records</span>
        )}
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && count > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="border-t pt-4 pb-4">
              {children}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

interface MediaItemProps {
  item: any;
  onDelete: () => void;
}

// Modal Viewer Component for Images/Videos
function MediaViewerModal({ media, isOpen, onClose }: { media: any | null; isOpen: boolean; onClose: () => void }) {
  if (!media) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogClose className="absolute right-4 top-4" />
        {media.type === "photo" ? (
          <div className="flex flex-col gap-3">
            <img src={media.data} alt={media.fileName} className="w-full h-auto rounded-lg" />
            <p className="text-sm text-muted-foreground">📷 {media.fileName}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <video src={media.data} controls className="w-full h-auto rounded-lg bg-black" />
            <p className="text-sm text-muted-foreground">🎥 {media.fileName}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Component to display media thumbnails in a section with checkbox selection
function SectionMediaGrid({ 
  photos, 
  videos, 
  onDeletePhoto, 
  onDeleteVideo 
}: { 
  photos: string[]; 
  videos: string[]; 
  onDeletePhoto: (idx: number) => void; 
  onDeleteVideo: (idx: number) => void 
}) {
  const [viewingMedia, setViewingMedia] = useState<any>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const totalSelected = selectedPhotos.size + selectedVideos.size;

  const hasMedia = photos.length > 0 || videos.length > 0;
  if (!hasMedia) return null;

  const handleDeleteSelected = () => {
    if (totalSelected === 0) return;
    
    const confirmDelete = window.confirm(`Delete ${totalSelected} selected item(s)?`);
    if (!confirmDelete) return;

    // Delete in reverse order to maintain indices
    Array.from(selectedPhotos)
      .sort((a, b) => b - a)
      .forEach(idx => onDeletePhoto(idx));
    
    Array.from(selectedVideos)
      .sort((a, b) => b - a)
      .forEach(idx => onDeleteVideo(idx));

    setSelectedPhotos(new Set());
    setSelectedVideos(new Set());
    toast.success(`Deleted ${totalSelected} item(s)`);
  };

  return (
    <>
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase">📷 Attached Media ({photos.length + videos.length})</h5>
          {totalSelected > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{totalSelected} selected</Badge>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={handleDeleteSelected}
                className="h-7 gap-1"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {photos.map((photo, idx) => (
            <div key={`photo-${idx}`} className="relative group">
              <input
                type="checkbox"
                checked={selectedPhotos.has(idx)}
                onChange={(e) => {
                  const newSelected = new Set(selectedPhotos);
                  if (e.target.checked) newSelected.add(idx);
                  else newSelected.delete(idx);
                  setSelectedPhotos(newSelected);
                }}
                className="absolute top-1 right-1 z-10 w-4 h-4 cursor-pointer"
                title="Select photo for deletion"
                aria-label={`Select photo ${idx + 1}`}
              />
              <img 
                src={photo} 
                alt={`Photo ${idx + 1}`} 
                className="w-full h-24 object-cover rounded border text-xs cursor-pointer"
                onClick={() => setViewingMedia({ type: "photo", data: photo, fileName: `Photo ${idx + 1}` })}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <button 
                  type="button" 
                  onClick={() => setViewingMedia({ type: "photo", data: photo, fileName: `Photo ${idx + 1}` })}
                  title="View photo full size"
                  aria-label="View photo"
                  className="bg-blue-600 hover:bg-blue-700 p-1.5 rounded-full transition-colors"
                >
                  <Eye className="h-3 w-3 text-white" />
                </button>
              </div>
              <div className="absolute bottom-0.5 left-0.5 bg-black/70 text-white px-1 py-0.5 rounded text-xs flex items-center gap-0.5">
                <ImageIcon className="h-2 w-2" />
              </div>
            </div>
          ))}
          {videos.map((video, idx) => (
            <div key={`video-${idx}`} className="relative group">
              <input
                type="checkbox"
                checked={selectedVideos.has(idx)}
                onChange={(e) => {
                  const newSelected = new Set(selectedVideos);
                  if (e.target.checked) newSelected.add(idx);
                  else newSelected.delete(idx);
                  setSelectedVideos(newSelected);
                }}
                className="absolute top-1 right-1 z-10 w-4 h-4 cursor-pointer"
                title="Select video for deletion"
                aria-label={`Select video ${idx + 1}`}
              />
              <div 
                className="relative w-full h-24 bg-black rounded border flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors"
                onClick={() => setViewingMedia({ type: "video", data: video, fileName: `Video ${idx + 1}` })}
              >
                <video src={video} className="w-full h-full object-cover" />
                <Play className="absolute h-5 w-5 text-white pointer-events-none" />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <button 
                  type="button" 
                  onClick={() => setViewingMedia({ type: "video", data: video, fileName: `Video ${idx + 1}` })}
                  title="View video full size"
                  aria-label="View video"
                  className="bg-blue-600 hover:bg-blue-700 p-1.5 rounded-full transition-colors"
                >
                  <Eye className="h-3 w-3 text-white" />
                </button>
              </div>
              <div className="absolute bottom-0.5 left-0.5 bg-black/70 text-white px-1 py-0.5 rounded text-xs flex items-center gap-0.5">
                <Play className="h-2 w-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <MediaViewerModal media={viewingMedia} isOpen={!!viewingMedia} onClose={() => setViewingMedia(null)} />
    </>
  );
}

function MediaItem({ item, onDelete }: { item: any; onDelete: () => void }) {
  const [viewingMedia, setViewingMedia] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  return (
    <>
      <div className="relative group">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => setIsSelected(e.target.checked)}
          className="absolute top-2 right-2 z-10 w-4 h-4 cursor-pointer"
          title="Select for deletion"
          aria-label="Select media"
        />
        {item.type === "photo" ? (
          <img
            src={item.data}
            alt={item.fileName}
            className="w-full h-32 object-cover rounded-lg border cursor-pointer"
            onClick={() => setViewingMedia(true)}
          />
        ) : (
          <div 
            className="relative w-full h-32 bg-black rounded-lg border flex items-center justify-center cursor-pointer"
            onClick={() => setViewingMedia(true)}
          >
            <video src={item.data} className="w-full h-full object-cover rounded-lg" />
            <Play className="absolute h-8 w-8 text-white pointer-events-none" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => setViewingMedia(true)}
            title="View media full size"
            aria-label="View media"
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Type badge */}
        <div className="absolute top-1 left-1 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
          {item.type === "photo" ? (
            <>
              <ImageIcon className="h-3 w-3" />
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
            </>
          )}
        </div>
      </div>

      <MediaViewerModal 
        media={viewingMedia ? item : null} 
        isOpen={viewingMedia} 
        onClose={() => setViewingMedia(false)} 
      />
    </>
  );
}

export default function OwnerProfile() {
  const [owners, setOwners] = useState(storage.getLandOwners());
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [search, setSearch] = useState("");
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
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

  const filteredOwners = useMemo(() => {
    if (!search.trim()) return owners;
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
  }, [selectedOwnerId]);

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold font-display">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Owner Profile</h1>
        <p className="mt-1 text-muted-foreground">View all details for a land owner in one place</p>
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
                        // Select all sections
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
                        await generateOwnerProfilePDF(selectedOwnerId, {
                          includeOwner: allSections.owner,
                          includeLandDetails: allSections.land,
                          includeSiteVisit: allSections.site,
                          includeOwnerMeeting: allSections.meeting,
                          includeMediation: allSections.mediation,
                          includeBuyerSellerMeeting: allSections.buyer,
                          includeMeetingPlace: allSections.place,
                          includeAdvanceRegistration: allSections.advance,
                        });
                        toast.success("PDF downloaded successfully");
                        setShowDownloadDialog(false);
                      } catch (err) {
                        toast.error("Failed to generate PDF: " + (err instanceof Error ? err.message : "Unknown error"));
                      }
                    }}
                    className="flex-1"
                  >
                    Download All
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        await generateOwnerProfilePDF(selectedOwnerId, {
                          includeOwner: selectedSections.owner,
                          includeLandDetails: selectedSections.land,
                          includeSiteVisit: selectedSections.site,
                          includeOwnerMeeting: selectedSections.meeting,
                          includeMediation: selectedSections.mediation,
                          includeBuyerSellerMeeting: selectedSections.buyer,
                          includeMeetingPlace: selectedSections.place,
                          includeAdvanceRegistration: selectedSections.advance,
                        });
                        toast.success("PDF downloaded successfully");
                        setShowDownloadDialog(false);
                      } catch (err) {
                        toast.error("Failed to generate PDF: " + (err instanceof Error ? err.message : "Unknown error"));
                      }
                    }}
                    className="flex-1"
                    variant="default"
                  >
                    Download Selected
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
        </CardContent>
      </Card>

      {/* Owner Sections */}
      {selectedOwner && ownerData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Stage 1: Owner Info */}
          <CollapsibleSection icon={Users} stage={1} title="Land Owner Details" count={1}>
            <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              <DetailRow label="Owner Name" value={selectedOwner.areaName} />
              <DetailRow label="Contact" value={selectedOwner.contactNumber} />
              <DetailRow label="Age" value={selectedOwner.age} />
              <DetailRow label="Address" value={selectedOwner.address} />
              <DetailRow label="Background" value={selectedOwner.ownerBackground} />
            </div>
          </CollapsibleSection>

          {/* Media Section: Photos & Videos */}
          <Card className="overflow-hidden">
            <button
              className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold",
                `bg-[hsl(var(--stage-1))]`
              )}>
                📷
              </div>
              <ImageIcon className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="font-display font-semibold text-foreground flex-1">Photos & Videos</span>
              {ownerData.media.length > 0 && (
                <Badge variant="secondary" className="mr-2">
                  {ownerData.media.length} media
                </Badge>
              )}
            </button>
            <CardContent className="border-t pt-4 pb-4">
              <div className="space-y-6">
                {/* Upload Section */}
                <div>
                  <MediaUpload 
                    ownerId={selectedOwnerId}
                    onMediaAdded={() => {
                      // Force re-render to show new media
                      setOwners([...storage.getLandOwners()]);
                    }}
                  />
                </div>

                {/* Display Media */}
                {ownerData.media.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Uploaded Media</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {ownerData.media.map((item) => (
                        <MediaItem 
                          key={item.id} 
                          item={item}
                          onDelete={() => {
                            storage.deleteMedia(item.id);
                            setOwners([...storage.getLandOwners()]);
                            toast.success("Media deleted");
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <CollapsibleSection icon={MapPin} stage={2} title="Land Details" count={ownerData.landDetails.length}>
            {ownerData.landDetails.map((d, i) => (
              <div key={d.id} className={cn("grid gap-x-8 gap-y-1 sm:grid-cols-2", i > 0 && "mt-4 border-t pt-4")}>
                <DetailRow label="Area Name" value={d.areaName} />
                <DetailRow label="Nature of Land" value={d.natureOfLand} />
                <DetailRow label="FM Sketch" value={d.fmSketch} />
                <DetailRow label="Site Sketch" value={d.siteSketch} />
                <DetailRow label="Rate per Cent (₹)" value={d.ratePerCent} />
                <DetailRow label="Rate per Sq.Ft (₹)" value={d.ratePerSqFt} />
                <SectionMediaGrid 
                  photos={d.photos || []} 
                  videos={d.videos || []}
                  onDeletePhoto={(idx) => {
                    const updated = [...ownerData.landDetails];
                    updated[i].photos = d.photos?.filter((_, j) => j !== idx) || [];
                    storage.deleteLandDetails(d.id);
                    storage.addLandDetails(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                  onDeleteVideo={(idx) => {
                    const updated = [...ownerData.landDetails];
                    updated[i].videos = d.videos?.filter((_, j) => j !== idx) || [];
                    storage.deleteLandDetails(d.id);
                    storage.addLandDetails(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                />
              </div>
            ))}
          </CollapsibleSection>

          {/* Stage 3: Site Visits */}
          <CollapsibleSection icon={Eye} stage={3} title="Site Visit" count={ownerData.siteVisits.length}>
            {ownerData.siteVisits.map((d, i) => (
              <div key={d.id} className={cn("grid gap-x-8 gap-y-1 sm:grid-cols-2", i > 0 && "mt-4 border-t pt-4")}>
                <DetailRow label="Distance (KM)" value={d.distanceKm} />
                <DetailRow label="Visit Date" value={d.visitDate} />
                <DetailRow label="Notes" value={d.notes} />
                <SectionMediaGrid 
                  photos={d.photos || []} 
                  videos={d.videos || []}
                  onDeletePhoto={(idx) => {
                    const updated = [...ownerData.siteVisits];
                    updated[i].photos = d.photos?.filter((_, j) => j !== idx) || [];
                    storage.deleteSiteVisit(d.id);
                    storage.addSiteVisit(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                  onDeleteVideo={(idx) => {
                    const updated = [...ownerData.siteVisits];
                    updated[i].videos = d.videos?.filter((_, j) => j !== idx) || [];
                    storage.deleteSiteVisit(d.id);
                    storage.addSiteVisit(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                />
              </div>
            ))}
          </CollapsibleSection>

          {/* Stage 4: Owner Meeting */}
          <CollapsibleSection icon={Handshake} stage={4} title="Owner Meeting & Price" count={ownerData.ownerMeetings.length}>
            {ownerData.ownerMeetings.map((d, i) => (
              <div key={d.id} className={cn("grid gap-x-8 gap-y-1 sm:grid-cols-2", i > 0 && "mt-4 border-t pt-4")}>
                <DetailRow label="Meeting Date" value={d.meetingDate} />
                <DetailRow label="Land Rate (₹)" value={d.landRate} />
                <DetailRow label="Final Price (₹)" value={d.finalPrice} />
                <DetailRow label="Negotiation Details" value={d.negotiationDetails} />
                <SectionMediaGrid 
                  photos={d.photos || []} 
                  videos={d.videos || []}
                  onDeletePhoto={(idx) => {
                    const updated = [...ownerData.ownerMeetings];
                    updated[i].photos = d.photos?.filter((_, j) => j !== idx) || [];
                    storage.deleteOwnerMeeting(d.id);
                    storage.addOwnerMeeting(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                  onDeleteVideo={(idx) => {
                    const updated = [...ownerData.ownerMeetings];
                    updated[i].videos = d.videos?.filter((_, j) => j !== idx) || [];
                    storage.deleteOwnerMeeting(d.id);
                    storage.addOwnerMeeting(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                />
              </div>
            ))}
          </CollapsibleSection>

          {/* Stage 5: Mediation */}
          <CollapsibleSection icon={Scale} stage={5} title="Mediation" count={ownerData.mediations.length}>
            {ownerData.mediations.map((d, i) => (
              <div key={d.id} className={cn("grid gap-x-8 gap-y-1 sm:grid-cols-2", i > 0 && "mt-4 border-t pt-4")}>
                <DetailRow label="Mediator" value={d.mediatorName} />
                <DetailRow label="Date" value={d.mediationDate} />
                <DetailRow label="Outcome" value={d.outcome} />
                <DetailRow label="Details" value={d.mediationDetails} />
                <SectionMediaGrid 
                  photos={d.photos || []} 
                  videos={d.videos || []}
                  onDeletePhoto={(idx) => {
                    const updated = [...ownerData.mediations];
                    updated[i].photos = d.photos?.filter((_, j) => j !== idx) || [];
                    storage.deleteMediation(d.id);
                    storage.addMediation(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                  onDeleteVideo={(idx) => {
                    const updated = [...ownerData.mediations];
                    updated[i].videos = d.videos?.filter((_, j) => j !== idx) || [];
                    storage.deleteMediation(d.id);
                    storage.addMediation(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                />
              </div>
            ))}
          </CollapsibleSection>

          {/* Stage 6: Buyer-Seller Meeting */}
          <CollapsibleSection icon={UserCheck} stage={6} title="Buyer to Seller Meeting" count={ownerData.buyerSellerMeetings.length}>
            {ownerData.buyerSellerMeetings.map((d, i) => (
              <div key={d.id} className={cn("grid gap-x-8 gap-y-1 sm:grid-cols-2", i > 0 && "mt-4 border-t pt-4")}>
                <DetailRow label="Buyer Name" value={d.buyerName} />
                <DetailRow label="Buyer Contact" value={d.buyerContact} />
                <DetailRow label="Meeting Date" value={d.meetingDate} />
                <DetailRow label="Notes" value={d.meetingNotes} />
                <SectionMediaGrid 
                  photos={d.photos || []} 
                  videos={d.videos || []}
                  onDeletePhoto={(idx) => {
                    const updated = [...ownerData.buyerSellerMeetings];
                    updated[i].photos = d.photos?.filter((_, j) => j !== idx) || [];
                    storage.deleteBuyerSellerMeeting(d.id);
                    storage.addBuyerSellerMeeting(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                  onDeleteVideo={(idx) => {
                    const updated = [...ownerData.buyerSellerMeetings];
                    updated[i].videos = d.videos?.filter((_, j) => j !== idx) || [];
                    storage.deleteBuyerSellerMeeting(d.id);
                    storage.addBuyerSellerMeeting(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                />
              </div>
            ))}
          </CollapsibleSection>

          {/* Stage 7: Meeting Place */}
          <CollapsibleSection icon={Building} stage={7} title="Meeting Place" count={ownerData.meetingPlaces.length}>
            {ownerData.meetingPlaces.map((d, i) => (
              <div key={d.id} className={cn("grid gap-x-8 gap-y-1 sm:grid-cols-2", i > 0 && "mt-4 border-t pt-4")}>
                <DetailRow label="Place" value={d.placeName} />
                <DetailRow label="Address" value={d.placeAddress} />
                <DetailRow label="Date" value={d.meetingDate} />
                <DetailRow label="Time" value={d.meetingTime} />
                <SectionMediaGrid 
                  photos={d.photos || []} 
                  videos={d.videos || []}
                  onDeletePhoto={(idx) => {
                    const updated = [...ownerData.meetingPlaces];
                    updated[i].photos = d.photos?.filter((_, j) => j !== idx) || [];
                    storage.deleteMeetingPlace(d.id);
                    storage.addMeetingPlace(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                  onDeleteVideo={(idx) => {
                    const updated = [...ownerData.meetingPlaces];
                    updated[i].videos = d.videos?.filter((_, j) => j !== idx) || [];
                    storage.deleteMeetingPlace(d.id);
                    storage.addMeetingPlace(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                />
              </div>
            ))}
          </CollapsibleSection>

          {/* Stage 8: Advance & Registration */}
          <CollapsibleSection icon={FileCheck} stage={8} title="Advance & Registration" count={ownerData.advanceRegistrations.length}>
            {ownerData.advanceRegistrations.map((d, i) => (
              <div key={d.id} className={cn("grid gap-x-8 gap-y-1 sm:grid-cols-2", i > 0 && "mt-4 border-t pt-4")}>
                <DetailRow label="Buyer" value={d.buyerName} />
                <DetailRow label="Advance Amount (₹)" value={d.advanceAmount} />
                <DetailRow label="Advance Date" value={d.advanceDate} />
                <DetailRow label="Registration Date" value={d.registrationDate} />
                <DetailRow label="Notes" value={d.notes} />
                <SectionMediaGrid 
                  photos={d.photos || []} 
                  videos={d.videos || []}
                  onDeletePhoto={(idx) => {
                    const updated = [...ownerData.advanceRegistrations];
                    updated[i].photos = d.photos?.filter((_, j) => j !== idx) || [];
                    storage.deleteAdvanceRegistration(d.id);
                    storage.addAdvanceRegistration(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                  onDeleteVideo={(idx) => {
                    const updated = [...ownerData.advanceRegistrations];
                    updated[i].videos = d.videos?.filter((_, j) => j !== idx) || [];
                    storage.deleteAdvanceRegistration(d.id);
                    storage.addAdvanceRegistration(updated[i]);
                    setOwners([...storage.getLandOwners()]);
                  }}
                />
              </div>
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
