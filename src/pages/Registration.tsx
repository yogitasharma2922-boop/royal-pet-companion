import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const breeds: Record<string, string[]> = {
  Dog: ["Labrador", "German Shepherd", "Golden Retriever", "Pug", "Beagle", "Rottweiler", "Bulldog", "Poodle", "Husky", "Pomeranian", "Indie", "Other"],
  Cat: ["Persian", "Siamese", "Maine Coon", "Bengal", "Ragdoll", "British Shorthair", "Indie", "Other"],
  Other: ["Other"],
};

export default function Registration() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [alternateMobile, setAlternateMobile] = useState("");
  const [address, setAddress] = useState("");
  const [petName, setPetName] = useState("");
  const [animalType, setAnimalType] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("Male");
  const [weight, setWeight] = useState("");
  const [existingOwnerId, setExistingOwnerId] = useState<string | null>(null);
  const [existingPets, setExistingPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) {
      setMobile(q);
      lookupOwner(q);
    }
  }, [searchParams]);

  const lookupOwner = async (phone: string) => {
    if (phone.length < 10) return;
    const { data: owner } = await supabase.from("owners").select("*").eq("mobile", phone).maybeSingle();
    if (owner) {
      setExistingOwnerId(owner.id);
      setOwnerName(owner.name);
      setAlternateMobile(owner.alternate_mobile ?? "");
      setAddress(owner.address ?? "");
      toast.info(`Returning owner: ${owner.name}`);
      const { data: pets } = await supabase.from("pets").select("*").eq("owner_id", owner.id);
      setExistingPets(pets ?? []);
    } else {
      setExistingOwnerId(null);
      setExistingPets([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let ownerId = existingOwnerId;
      if (!ownerId) {
        const { data: newOwner, error } = await supabase.from("owners").insert({ name: ownerName, mobile, alternate_mobile: alternateMobile || null, address: address || null }).select().single();
        if (error) throw error;
        ownerId = newOwner.id;
      }

      const { data: pet, error: petError } = await supabase.from("pets").insert({
        owner_id: ownerId, name: petName, animal_type: animalType, breed: breed || null, age: age || null, sex, weight: weight ? parseFloat(weight) : null,
      }).select().single();
      if (petError) throw petError;

      const { data: caseNum } = await supabase.rpc("get_next_case_number");

      const { error: visitError } = await supabase.from("visits").insert({
        pet_id: pet.id, case_number: caseNum as string, created_by: user?.id,
      });
      if (visitError) throw visitError;

      toast.success(`Registered! Case No: ${caseNum}`);
      // Reset pet fields
      setPetName(""); setBreed(""); setAge(""); setWeight("");
      if (!existingOwnerId) {
        setOwnerName(""); setMobile(""); setAlternateMobile(""); setAddress("");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Registration / Walk-In</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Owner Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Mobile *</Label>
                <Input value={mobile} onChange={(e) => setMobile(e.target.value)} onBlur={() => lookupOwner(mobile)} required />
              </div>
              <div className="space-y-2">
                <Label>Owner Name *</Label>
                <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Alternate Mobile</Label>
                <Input value={alternateMobile} onChange={(e) => setAlternateMobile(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {existingPets.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Existing Pets</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {existingPets.map((p) => (
                    <div key={p.id} className="rounded-lg border px-3 py-2 text-sm bg-secondary">
                      <span className="font-medium">{p.name}</span> — {p.animal_type} {p.breed ? `(${p.breed})` : ""}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-lg">New Pet Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Pet Name *</Label>
                <Input value={petName} onChange={(e) => setPetName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Animal Type</Label>
                <Select value={animalType} onValueChange={(v) => { setAnimalType(v); setBreed(""); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Breed</Label>
                <Select value={breed} onValueChange={setBreed}>
                  <SelectTrigger><SelectValue placeholder="Select breed" /></SelectTrigger>
                  <SelectContent>
                    {(breeds[animalType] ?? []).map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 2 years" />
              </div>
              <div className="space-y-2">
                <Label>Sex</Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Registering..." : "Register & Create Visit"}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
