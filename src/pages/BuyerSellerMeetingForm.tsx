import { useState } from "react";
import { UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import FormPageHeader from "@/components/FormPageHeader";

import SectionMediaUpload from "@/components/SectionMediaUpload";
import { storage, BuyerSellerMeetingData } from "@/lib/storage";

export default function BuyerSellerMeetingForm() {
  const [data, setData] = useState<BuyerSellerMeetingData[]>(storage.getBuyerSellerMeetings());
  const owners = storage.getLandOwners();
  const [form, setForm] = useState({
    ownerId: "",
    buyerName: "",
    buyerContact: "",
    buyerAddress: "",
    meetingDate: "",
    meetingNotes: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const item: BuyerSellerMeetingData = {
        ...form,
        photos,
        videos,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      storage.addBuyerSellerMeeting(item);
      setData(storage.getBuyerSellerMeetings());
      setForm({ ownerId: "", buyerName: "", buyerContact: "", buyerAddress: "", meetingDate: "", meetingNotes: "" });
      setPhotos([]);
      setVideos([]);
      toast.success("Buyer-seller meeting details saved!");
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
    storage.deleteBuyerSellerMeeting(id);
    setData(storage.getBuyerSellerMeetings());
    toast.success("Record deleted");
  };

  return (
    <Layout>
      <FormPageHeader
        stage={6}
        title="Buyer to Seller Meeting"
        description="Record buyer-seller meeting details"
        icon={UserCheck}
      />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="owner">Select Owner (Seller)</Label>
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
              <Label htmlFor="buyer">Buyer Name</Label>
              <Input id="buyer" placeholder="Buyer's full name" value={form.buyerName} onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bcontact">Buyer Contact</Label>
              <Input id="bcontact" type="tel" placeholder="Buyer's phone" value={form.buyerContact} onChange={e => setForm(f => ({ ...f, buyerContact: e.target.value }))} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="baddress">Buyer Address</Label>
              <Input id="baddress" placeholder="Buyer's address" value={form.buyerAddress} onChange={e => setForm(f => ({ ...f, buyerAddress: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Meeting Date</Label>
              <Input id="date" type="date" value={form.meetingDate} onChange={e => setForm(f => ({ ...f, meetingDate: e.target.value }))} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Meeting Notes</Label>
              <Textarea id="notes" placeholder="Discuss topics, agreements, observations…" rows={4} value={form.meetingNotes} onChange={e => setForm(f => ({ ...f, meetingNotes: e.target.value }))} />
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
              <Button type="submit" className="w-full sm:w-auto">Save Meeting</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}
