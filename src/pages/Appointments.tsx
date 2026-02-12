import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { format } from "date-fns";

export default function Appointments() {
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("10:00");
  const [reason, setReason] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("pets").select("id, name, owners(name)").order("name").then(({ data }) => setPets(data ?? []));
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const { data } = await supabase.from("appointments").select("*, pets(name, owners(name))").order("appointment_date").limit(50);
    setAppointments(data ?? []);
  };

  const add = async () => {
    if (!selectedPet || !date) return;
    const { error } = await supabase.from("appointments").insert({
      pet_id: selectedPet, appointment_date: format(date, "yyyy-MM-dd"), appointment_time: time, reason: reason || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Appointment booked!");
    setSelectedPet(""); setReason("");
    loadAppointments();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("appointments").update({ status }).eq("id", id);
    loadAppointments();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Appointments</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Book Appointment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pet</Label>
                <Select value={selectedPet} onValueChange={setSelectedPet}>
                  <SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
                  <SelectContent>{pets.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} — {(p.owners as any)?.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              <div className="space-y-2"><Label>Time</Label><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
              <div className="space-y-2"><Label>Reason</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} /></div>
              <Button onClick={add} disabled={!selectedPet || !date}><Plus className="h-4 w-4 mr-1" /> Book</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Upcoming</CardTitle></CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-auto">
              {appointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{(a.pets as any)?.name} — {(a.pets as any)?.owners?.name}</p>
                    <p className="text-sm text-muted-foreground">{a.appointment_date} at {a.appointment_time} {a.reason && `• ${a.reason}`}</p>
                    <Badge variant={a.status === "completed" ? "default" : a.status === "cancelled" ? "destructive" : "secondary"}>
                      {a.status}
                    </Badge>
                  </div>
                  {a.status === "scheduled" && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "completed")}>Done</Button>
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(a.id, "cancelled")}>Cancel</Button>
                    </div>
                  )}
                </div>
              ))}
              {appointments.length === 0 && <p className="text-muted-foreground text-sm">No appointments yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
