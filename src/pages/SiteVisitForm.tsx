import { useState, useRef } from "react";
import { Eye, ImagePlus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import FormPageHeader from "@/components/FormPageHeader";
import DataTable from "@/components/DataTable";
import { storage, SiteVisitData } from "@/lib/storage";

export default function SiteVisitForm() {
  const [data, setData] = useState<SiteVisitData[]>(storage.getSiteVisits());
  const owners = storage.getLandOwners();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    ownerId: "",
    distanceKm: "",
    visitDate: "",
    notes: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: SiteVisitData = {
      ...form,
      photos,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    storage.addSiteVisit(item);
    setData(storage.getSiteVisits());
    setForm({ ownerId: "", distanceKm: "", visitDate: "", notes: "" });
    setPhotos([]);
    toast.success("Site visit details saved!");
  };

  const handleDelete = (id: string) => {
    storage.deleteSiteVisit(id);
    setData(storage.getSiteVisits());
    toast.success("Record deleted");
  };

  return (
    <Layout>
      <FormPageHeader
        stage={3}
        title="Site Visit Details"
        description="Record site visit distance, photos & observations"
        icon={Eye}
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
              >
                <option value="">Choose owner…</option>
                {owners.map(o => (
                  <option key={o.id} value={o.id}>{o.areaName} — {o.contactNumber}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="km">Distance (KM)</Label>
              <Input id="km" type="number" placeholder="How many kilometres" value={form.distanceKm} onChange={e => setForm(f => ({ ...f, distanceKm: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Visit Date</Label>
              <Input id="date" type="date" value={form.visitDate} onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Visit Notes</Label>
              <Textarea id="notes" placeholder="Describe site conditions, observations…" rows={4} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Site Photos</Label>
              <div className="flex flex-wrap gap-3">
                {photos.map((src, i) => (
                  <div key={i} className="relative h-24 w-24 rounded-lg border overflow-hidden group">
                    <img src={src} alt={`Site photo ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus className="h-6 w-6 mb-1" />
                  <span className="text-xs">Add Photo</span>
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoAdd}
              />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">Save Site Visit</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        title="Saved Site Visits"
        columns={[
          { key: "distanceKm", label: "Distance (KM)" },
          { key: "visitDate", label: "Visit Date" },
          { key: "notes", label: "Notes" },
          { key: "photoCount", label: "Photos" },
        ]}
        data={data.map(d => ({ ...d, photoCount: `${(d.photos || []).length} photo(s)` }))}
        onDelete={handleDelete}
      />
    </Layout>
  );
}
