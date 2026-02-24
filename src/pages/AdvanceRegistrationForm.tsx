import { useState } from "react";
import { FileCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import FormPageHeader from "@/components/FormPageHeader";

import SectionMediaUpload from "@/components/SectionMediaUpload";
import { storage, AdvanceRegistrationData } from "@/lib/storage";
import { MediaValue } from "@/lib/mediaTypes";

export default function AdvanceRegistrationForm() {
  const [data, setData] = useState<AdvanceRegistrationData[]>(storage.getAdvanceRegistrations());
  const owners = storage.getLandOwners();
  const [form, setForm] = useState({
    ownerId: "",
    advanceAmount: "",
    registrationAmount: "",
    secondAmount: "",
    finalAmount: "",
    totalAmount: "",
    advanceDate: "",
    registrationDate: "",
    buyerName: "",
    notes: "",
  });
  const [photos, setPhotos] = useState<MediaValue[]>([]);
  const [videos, setVideos] = useState<MediaValue[]>([]);
  const [documents, setDocuments] = useState<MediaValue[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculate total amount
      const advance = parseFloat(form.advanceAmount) || 0;
      const registration = parseFloat(form.registrationAmount) || 0;
      const second = parseFloat(form.secondAmount) || 0;
      const final = parseFloat(form.finalAmount) || 0;
      const total = advance + registration + second + final;

      const item: AdvanceRegistrationData = {
        ...form,
        totalAmount: total.toString(),
        photos,
        videos,
        documents,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      storage.addAdvanceRegistration(item);
      setData(storage.getAdvanceRegistrations());
      setForm({ ownerId: "", advanceAmount: "", registrationAmount: "", secondAmount: "", finalAmount: "", totalAmount: "", advanceDate: "", registrationDate: "", buyerName: "", notes: "" });
      setPhotos([]);
      setVideos([]);
      setDocuments([]);
      toast.success("Advance registration details saved!");
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
    storage.deleteAdvanceRegistration(id);
    setData(storage.getAdvanceRegistrations());
    toast.success("Record deleted");
  };

  return (
    <Layout>
      <FormPageHeader
        stage={8}
        title="Buyer Advance & Registration"
        description="Record advance payment and registration date"
        icon={FileCheck}
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
              <Label htmlFor="buyer">Buyer Name</Label>
              <Input id="buyer" placeholder="Buyer's name" value={form.buyerName} onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advAmount">Advance Amount (₹)</Label>
              <Input id="advAmount" type="text" placeholder="Advance amount" value={form.advanceAmount} onChange={e => setForm(f => ({ ...f, advanceAmount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regAmount">Registration Amount (₹)</Label>
              <Input id="regAmount" type="text" placeholder="Registration amount" value={form.registrationAmount} onChange={e => setForm(f => ({ ...f, registrationAmount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondAmount">Second Amount (₹)</Label>
              <Input id="secondAmount" type="text" placeholder="Second amount" value={form.secondAmount} onChange={e => setForm(f => ({ ...f, secondAmount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="finalAmount">Final Amount (₹)</Label>
              <Input id="finalAmount" type="text" placeholder="Final amount" value={form.finalAmount} onChange={e => setForm(f => ({ ...f, finalAmount: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2 bg-muted/30 p-3 rounded-lg border">
              <p className="text-sm font-semibold">Total Amount (Auto-calculated)</p>
              <p className="text-lg font-bold text-primary">
                ₹ {(
                  (parseFloat(form.advanceAmount) || 0) +
                  (parseFloat(form.registrationAmount) || 0) +
                  (parseFloat(form.secondAmount) || 0) +
                  (parseFloat(form.finalAmount) || 0)
                ).toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adate">Advance Date</Label>
              <Input id="adate" type="date" value={form.advanceDate} onChange={e => setForm(f => ({ ...f, advanceDate: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rdate">Registration Date</Label>
              <Input id="rdate" type="date" value={form.registrationDate} onChange={e => setForm(f => ({ ...f, registrationDate: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" placeholder="Payment mode, conditions, remarks…" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <SectionMediaUpload
                photos={photos}
                videos={videos}
                documents={documents}
                onPhotosChange={setPhotos}
                onVideosChange={setVideos}
                onDocumentsChange={setDocuments}
                label="Attach Registration Documents & Photos"
                ownerId={form.ownerId}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">Save Advance & Registration</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}
