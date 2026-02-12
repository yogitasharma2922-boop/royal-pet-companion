import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const categories = ["Antibiotic", "Antifungal", "Antiviral", "Vitamin", "Mineral", "Painkiller", "Saline"];

export default function Treatment() {
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState("");
  const [treatments, setTreatments] = useState<any[]>([]);
  const [form, setForm] = useState({ category: "", medicine_name: "", dosage: "", notes: "" });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase.from("visits").select("id, case_number, pets(name)").eq("visit_date", today).then(({ data }) => setVisits(data ?? []));
  }, []);

  useEffect(() => {
    if (!selectedVisit) return;
    supabase.from("treatments").select("*").eq("visit_id", selectedVisit).order("created_at").then(({ data }) => setTreatments(data ?? []));
  }, [selectedVisit]);

  const addTreatment = async () => {
    if (!selectedVisit || !form.category || !form.medicine_name) return;
    const { error } = await supabase.from("treatments").insert({ visit_id: selectedVisit, ...form });
    if (error) { toast.error(error.message); return; }
    toast.success("Treatment added!");
    setForm({ category: "", medicine_name: "", dosage: "", notes: "" });
    const { data } = await supabase.from("treatments").select("*").eq("visit_id", selectedVisit).order("created_at");
    setTreatments(data ?? []);
  };

  const remove = async (id: string) => {
    await supabase.from("treatments").delete().eq("id", id);
    setTreatments((t) => t.filter((x) => x.id !== id));
  };

  return (
    <Layout>
      <div className="max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Treatment</h1>
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
              <CardHeader><CardTitle className="text-lg">Add Treatment</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Badge key={c} variant={form.category === c ? "default" : "outline"} className="cursor-pointer" onClick={() => setForm((f) => ({ ...f, category: c }))}>
                      {c}
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2"><Label>Medicine Name *</Label><Input value={form.medicine_name} onChange={(e) => setForm((f) => ({ ...f, medicine_name: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Dosage</Label><Input value={form.dosage} onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
                </div>
                <Button onClick={addTreatment} disabled={!form.category || !form.medicine_name}><Plus className="h-4 w-4 mr-1" /> Add</Button>
              </CardContent>
            </Card>

            {treatments.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Treatments</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {treatments.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <Badge variant="secondary">{t.category}</Badge>
                        <span className="ml-2 font-medium">{t.medicine_name}</span>
                        {t.dosage && <span className="ml-2 text-sm text-muted-foreground">— {t.dosage}</span>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
