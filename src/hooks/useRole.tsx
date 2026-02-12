import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "doctor" | "receptionist";

export const useRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      setRole((data?.role as AppRole) ?? null);
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const isDoctor = role === "doctor";
  const isReceptionist = role === "receptionist";

  return { role, loading, isDoctor, isReceptionist };
};
