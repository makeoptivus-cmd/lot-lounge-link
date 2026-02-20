import { useState } from "react";
import { Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import FormPageHeader from "@/components/FormPageHeader";
import DataTable from "@/components/DataTable";
import SectionMediaUpload from "@/components/SectionMediaUpload";
import { storage, MeetingPlaceData } from "@/lib/storage";

export default function MeetingPlaceForm() {
  const [data, setData] = useState<MeetingPlaceData[]>(storage.getMeetingPlaces());
  const owners = storage.getLandOwners();
  const [form, setForm] = useState({
    ownerId: "",
    placeName: "",
    placeAddress: "",
    meetingDate: "",
    meetingTime: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const item: MeetingPlaceData = {
        ...form,
        photos,
        videos,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      storage.addMeetingPlace(item);
      setData(storage.getMeetingPlaces());
      setForm({ ownerId: "", placeName: "", placeAddress: "", meetingDate: "", meetingTime: "" });
      setPhotos([]);
      setVideos([]);
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
              <Input id="time" type="time" value={form.meetingTime} onChange={e => setForm(f => ({ ...f, meetingTime: e.target.value }))} required />
            </div>
            <div className="sm:col-span-2">
              <SectionMediaUpload
                photos={photos}
                videos={videos}
                onPhotosChange={setPhotos}
                onVideosChange={setVideos}
                label="Attach Venue Photos & Videos"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">Save Meeting Place</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        title="Saved Meeting Places"
        columns={[
          { key: "placeName", label: "Place" },
          { key: "placeAddress", label: "Address" },
          { key: "meetingDate", label: "Date" },
          { key: "meetingTime", label: "Time" },
        ]}
        data={data}
        onDelete={handleDelete}
      />
    </Layout>
  );
}
