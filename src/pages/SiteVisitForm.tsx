import { useState } from "react";
import { Eye } from "lucide-react";
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
  const [form, setForm] = useState({
    ownerId: "",
    distanceKm: "",
    visitDate: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: SiteVisitData = {
      ...form,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    storage.addSiteVisit(item);
    setData(storage.getSiteVisits());
    setForm({ ownerId: "", distanceKm: "", visitDate: "", notes: "" });
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
              <Label htmlFor="notes">Visit Notes (Photos/Video observations)</Label>
              <Textarea id="notes" placeholder="Describe site conditions, photos taken, videos…" rows={4} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
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
        ]}
        data={data}
        onDelete={handleDelete}
      />
    </Layout>
  );
}
