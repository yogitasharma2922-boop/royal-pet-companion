import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, AlertTriangle, Stethoscope } from "lucide-react";
import Layout from "@/components/Layout";

export default function Dashboard() {
  const [stats, setStats] = useState({ todayVisits: 0, pendingFollowups: 0, lowStock: 0, todayAppointments: 0 });

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split("T")[0];

      const [visits, followups, stock, appointments] = await Promise.all([
        supabase.from("visits").select("id", { count: "exact", head: true }).eq("visit_date", today),
        supabase.from("reminders").select("id", { count: "exact", head: true }).eq("sent", false).lte("reminder_date", today),
        supabase.from("stock").select("id, quantity, min_threshold"),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("appointment_date", today).eq("status", "scheduled"),
      ]);

      const lowStockCount = (stock.data ?? []).filter((s) => s.quantity <= s.min_threshold).length;

      setStats({
        todayVisits: visits.count ?? 0,
        pendingFollowups: followups.count ?? 0,
        lowStock: lowStockCount,
        todayAppointments: appointments.count ?? 0,
      });
    };
    load();
  }, []);

  const cards = [
    { title: "Today's Patients", value: stats.todayVisits, icon: Stethoscope, color: "text-primary" },
    { title: "Pending Follow-ups", value: stats.pendingFollowups, icon: CalendarDays, color: "text-accent" },
    { title: "Low Stock Alerts", value: stats.lowStock, icon: AlertTriangle, color: "text-destructive" },
    { title: "Today's Appointments", value: stats.todayAppointments, icon: Users, color: "text-primary" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.title} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{c.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
