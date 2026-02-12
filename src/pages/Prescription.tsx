import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Download } from "lucide-react";

export default function Prescription() {
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState("");
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [form, setForm] = useState({ medicine_name: "", dose: "", duration: "", instructions: "" });
  const [visitInfo, setVisitInfo] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase.from("visits").select("id, case_number, visit_date, pets(name, animal_type, breed, owner_id, owners(name, mobile))").eq("visit_date", today).then(({ data }) => setVisits(data ?? []));
  }, []);

  useEffect(() => {
    if (!selectedVisit) return;
    supabase.from("prescriptions").select("*").eq("visit_id", selectedVisit).order("created_at").then(({ data }) => setPrescriptions(data ?? []));
    const v = visits.find((x) => x.id === selectedVisit);
    setVisitInfo(v);
  }, [selectedVisit, visits]);

  const add = async () => {
    if (!selectedVisit || !form.medicine_name) return;
    // Check stock
    const { data: stockItem } = await supabase.from("stock").select("quantity").ilike("item_name", form.medicine_name).maybeSingle();
    if (stockItem && stockItem.quantity <= 0) {
      toast.error(`${form.medicine_name} is out of stock!`);
      return;
    }
    const { error } = await supabase.from("prescriptions").insert({ visit_id: selectedVisit, ...form });
    if (error) { toast.error(error.message); return; }
    toast.success("Added!");
    setForm({ medicine_name: "", dose: "", duration: "", instructions: "" });
    const { data } = await supabase.from("prescriptions").select("*").eq("visit_id", selectedVisit).order("created_at");
    setPrescriptions(data ?? []);
  };

  const remove = async (id: string) => {
    await supabase.from("prescriptions").delete().eq("id", id);
    setPrescriptions((p) => p.filter((x) => x.id !== id));
  };

  const printPrescription = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Prescription</title><style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f5f5f5}h1{color:#1a7a5a}</style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  const pet = visitInfo?.pets as any;
  const owner = pet?.owners as any;

  return (
    <Layout>
      <div className="max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Prescription</h1>
        <div className="max-w-sm space-y-2">
          <Label>Select Visit</Label>
          <Select value={selectedVisit} onValueChange={setSelectedVisit}>
            <SelectTrigger><SelectValue placeholder="Choose a visit" /></SelectTrigger>
            <SelectContent>{visits.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.case_number} — {(v.pets as any)?.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {selectedVisit && (
          <>
            <Card>
              <CardHeader><CardTitle className="text-lg">Add Medicine</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2"><Label>Medicine *</Label><Input value={form.medicine_name} onChange={(e) => setForm((f) => ({ ...f, medicine_name: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Dose</Label><Input value={form.dose} onChange={(e) => setForm((f) => ({ ...f, dose: e.target.value }))} placeholder="e.g. 250mg" /></div>
                <div className="space-y-2"><Label>Duration</Label><Input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} placeholder="e.g. 5 days" /></div>
                <div className="space-y-2"><Label>Instructions</Label><Input value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} placeholder="e.g. After food" /></div>
              </CardContent>
              <div className="px-6 pb-4">
                <Button onClick={add} disabled={!form.medicine_name}><Plus className="h-4 w-4 mr-1" /> Add</Button>
              </div>
            </Card>

            {prescriptions.length > 0 && (
              <>
                <div ref={printRef}>
                  <div style={{ marginBottom: 16 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a7a5a" }}>Royal Pet Clinic — Prescription</h2>
                    <p>Case: {visitInfo?.case_number} | Date: {visitInfo?.visit_date}</p>
                    {owner && <p>Owner: {owner.name} | Mobile: {owner.mobile}</p>}
                    {pet && <p>Pet: {pet.name} ({pet.animal_type} {pet.breed ? `- ${pet.breed}` : ""})</p>}
                  </div>
                  <table>
                    <thead><tr><th>#</th><th>Medicine</th><th>Dose</th><th>Duration</th><th>Instructions</th></tr></thead>
                    <tbody>
                      {prescriptions.map((p, i) => (
                        <tr key={p.id}><td>{i + 1}</td><td>{p.medicine_name}</td><td>{p.dose}</td><td>{p.duration}</td><td>{p.instructions}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2">
                  {prescriptions.map((p) => (
                    <Button key={p.id} variant="ghost" size="sm" onClick={() => remove(p.id)}><Trash2 className="h-3 w-3 mr-1" /> {p.medicine_name}</Button>
                  ))}
                </div>

                <Button onClick={printPrescription} variant="outline"><Download className="h-4 w-4 mr-1" /> Print / Download PDF</Button>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
