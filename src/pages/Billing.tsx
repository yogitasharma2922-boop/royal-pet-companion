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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const itemCategories = ["Consultation", "Treatment", "Medicines", "Vaccination", "Food"];

export default function Billing() {
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ description: "", category: "Consultation", amount: "", quantity: "1" });
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [bill, setBill] = useState<any>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [petName, setPetName] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase.from("visits").select("id, case_number, pets(name, owners(name, mobile))").eq("visit_date", today).then(({ data }) => setVisits(data ?? []));
  }, []);

  useEffect(() => {
    if (!selectedVisit) return;
    loadBill();
    const v = visits.find((x) => x.id === selectedVisit);
    setPetName((v?.pets as any)?.name ?? "");
  }, [selectedVisit, visits]);

  const loadBill = async () => {
    const { data: existingBill } = await supabase.from("bills").select("*").eq("visit_id", selectedVisit).maybeSingle();
    setBill(existingBill);
    if (existingBill) {
      const { data } = await supabase.from("bill_items").select("*").eq("bill_id", existingBill.id);
      setItems(data ?? []);
    } else {
      setItems([]);
    }
  };

  const addItem = async () => {
    if (!form.description || !form.amount) return;
    let billId = bill?.id;
    if (!billId) {
      const { data: newBill, error } = await supabase.from("bills").insert({ visit_id: selectedVisit, payment_mode: paymentMode }).select().single();
      if (error) { toast.error(error.message); return; }
      billId = newBill.id;
      setBill(newBill);
    }
    const { error } = await supabase.from("bill_items").insert({
      bill_id: billId, description: form.description, category: form.category, amount: parseFloat(form.amount), quantity: parseInt(form.quantity),
    });
    if (error) { toast.error(error.message); return; }
    setForm({ description: "", category: "Consultation", amount: "", quantity: "1" });
    const { data } = await supabase.from("bill_items").select("*").eq("bill_id", billId);
    setItems(data ?? []);
    // Update total
    const total = (data ?? []).reduce((sum, i) => sum + i.amount * i.quantity, 0);
    await supabase.from("bills").update({ total_amount: total, payment_mode: paymentMode }).eq("id", billId);
    setBill((b: any) => b ? { ...b, total_amount: total } : b);
  };

  const removeItem = async (id: string) => {
    await supabase.from("bill_items").delete().eq("id", id);
    const remaining = items.filter((i) => i.id !== id);
    setItems(remaining);
    const total = remaining.reduce((sum, i) => sum + i.amount * i.quantity, 0);
    if (bill) await supabase.from("bills").update({ total_amount: total }).eq("id", bill.id);
    setBill((b: any) => b ? { ...b, total_amount: total } : b);
  };

  const markPaid = async () => {
    if (!bill) return;
    await supabase.from("bills").update({ status: "paid", payment_mode: paymentMode }).eq("id", bill.id);
    setBill((b: any) => ({ ...b, status: "paid" }));
    toast.success("Payment recorded!");
    setShowThankYou(true);
  };

  const printInvoice = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Invoice</title><style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f5f5f5}.total{font-size:18px;font-weight:bold;margin-top:20px}h1{color:#1a7a5a}</style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  const total = items.reduce((sum, i) => sum + i.amount * i.quantity, 0);
  const v = visits.find((x) => x.id === selectedVisit);
  const owner = (v?.pets as any)?.owners as any;

  return (
    <Layout>
      <div className="max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Billing & Invoice</h1>
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
              <CardHeader><CardTitle className="text-lg">Add Line Item</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{itemCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Description *</Label><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Amount *</Label><Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Qty</Label><Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} /></div>
              </CardContent>
              <div className="px-6 pb-4">
                <Button onClick={addItem} disabled={!form.description || !form.amount}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
              </div>
            </Card>

            {items.length > 0 && (
              <>
                <div ref={printRef}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a7a5a" }}>Royal Pet Clinic — Invoice</h2>
                  <p>Case: {v?.case_number} | Date: {new Date().toLocaleDateString()}</p>
                  {owner && <p>Owner: {owner.name} | Mobile: {owner.mobile}</p>}
                  <p>Pet: {petName}</p>
                  <table>
                    <thead><tr><th>#</th><th>Category</th><th>Description</th><th>Qty</th><th>Amount</th><th>Subtotal</th></tr></thead>
                    <tbody>
                      {items.map((it, i) => (
                        <tr key={it.id}><td>{i + 1}</td><td>{it.category}</td><td>{it.description}</td><td>{it.quantity}</td><td>₹{it.amount}</td><td>₹{it.amount * it.quantity}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="total" style={{ fontSize: 18, fontWeight: 700, marginTop: 16 }}>Total: ₹{total.toFixed(2)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {items.map((it) => (
                    <Button key={it.id} variant="ghost" size="sm" onClick={() => removeItem(it.id)}><Trash2 className="h-3 w-3 mr-1" />{it.description}</Button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={markPaid} disabled={bill?.status === "paid"}>
                    {bill?.status === "paid" ? "Paid ✓" : "Mark as Paid"}
                  </Button>
                  <Button variant="outline" onClick={printInvoice}><Download className="h-4 w-4 mr-1" /> Print Invoice</Button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Dialog open={showThankYou} onOpenChange={setShowThankYou}>
        <DialogContent className="text-center">
          <DialogHeader><DialogTitle className="text-xl">Thank You! 🐾</DialogTitle></DialogHeader>
          <p className="text-lg">Thank you for visiting Royal Pet Clinic.</p>
          <p className="text-lg">Wishing good health to <span className="font-bold text-primary">{petName}</span>!</p>
          <Button className="mt-4" onClick={() => setShowThankYou(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
