import { useState, useMemo } from "react";
import { Users, MapPin, Eye, Handshake, Scale, UserCheck, Building, FileCheck, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import { storage } from "@/lib/storage";
import { cn } from "@/lib/utils";

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

export default function OwnerProfile() {
  const owners = storage.getLandOwners();
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [search, setSearch] = useState("");

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
    return {
      landDetails: storage.getLandDetails().filter((d) => d.ownerId === selectedOwnerId),
      siteVisits: storage.getSiteVisits().filter((d) => d.ownerId === selectedOwnerId),
      ownerMeetings: storage.getOwnerMeetings().filter((d) => d.ownerId === selectedOwnerId),
      mediations: storage.getMediations().filter((d) => d.ownerId === selectedOwnerId),
      buyerSellerMeetings: storage.getBuyerSellerMeetings().filter((d) => d.ownerId === selectedOwnerId),
      meetingPlaces: storage.getMeetingPlaces().filter((d) => d.ownerId === selectedOwnerId),
      advanceRegistrations: storage.getAdvanceRegistrations().filter((d) => d.ownerId === selectedOwnerId),
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
              <DetailRow label="Area Name" value={selectedOwner.areaName} />
              <DetailRow label="Contact" value={selectedOwner.contactNumber} />
              <DetailRow label="Age" value={selectedOwner.age} />
              <DetailRow label="Address" value={selectedOwner.address} />
              <DetailRow label="Background" value={selectedOwner.ownerBackground} />
            </div>
          </CollapsibleSection>

          {/* Stage 2: Land Details */}
          <CollapsibleSection icon={MapPin} stage={2} title="Land Details" count={ownerData.landDetails.length}>
            {ownerData.landDetails.map((d, i) => (
              <div key={d.id} className={cn("grid gap-x-8 gap-y-1 sm:grid-cols-2", i > 0 && "mt-4 border-t pt-4")}>
                <DetailRow label="Area Name" value={d.areaName} />
                <DetailRow label="Nature of Land" value={d.natureOfLand} />
                <DetailRow label="FM Sketch" value={d.fmSketch} />
                <DetailRow label="Site Sketch" value={d.siteSketch} />
                <DetailRow label="Rate per Cent (₹)" value={d.ratePerCent} />
                <DetailRow label="Rate per Sq.Ft (₹)" value={d.ratePerSqFt} />
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
