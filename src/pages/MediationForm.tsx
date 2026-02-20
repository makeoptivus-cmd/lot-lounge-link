import { useState } from "react";
import { Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import FormPageHeader from "@/components/FormPageHeader";
import DataTable from "@/components/DataTable";
import SectionMediaUpload from "@/components/SectionMediaUpload";
import { storage, MediationData } from "@/lib/storage";

export default function MediationForm() {
  const [data, setData] = useState<MediationData[]>(storage.getMediations());
  const owners = storage.getLandOwners();
  const [form, setForm] = useState({
    ownerId: "",
    mediatorName: "",
    mediationDate: "",
    mediationDetails: "",
    outcome: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const item: MediationData = {
        ...form,
        photos,
        videos,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      storage.addMediation(item);
      setData(storage.getMediations());
      setForm({ ownerId: "", mediatorName: "", mediationDate: "", mediationDetails: "", outcome: "" });
      setPhotos([]);
      setVideos([]);
      toast.success("Mediation details saved!");
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
    storage.deleteMediation(id);
    setData(storage.getMediations());
    toast.success("Record deleted");
  };

  return (
    <Layout>
      <FormPageHeader
        stage={5}
        title="Land Owner Mediation Details"
        description="Record mediation sessions and outcomes"
        icon={Scale}
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
              <Label htmlFor="mediator">Mediator Name</Label>
              <Input id="mediator" placeholder="Mediator's name" value={form.mediatorName} onChange={e => setForm(f => ({ ...f, mediatorName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Mediation Date</Label>
              <Input id="date" type="date" value={form.mediationDate} onChange={e => setForm(f => ({ ...f, mediationDate: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Input id="outcome" placeholder="Resolved, Pending, Escalated…" value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="details">Mediation Details</Label>
              <Textarea id="details" placeholder="Discussion points, agreements…" rows={4} value={form.mediationDetails} onChange={e => setForm(f => ({ ...f, mediationDetails: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <SectionMediaUpload
                photos={photos}
                videos={videos}
                onPhotosChange={setPhotos}
                onVideosChange={setVideos}
                label="Attach Mediation Photos & Videos"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">Save Mediation</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        title="Saved Mediations"
        columns={[
          { key: "mediatorName", label: "Mediator" },
          { key: "mediationDate", label: "Date" },
          { key: "outcome", label: "Outcome" },
          { key: "mediationDetails", label: "Details" },
        ]}
        data={data}
        onDelete={handleDelete}
      />
    </Layout>
  );
}
