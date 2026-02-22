import { useState } from "react";
import { Handshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import FormPageHeader from "@/components/FormPageHeader";

import SectionMediaUpload from "@/components/SectionMediaUpload";
import { storage, OwnerMeetingData } from "@/lib/storage";

export default function OwnerMeetingForm() {
  const [data, setData] = useState<OwnerMeetingData[]>(storage.getOwnerMeetings());
  const owners = storage.getLandOwners();
  const [form, setForm] = useState({
    ownerId: "",
    landRate: "",
    negotiationDetails: "",
    finalPrice: "",
    meetingDate: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const item: OwnerMeetingData = {
        ...form,
        photos,
        videos,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      storage.addOwnerMeeting(item);
      setData(storage.getOwnerMeetings());
      setForm({ ownerId: "", landRate: "", negotiationDetails: "", finalPrice: "", meetingDate: "" });
      setPhotos([]);
      setVideos([]);
      toast.success("Owner meeting details saved!");
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
    storage.deleteOwnerMeeting(id);
    setData(storage.getOwnerMeetings());
    toast.success("Record deleted");
  };

  return (
    <Layout>
      <FormPageHeader
        stage={4}
        title="Owner Meeting & Price Discussion"
        description="Record negotiation details and final agreed price"
        icon={Handshake}
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
              <Label htmlFor="date">Meeting Date</Label>
              <Input id="date" type="date" value={form.meetingDate} onChange={e => setForm(f => ({ ...f, meetingDate: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Land Rate (₹)</Label>
              <Input id="rate" type="number" placeholder="Owner's asking rate" value={form.landRate} onChange={e => setForm(f => ({ ...f, landRate: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="final">Final Negotiated Price (₹)</Label>
              <Input id="final" type="number" placeholder="Agreed final price" value={form.finalPrice} onChange={e => setForm(f => ({ ...f, finalPrice: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="neg">Negotiation Details</Label>
              <Textarea id="neg" placeholder="Discussion points, terms, conditions…" rows={4} value={form.negotiationDetails} onChange={e => setForm(f => ({ ...f, negotiationDetails: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <SectionMediaUpload
                photos={photos}
                videos={videos}
                onPhotosChange={setPhotos}
                onVideosChange={setVideos}
                label="Attach Meeting Photos & Videos"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">Save Meeting Details</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}
