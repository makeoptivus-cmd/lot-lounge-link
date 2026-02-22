import { useState } from "react";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import FormPageHeader from "@/components/FormPageHeader";

import MediaUpload from "@/components/MediaUpload";
import { storage, LandOwnerData } from "@/lib/storage";

export default function LandOwnerForm() {
  const [data, setData] = useState<LandOwnerData[]>(storage.getLandOwners());
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");
  const [form, setForm] = useState({
    areaName: "",
    address: "",
    age: "",
    contactNumber: "",
    ownerBackground: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: LandOwnerData = {
      ...form,
      id: crypto.randomUUID(),
      photos: [],
      videos: [],
      createdAt: new Date().toISOString(),
    };
    storage.addLandOwner(item);
    setData(storage.getLandOwners());
    setSelectedOwnerId(item.id);
    setForm({ areaName: "", address: "", age: "", contactNumber: "", ownerBackground: "" });
    toast.success("Land owner details saved! Now you can upload photos and videos.");
  };

  const handleDelete = (id: string) => {
    storage.deleteLandOwner(id);
    setData(storage.getLandOwners());
    toast.success("Record deleted");
  };

  return (
    <Layout>
      <FormPageHeader
        stage={1}
        title="Land Owner Details"
        description="Register new land owner information"
        icon={Users}
      />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="areaName">Owner Name</Label>
              <Input id="areaName" placeholder="Enter owner name" value={form.areaName} onChange={e => setForm(f => ({ ...f, areaName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" placeholder="Owner age" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Full address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input id="contact" type="tel" placeholder="Phone number" value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bg">Owner Background</Label>
              <Textarea id="bg" placeholder="Background details" value={form.ownerBackground} onChange={e => setForm(f => ({ ...f, ownerBackground: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">Save Owner Details</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Media Upload Section for Selected Owner */}
      {selectedOwnerId && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Add Photos & Videos for {data.find(o => o.id === selectedOwnerId)?.areaName}</h2>
          <MediaUpload 
            ownerId={selectedOwnerId} 
            onMediaAdded={() => setData(storage.getLandOwners())}
          />
        </div>
      )}
    </Layout>
  );
}
