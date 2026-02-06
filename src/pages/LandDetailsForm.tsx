import { useState } from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import FormPageHeader from "@/components/FormPageHeader";
import DataTable from "@/components/DataTable";
import { storage, LandDetailsData } from "@/lib/storage";

export default function LandDetailsForm() {
  const [data, setData] = useState<LandDetailsData[]>(storage.getLandDetails());
  const owners = storage.getLandOwners();
  const [form, setForm] = useState({
    ownerId: "",
    areaName: "",
    fmSketch: "",
    siteSketch: "",
    natureOfLand: "",
    ratePerCent: "",
    ratePerSqFt: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: LandDetailsData = {
      ...form,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    storage.addLandDetails(item);
    setData(storage.getLandDetails());
    setForm({ ownerId: "", areaName: "", fmSketch: "", siteSketch: "", natureOfLand: "", ratePerCent: "", ratePerSqFt: "" });
    toast.success("Land details saved!");
  };

  const handleDelete = (id: string) => {
    storage.deleteLandDetails(id);
    setData(storage.getLandDetails());
    toast.success("Record deleted");
  };

  return (
    <Layout>
      <FormPageHeader
        stage={2}
        title="Land Details"
        description="Record land specifications and rates"
        icon={MapPin}
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
              <Label htmlFor="area">Area Name</Label>
              <Input id="area" placeholder="Area name" value={form.areaName} onChange={e => setForm(f => ({ ...f, areaName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fm">FM Sketch Details</Label>
              <Textarea id="fm" placeholder="FM sketch description" value={form.fmSketch} onChange={e => setForm(f => ({ ...f, fmSketch: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site">Site Sketch Details</Label>
              <Textarea id="site" placeholder="Site sketch description" value={form.siteSketch} onChange={e => setForm(f => ({ ...f, siteSketch: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nature">Nature of the Land</Label>
              <Input id="nature" placeholder="Agriculture, residential, commercial…" value={form.natureOfLand} onChange={e => setForm(f => ({ ...f, natureOfLand: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cent">Rate per Cent (₹)</Label>
              <Input id="cent" type="number" placeholder="Rate per cent" value={form.ratePerCent} onChange={e => setForm(f => ({ ...f, ratePerCent: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sqft">Rate per Sq. Ft (₹)</Label>
              <Input id="sqft" type="number" placeholder="Rate per sq ft" value={form.ratePerSqFt} onChange={e => setForm(f => ({ ...f, ratePerSqFt: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">Save Land Details</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        title="Saved Land Details"
        columns={[
          { key: "areaName", label: "Area" },
          { key: "natureOfLand", label: "Nature" },
          { key: "ratePerCent", label: "₹/Cent" },
          { key: "ratePerSqFt", label: "₹/Sq.Ft" },
        ]}
        data={data}
        onDelete={handleDelete}
      />
    </Layout>
  );
}
