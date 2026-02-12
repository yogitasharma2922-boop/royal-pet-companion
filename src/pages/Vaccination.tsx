import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const vaccinesByAnimal: Record<string, string[]> = {
  Dog: ["9in1", "Anti Rabies", "Corona", "Kennel Cough", "Deworming", "Tick Medicine"],
  Cat: ["Tricat", "Anti Rabies", "Deworming", "Tick Medicine"],
  Other: ["Deworming", "Tick Medicine"],
};

export default function Vaccination() {
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState("");
  const [vaccine, setVaccine] = useState("");
  const [notes, setNotes] = useState("");
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [animalType, setAnimalType] = useState("Dog");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase.from("visits").select("id, case_number, pet_id, pets(name, animal_type)").eq("visit_date", today).then(({ data }) => setVisits(data ?? []));
  }, []);

  useEffect(() => {
    if (!selectedVisit) return;
    const v = visits.find((x) => x.id === selectedVisit);
    setAnimalType((v?.pets as any)?.animal_type ?? "Dog");
    supabase.from("vaccinations").select("*").eq("visit_id", selectedVisit).order("created_at").then(({ data }) => setVaccinations(data ?? []));
  }, [selectedVisit, visits]);

  const add = async () => {
    if (!selectedVisit || !vaccine) return;
    const v = visits.find((x) => x.id === selectedVisit);
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + 21);

    const { error } = await supabase.from("vaccinations").insert({
      visit_id: selectedVisit, pet_id: v?.pet_id, vaccine_name: vaccine, next_due_date: nextDue.toISOString().split("T")[0], notes: notes || null,
    });
    if (error) { toast.error(error.message); return; }

    // Create reminder
    await supabase.from("reminders").insert({
      pet_id: v?.pet_id, reminder_type: "vaccination", reminder_date: nextDue.toISOString().split("T")[0],
      message: `${vaccine} follow-up due for ${(v?.pets as any)?.name}`,
    });

    toast.success("Vaccination recorded & reminder set!");
    setVaccine(""); setNotes("");
    const { data } = await supabase.from("vaccinations").select("*").eq("visit_id", selectedVisit).order("created_at");
    setVaccinations(data ?? []);
  };

  return (
    <Layout>
      <div className="max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Vaccination</h1>
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
              <CardHeader><CardTitle className="text-lg">Administer Vaccine</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(vaccinesByAnimal[animalType] ?? vaccinesByAnimal.Other).map((v) => (
                    <Badge key={v} variant={vaccine === v ? "default" : "outline"} className="cursor-pointer" onClick={() => setVaccine(v)}>{v}</Badge>
                  ))}
                </div>
                <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
                <Button onClick={add} disabled={!vaccine}><Plus className="h-4 w-4 mr-1" /> Record Vaccination</Button>
              </CardContent>
            </Card>

            {vaccinations.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Vaccines Given</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {vaccinations.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <Badge>{v.vaccine_name}</Badge>
                        <span className="ml-2 text-sm text-muted-foreground">Given: {v.vaccine_date} | Next due: {v.next_due_date}</span>
                      </div>
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
