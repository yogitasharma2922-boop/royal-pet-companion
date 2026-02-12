import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, AlertTriangle } from "lucide-react";

const categories = ["Medicine", "Vaccine", "Consumable"];

export default function Stock() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ item_name: "", category: "Medicine", quantity: "", min_threshold: "5", expiry_date: "", unit: "pcs", price: "" });

  const load = async () => {
    const { data } = await supabase.from("stock").select("*").order("item_name");
    setItems(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.item_name || !form.quantity) return;
    const { error } = await supabase.from("stock").insert({
      item_name: form.item_name, category: form.category, quantity: parseInt(form.quantity),
      min_threshold: parseInt(form.min_threshold), expiry_date: form.expiry_date || null,
      unit: form.unit, price: form.price ? parseFloat(form.price) : 0,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Item added!");
    setForm({ item_name: "", category: "Medicine", quantity: "", min_threshold: "5", expiry_date: "", unit: "pcs", price: "" });
    load();
  };

  const isLow = (item: any) => item.quantity <= item.min_threshold;
  const isExpiring = (item: any) => {
    if (!item.expiry_date) return false;
    const diff = new Date(item.expiry_date).getTime() - Date.now();
    return diff < 30 * 24 * 60 * 60 * 1000 && diff > 0;
  };
  const isExpired = (item: any) => item.expiry_date && new Date(item.expiry_date) < new Date();

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Stock Management</h1>

        <Card>
          <CardHeader><CardTitle className="text-lg">Add Stock Item</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div className="space-y-2"><Label>Item Name *</Label><Input value={form.item_name} onChange={(e) => setForm((f) => ({ ...f, item_name: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Quantity *</Label><Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Min Threshold</Label><Input type="number" value={form.min_threshold} onChange={(e) => setForm((f) => ({ ...f, min_threshold: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} /></div>
          </CardContent>
          <div className="px-6 pb-4">
            <Button onClick={add} disabled={!form.item_name || !form.quantity}><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Inventory</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead>Qty</TableHead><TableHead>Unit</TableHead><TableHead>Price</TableHead><TableHead>Expiry</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell>{item.expiry_date ?? "—"}</TableCell>
                    <TableCell>
                      {isExpired(item) && <Badge variant="destructive">Expired</Badge>}
                      {isExpiring(item) && <Badge className="bg-accent text-accent-foreground">Expiring Soon</Badge>}
                      {isLow(item) && <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Low Stock</Badge>}
                      {!isLow(item) && !isExpired(item) && !isExpiring(item) && <Badge variant="secondary">OK</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
