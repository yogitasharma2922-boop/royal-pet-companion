import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ddOptions = {
  mucous_membrane: ["Normal (Pink)", "Pale", "Congested", "Icteric", "Cyanotic"],
  dehydration: ["None", "Mild (3-5%)", "Moderate (5-8%)", "Severe (>8%)"],
  body_condition: ["Emaciated", "Thin", "Ideal", "Overweight", "Obese"],
  appetite: ["Normal", "Decreased", "Absent", "Increased"],
  gait: ["Normal", "Lame", "Ataxic", "Recumbent"],
  urination: ["Normal", "Polyuria", "Oliguria", "Anuria", "Dysuria"],
  stool: ["Normal", "Diarrhea", "Constipation", "Bloody", "Mucoid"],
};

const systemExams = ["alimentary", "respiratory", "cardiovascular", "urogenital", "gynecology", "skin"] as const;

export default function ClinicalExam() {
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<string>("");
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase.from("visits").select("id, case_number, pet_id, pets(name, animal_type)").eq("visit_date", today).then(({ data }) => setVisits(data ?? []));
  }, []);

  useEffect(() => {
    if (!selectedVisit) return;
    supabase.from("clinical_exams").select("*").eq("visit_id", selectedVisit).maybeSingle().then(({ data }) => {
      if (data) setForm(data);
    });
  }, [selectedVisit]);

  const set = (key: string, val: string) => setForm((f: any) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!selectedVisit) return;
    setLoading(true);
    const payload = { ...form, visit_id: selectedVisit };
    delete payload.id; delete payload.created_at;

    const { data: existing } = await supabase.from("clinical_exams").select("id").eq("visit_id", selectedVisit).maybeSingle();
    let error;
    if (existing) {
      ({ error } = await supabase.from("clinical_exams").update(payload).eq("id", existing.id));
    } else {
      ({ error } = await supabase.from("clinical_exams").insert(payload));
    }
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Clinical exam saved!");
  };

  return (
    <Layout>
      <div className="max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Clinical Examination</h1>

        <div className="space-y-2 max-w-sm">
          <Label>Select Today's Visit</Label>
          <Select value={selectedVisit} onValueChange={setSelectedVisit}>
            <SelectTrigger><SelectValue placeholder="Choose a visit" /></SelectTrigger>
            <SelectContent>
              {visits.map((v: any) => (
                <SelectItem key={v.id} value={v.id}>{v.case_number} — {(v.pets as any)?.name} ({(v.pets as any)?.animal_type})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedVisit && (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Vitals</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>Temperature (°F)</Label><Input type="number" step="0.1" value={form.temperature ?? ""} onChange={(e) => set("temperature", e.target.value)} /></div>
                <div className="space-y-2"><Label>Respiration Rate</Label><Input value={form.respiration_rate ?? ""} onChange={(e) => set("respiration_rate", e.target.value)} /></div>
                <div className="space-y-2"><Label>Heart Rate</Label><Input value={form.heart_rate ?? ""} onChange={(e) => set("heart_rate", e.target.value)} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">General Examination</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" step="0.1" value={form.weight ?? ""} onChange={(e) => set("weight", e.target.value)} /></div>
                {Object.entries(ddOptions).map(([key, opts]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key.replace(/_/g, " ")}</Label>
                    <Select value={form[key] ?? ""} onValueChange={(v) => set(key, v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">System Examination</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {systemExams.map((sys) => (
                  <div key={sys} className="grid grid-cols-1 gap-2 sm:grid-cols-3 items-start">
                    <Label className="capitalize pt-2">{sys}</Label>
                    <Select value={form[sys] ?? "normal"} onValueChange={(v) => set(sys, v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="abnormal">Abnormal</SelectItem>
                      </SelectContent>
                    </Select>
                    {form[sys] === "abnormal" && (
                      <Textarea placeholder="Notes..." value={form[`${sys}_notes`] ?? ""} onChange={(e) => set(`${sys}_notes`, e.target.value)} rows={2} />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Clinical Exam"}</Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
