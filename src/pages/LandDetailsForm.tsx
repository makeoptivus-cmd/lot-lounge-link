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

import SectionMediaUpload from "@/components/SectionMediaUpload";
import { storage, LandDetailsData, LandNatureDetail } from "@/lib/storage";
import { MediaValue } from "@/lib/mediaTypes";

export default function LandDetailsForm() {
  const [data, setData] = useState<LandDetailsData[]>(storage.getLandDetails());
  const owners = storage.getLandOwners();
  const [form, setForm] = useState({
    ownerId: "",
    areaName: "",
    pattaNo: "",
    subdivisionNo: "",
    pattaPersonNames: "",
    fmSketch: "",
    siteSketch: "",
    natureOfLand: [],
    acreOrCent: "",
    ratePerCent: "",
    ratePerSqFt: "",
  });
  const landTypeOptions = ["Agriculture", "Residential", "Commercial", "Nanjai", "Punjai"];
  const [photos, setPhotos] = useState<MediaValue[]>([]);
  const [videos, setVideos] = useState<MediaValue[]>([]);
  const [documents, setDocuments] = useState<MediaValue[]>([]);
  const [natureOfLandDetails, setNatureOfLandDetails] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert nature of land to objects with details
      const natureOfLandWithDetails: LandNatureDetail[] = (form.natureOfLand as any).map((name: string) => ({
        name,
        details: natureOfLandDetails[name] || "",
      }));

      const item: LandDetailsData = {
        ...form,
        natureOfLand: natureOfLandWithDetails,
        photos,
        videos,
        documents,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      storage.addLandDetails(item);
      setData(storage.getLandDetails());
      setForm({ ownerId: "", areaName: "", pattaNo: "", subdivisionNo: "", pattaPersonNames: "", fmSketch: "", siteSketch: "", natureOfLand: [], acreOrCent: "", ratePerCent: "", ratePerSqFt: "" });
      setNatureOfLandDetails({});
      setPhotos([]);
      setVideos([]);
      setDocuments([]);
      toast.success("Land details saved!");
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
                title="Select owner"
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
              <Label htmlFor="patta">Patta No</Label>
              <Input id="patta" placeholder="Patta number" value={form.pattaNo} onChange={e => setForm(f => ({ ...f, pattaNo: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdivision">Subdivision No</Label>
              <Input id="subdivision" placeholder="Subdivision number" value={form.subdivisionNo} onChange={e => setForm(f => ({ ...f, subdivisionNo: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="pattaNames">Patta Person Names</Label>
              <Input id="pattaNames" placeholder="Name(s) on patta" value={form.pattaPersonNames} onChange={e => setForm(f => ({ ...f, pattaPersonNames: e.target.value }))} />
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
              <Label>Nature of the Land</Label>
              <div className="space-y-4 p-3 border border-input rounded-md bg-background">
                <div className="grid grid-cols-2 gap-4">
                  {landTypeOptions.map(option => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(form.natureOfLand as any).includes(option)}
                        onChange={e => {
                          if (e.target.checked) {
                            setForm(f => ({ ...f, natureOfLand: [...(f.natureOfLand as any), option] }));
                          } else {
                            setForm(f => ({ ...f, natureOfLand: (f.natureOfLand as any).filter((n: string) => n !== option) }));
                          }
                        }}
                        className="rounded border border-input h-4 w-4"
                        aria-label={option}
                      />
                      <span className="text-sm font-normal">{option}</span>
                    </label>
                  ))}
                </div>
                {(form.natureOfLand as any).length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50/50 rounded border border-blue-200 space-y-3">
                    <p className="text-xs font-semibold text-blue-900">📝 Add Details for Selected Land Types</p>
                    {(form.natureOfLand as any).map((option: string) => (
                      <div key={option} className="space-y-1">
                        <label className="text-xs font-medium text-foreground">{option}</label>
                        <input
                          type="text"
                          placeholder={`Details about ${option}...`}
                          value={natureOfLandDetails[option] || ""}
                          onChange={e => setNatureOfLandDetails(prev => ({ ...prev, [option]: e.target.value }))}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="acreCent">Acre/Cent</Label>
              <Input id="acreCent" type="text" placeholder="Enter acre or cent" value={form.acreOrCent} onChange={e => setForm(f => ({ ...f, acreOrCent: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cent">Rate per Cent (₹)</Label>
              <Input id="cent" type="text" placeholder="Rate per cent" value={form.ratePerCent} onChange={e => setForm(f => ({ ...f, ratePerCent: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sqft">Rate per Sq. Ft (₹)</Label>
              <Input id="sqft" type="text" placeholder="Rate per sq ft" value={form.ratePerSqFt} onChange={e => setForm(f => ({ ...f, ratePerSqFt: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <SectionMediaUpload
                photos={photos}
                videos={videos}
                documents={documents}
                onPhotosChange={setPhotos}
                onVideosChange={setVideos}
                onDocumentsChange={setDocuments}
                label="Attach Land Photos & Videos"
                ownerId={form.ownerId}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">Save Land Details</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
}
