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
import DataTable from "@/components/DataTable";
import { storage, AdvanceRegistrationData } from "@/lib/storage";

export default function AdvanceRegistrationForm() {
  const [data, setData] = useState<AdvanceRegistrationData[]>(storage.getAdvanceRegistrations());
  const owners = storage.getLandOwners();
  const [form, setForm] = useState({
    ownerId: "",
    advanceAmount: "",
    advanceDate: "",
    registrationDate: "",
    buyerName: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: AdvanceRegistrationData = {
      ...form,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    storage.addAdvanceRegistration(item);
    setData(storage.getAdvanceRegistrations());
    setForm({ ownerId: "", advanceAmount: "", advanceDate: "", registrationDate: "", buyerName: "", notes: "" });
    toast.success("Advance & registration saved!");
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
              <Label htmlFor="amount">Advance Amount (₹)</Label>
              <Input id="amount" type="number" placeholder="Advance amount" value={form.advanceAmount} onChange={e => setForm(f => ({ ...f, advanceAmount: e.target.value }))} required />
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
              <Button type="submit" className="w-full sm:w-auto">Save Advance & Registration</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DataTable
        title="Saved Records"
        columns={[
          { key: "buyerName", label: "Buyer" },
          { key: "advanceAmount", label: "Amount (₹)" },
          { key: "advanceDate", label: "Advance Date" },
          { key: "registrationDate", label: "Reg. Date" },
        ]}
        data={data}
        onDelete={handleDelete}
      />
    </Layout>
  );
}
