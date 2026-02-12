export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string | null
          created_at: string
          id: string
          is_followup: boolean | null
          pet_id: string
          reason: string | null
          status: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time?: string | null
          created_at?: string
          id?: string
          is_followup?: boolean | null
          pet_id: string
          reason?: string | null
          status?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string | null
          created_at?: string
          id?: string
          is_followup?: boolean | null
          pet_id?: string
          reason?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_items: {
        Row: {
          amount: number
          bill_id: string
          category: string
          description: string
          id: string
          quantity: number
        }
        Insert: {
          amount?: number
          bill_id: string
          category?: string
          description: string
          id?: string
          quantity?: number
        }
        Update: {
          amount?: number
          bill_id?: string
          category?: string
          description?: string
          id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          created_at: string
          id: string
          payment_mode: string | null
          status: string | null
          total_amount: number
          visit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payment_mode?: string | null
          status?: string | null
          total_amount?: number
          visit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payment_mode?: string | null
          status?: string | null
          total_amount?: number
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      case_number_counter: {
        Row: {
          counter: number
          date: string
        }
        Insert: {
          counter?: number
          date?: string
        }
        Update: {
          counter?: number
          date?: string
        }
        Relationships: []
      }
      clinical_exams: {
        Row: {
          alimentary: string | null
          alimentary_notes: string | null
          appetite: string | null
          body_condition: string | null
          cardiovascular: string | null
          cardiovascular_notes: string | null
          created_at: string
          dehydration: string | null
          gait: string | null
          gynecology: string | null
          gynecology_notes: string | null
          heart_rate: string | null
          id: string
          mucous_membrane: string | null
          respiration_rate: string | null
          respiratory: string | null
          respiratory_notes: string | null
          skin: string | null
          skin_notes: string | null
          stool: string | null
          temperature: number | null
          urination: string | null
          urogenital: string | null
          urogenital_notes: string | null
          visit_id: string
          weight: number | null
        }
        Insert: {
          alimentary?: string | null
          alimentary_notes?: string | null
          appetite?: string | null
          body_condition?: string | null
          cardiovascular?: string | null
          cardiovascular_notes?: string | null
          created_at?: string
          dehydration?: string | null
          gait?: string | null
          gynecology?: string | null
          gynecology_notes?: string | null
          heart_rate?: string | null
          id?: string
          mucous_membrane?: string | null
          respiration_rate?: string | null
          respiratory?: string | null
          respiratory_notes?: string | null
          skin?: string | null
          skin_notes?: string | null
          stool?: string | null
          temperature?: number | null
          urination?: string | null
          urogenital?: string | null
          urogenital_notes?: string | null
          visit_id: string
          weight?: number | null
        }
        Update: {
          alimentary?: string | null
          alimentary_notes?: string | null
          appetite?: string | null
          body_condition?: string | null
          cardiovascular?: string | null
          cardiovascular_notes?: string | null
          created_at?: string
          dehydration?: string | null
          gait?: string | null
          gynecology?: string | null
          gynecology_notes?: string | null
          heart_rate?: string | null
          id?: string
          mucous_membrane?: string | null
          respiration_rate?: string | null
          respiratory?: string | null
          respiratory_notes?: string | null
          skin?: string | null
          skin_notes?: string | null
          stool?: string | null
          temperature?: number | null
          urination?: string | null
          urogenital?: string | null
          urogenital_notes?: string | null
          visit_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_exams_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: true
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnoses: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          report_url: string | null
          result: string | null
          test_type: string
          visit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          report_url?: string | null
          result?: string | null
          test_type: string
          visit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          report_url?: string | null
          result?: string | null
          test_type?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          address: string | null
          alternate_mobile: string | null
          created_at: string
          id: string
          mobile: string
          name: string
          owner_number: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          alternate_mobile?: string | null
          created_at?: string
          id?: string
          mobile: string
          name: string
          owner_number?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          alternate_mobile?: string | null
          created_at?: string
          id?: string
          mobile?: string
          name?: string
          owner_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      pets: {
        Row: {
          age: string | null
          animal_type: string
          breed: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          pet_number: number
          sex: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          age?: string | null
          animal_type?: string
          breed?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
          pet_number?: number
          sex?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          age?: string | null
          animal_type?: string
          breed?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          pet_number?: number
          sex?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          dose: string | null
          duration: string | null
          id: string
          instructions: string | null
          medicine_name: string
          visit_id: string
        }
        Insert: {
          created_at?: string
          dose?: string | null
          duration?: string | null
          id?: string
          instructions?: string | null
          medicine_name: string
          visit_id: string
        }
        Update: {
          created_at?: string
          dose?: string | null
          duration?: string | null
          id?: string
          instructions?: string | null
          medicine_name?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          id: string
          message: string | null
          pet_id: string
          reminder_date: string
          reminder_type: string
          sent: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          pet_id: string
          reminder_date: string
          reminder_type: string
          sent?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          pet_id?: string
          reminder_date?: string
          reminder_type?: string
          sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      stock: {
        Row: {
          category: string
          created_at: string
          expiry_date: string | null
          id: string
          item_name: string
          min_threshold: number
          price: number | null
          quantity: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          item_name: string
          min_threshold?: number
          price?: number | null
          quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          item_name?: string
          min_threshold?: number
          price?: number | null
          quantity?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      treatments: {
        Row: {
          category: string
          created_at: string
          dosage: string | null
          id: string
          medicine_name: string
          notes: string | null
          visit_id: string
        }
        Insert: {
          category: string
          created_at?: string
          dosage?: string | null
          id?: string
          medicine_name: string
          notes?: string | null
          visit_id: string
        }
        Update: {
          category?: string
          created_at?: string
          dosage?: string | null
          id?: string
          medicine_name?: string
          notes?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          created_at: string
          id: string
          next_due_date: string | null
          notes: string | null
          pet_id: string
          vaccine_date: string
          vaccine_name: string
          visit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id: string
          vaccine_date?: string
          vaccine_name: string
          visit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string
          vaccine_date?: string
          vaccine_name?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          case_number: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          pet_id: string
          serial_number: number | null
          status: string | null
          visit_date: string
        }
        Insert: {
          case_number: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          pet_id: string
          serial_number?: number | null
          status?: string | null
          visit_date?: string
        }
        Update: {
          case_number?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          pet_id?: string
          serial_number?: number | null
          status?: string | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_next_case_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "doctor" | "receptionist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["doctor", "receptionist"],
    },
  },
} as const
