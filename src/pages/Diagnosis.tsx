import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const testTypes = ["Blood Test", "CBC", "LFT", "KFT", "Electrolyte", "Thyroid", "Viral", "X-Ray", "Sonography", "Echo", "ECG"];

export default function Diagnosis() {
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState("");
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [newTest, setNewTest] = useState({ test_type: "", result: "", notes: "" });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase.from("visits").select("id, case_number, pets(name)").eq("visit_date", today).then(({ data }) => setVisits(data ?? []));
  }, []);

  useEffect(() => {
    if (!selectedVisit) return;
    supabase.from("diagnoses").select("*").eq("visit_id", selectedVisit).order("created_at").then(({ data }) => setDiagnoses(data ?? []));
  }, [selectedVisit]);

  const addTest = async () => {
    if (!selectedVisit || !newTest.test_type) return;
    const { error } = await supabase.from("diagnoses").insert({ visit_id: selectedVisit, ...newTest });
    if (error) { toast.error(error.message); return; }
    toast.success("Test added!");
    setNewTest({ test_type: "", result: "", notes: "" });
    const { data } = await supabase.from("diagnoses").select("*").eq("visit_id", selectedVisit).order("created_at");
    setDiagnoses(data ?? []);
  };

  const deleteTest = async (id: string) => {
    await supabase.from("diagnoses").delete().eq("id", id);
    setDiagnoses((d) => d.filter((t) => t.id !== id));
  };

  return (
    <Layout>
      <div className="max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Diagnosis & Tests</h1>
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
              <CardHeader><CardTitle className="text-lg">Add Test</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {testTypes.map((t) => (
                    <Badge key={t} variant={newTest.test_type === t ? "default" : "outline"} className="cursor-pointer" onClick={() => setNewTest((n) => ({ ...n, test_type: t }))}>
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Result</Label><Input value={newTest.result} onChange={(e) => setNewTest((n) => ({ ...n, result: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Notes</Label><Textarea value={newTest.notes} onChange={(e) => setNewTest((n) => ({ ...n, notes: e.target.value }))} rows={2} /></div>
                </div>
                <Button onClick={addTest} disabled={!newTest.test_type}><Plus className="h-4 w-4 mr-1" /> Add Test</Button>
              </CardContent>
            </Card>

            {diagnoses.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Recorded Tests</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {diagnoses.map((d) => (
                    <div key={d.id} className="flex items-start justify-between rounded-lg border p-3">
                      <div>
                        <Badge>{d.test_type}</Badge>
                        {d.result && <p className="mt-1 text-sm">Result: {d.result}</p>}
                        {d.notes && <p className="text-sm text-muted-foreground">{d.notes}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteTest(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
