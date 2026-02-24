import { useState } from "react";
import { Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import FormPageHeader from "@/components/FormPageHeader";

import SectionMediaUpload from "@/components/SectionMediaUpload";
import { storage, MeetingPlaceData } from "@/lib/storage";
import { MediaValue } from "@/lib/mediaTypes";

// Helper function to convert 24h time to 12h format with AM/PM
function formatTime12h(timeValue?: string): string {
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

// Generate time options in 30-minute intervals (00:00 to 23:30)
function generateTimeOptions(): { value: string; label: string }[] {
  const options = [];
  for (let hours = 0; hours < 24; hours++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      const hourStr = hours.toString().padStart(2, "0");
      const minStr = minutes.toString().padStart(2, "0");
      const value = `${hourStr}:${minStr}`;
      const label = formatTime12h(value);
      options.push({ value, label });
    }
  }
  return options;
}

// Filter end times to show only times after start time
function getEndTimeOptions(startTime: string): { value: string; label: string }[] {
  const allOptions = generateTimeOptions();
  if (!startTime) return allOptions;
  return allOptions.filter((opt) => opt.value > startTime);
}

export default function MeetingPlaceForm() {
  const [data, setData] = useState<MeetingPlaceData[]>(storage.getMeetingPlaces());
  const owners = storage.getLandOwners();
  const [form, setForm] = useState({
    ownerId: "",
    placeName: "",
    placeAddress: "",
    meetingDate: "",
    meetingTime: "",
    meetingStartTime: "",
    meetingEndTime: "",
  });
  const [photos, setPhotos] = useState<MediaValue[]>([]);
  const [videos, setVideos] = useState<MediaValue[]>([]);
  const [documents, setDocuments] = useState<MediaValue[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.meetingStartTime && form.meetingEndTime && form.meetingEndTime <= form.meetingStartTime) {
      toast.error("Ending time must be after starting time");
      return;
    }
    try {
      const item: MeetingPlaceData = {
        ...form,
        photos,
        videos,
        documents,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      storage.addMeetingPlace(item);
      setData(storage.getMeetingPlaces());
      setForm({ ownerId: "", placeName: "", placeAddress: "", meetingDate: "", meetingTime: "", meetingStartTime: "", meetingEndTime: "" });
      setPhotos([]);
      setVideos([]);
      setDocuments([]);
      toast.success("Meeting place details saved!");
    } catch (error) {
      console.error('Save error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save data. Files may be too large.");
      }
    }
  };

  const handleDelete = (id: string) => {
    storage.deleteMeetingPlace(id);
    setData(storage.getMeetingPlaces());
    toast.success("Record deleted");
  };

  return (
    <Layout>
      <FormPageHeader
        stage={7}
        title="Meeting Place Selection"
        description="Set the meeting venue, date & time"
        icon={Building}
      />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="owner">Select Owner</Label>
              <select
                id="owner"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.ownerId}
                onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}
                required
                title="Select owner"
              >
                <option value="">Choose owner…</option>
                {owners.map(o => (
                  <option key={o.id} value={o.id}>{o.areaName} — {o.contactNumber}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="place">Place Name</Label>
              <Input id="place" placeholder="Office, hotel, site…" value={form.placeName} onChange={e => setForm(f => ({ ...f, placeName: e.target.value }))} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="addr">Place Address</Label>
              <Input id="addr" placeholder="Full address of the meeting place" value={form.placeAddress} onChange={e => setForm(f => ({ ...f, placeAddress: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Meeting Date</Label>
              <Input id="date" type="date" value={form.meetingDate} onChange={e => setForm(f => ({ ...f, meetingDate: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Meeting Time</Label>
              <select
                id="time"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.meetingTime}
                onChange={(e) => setForm((f) => ({ ...f, meetingTime: e.target.value }))}
                required
                title="Select meeting time"
              >
                <option value="">Select time…</option>
                {generateTimeOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Starting Time</Label>
              <select
                id="startTime"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.meetingStartTime}
                onChange={(e) => setForm((f) => ({ ...f, meetingStartTime: e.target.value }))}
                title="Select starting time"
              >
                <option value="">Select time…</option>
                {generateTimeOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Ending Time</Label>
              <select
                id="endTime"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.meetingEndTime}
                onChange={(e) => setForm((f) => ({ ...f, meetingEndTime: e.target.value }))}
                title="Select ending time (must be after starting time)"
              >
                <option value="">Select time…</option>
                {getEndTimeOptions(form.meetingStartTime).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Ending time must be after starting time.</p>
            </div>
            <div className="sm:col-span-2">
              <SectionMediaUpload
                photos={photos}
                videos={videos}
                documents={documents}
                onPhotosChange={setPhotos}
                onVideosChange={setVideos}
                onDocumentsChange={setDocuments}
                label="Attach Venue Photos & Videos"
                ownerId={form.ownerId}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">Save Meeting Place</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}
