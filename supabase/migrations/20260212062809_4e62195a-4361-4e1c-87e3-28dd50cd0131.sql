
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('doctor', 'receptionist');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Owners table
CREATE TABLE public.owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_number SERIAL,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  alternate_mobile TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage owners" ON public.owners
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_number SERIAL,
  owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  animal_type TEXT NOT NULL DEFAULT 'Dog',
  breed TEXT,
  age TEXT,
  sex TEXT DEFAULT 'Male',
  weight DECIMAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage pets" ON public.pets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Case number sequence (daily reset handled in app logic)
CREATE TABLE public.case_number_counter (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  counter INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.case_number_counter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage counter" ON public.case_number_counter
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Generate next case number
CREATE OR REPLACE FUNCTION public.get_next_case_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  next_num INTEGER;
BEGIN
  INSERT INTO case_number_counter (date, counter) VALUES (today, 1)
  ON CONFLICT (date) DO UPDATE SET counter = case_number_counter.counter + 1
  RETURNING counter INTO next_num;
  RETURN 'RPC-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(next_num::TEXT, 3, '0');
END;
$$;

-- Visits table
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  case_number TEXT NOT NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  serial_number INTEGER,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage visits" ON public.visits
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Clinical examinations
CREATE TABLE public.clinical_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL UNIQUE,
  temperature DECIMAL,
  respiration_rate TEXT,
  heart_rate TEXT,
  weight DECIMAL,
  mucous_membrane TEXT,
  dehydration TEXT,
  body_condition TEXT,
  appetite TEXT,
  gait TEXT,
  urination TEXT,
  stool TEXT,
  alimentary TEXT DEFAULT 'normal',
  alimentary_notes TEXT,
  respiratory TEXT DEFAULT 'normal',
  respiratory_notes TEXT,
  cardiovascular TEXT DEFAULT 'normal',
  cardiovascular_notes TEXT,
  urogenital TEXT DEFAULT 'normal',
  urogenital_notes TEXT,
  gynecology TEXT DEFAULT 'normal',
  gynecology_notes TEXT,
  skin TEXT DEFAULT 'normal',
  skin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clinical_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage clinical_exams" ON public.clinical_exams
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Diagnoses & tests
CREATE TABLE public.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  test_type TEXT NOT NULL,
  result TEXT,
  notes TEXT,
  report_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage diagnoses" ON public.diagnoses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Treatments
CREATE TABLE public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage treatments" ON public.treatments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Prescriptions
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  medicine_name TEXT NOT NULL,
  dose TEXT,
  duration TEXT,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage prescriptions" ON public.prescriptions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Vaccinations
CREATE TABLE public.vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  vaccine_name TEXT NOT NULL,
  vaccine_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage vaccinations" ON public.vaccinations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Stock / Inventory
CREATE TABLE public.stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Medicine',
  quantity INTEGER NOT NULL DEFAULT 0,
  min_threshold INTEGER NOT NULL DEFAULT 5,
  expiry_date DATE,
  unit TEXT DEFAULT 'pcs',
  price DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage stock" ON public.stock
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Billing
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL NOT NULL DEFAULT 0,
  payment_mode TEXT DEFAULT 'Cash',
  status TEXT DEFAULT 'unpaid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage bills" ON public.bills
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Consultation',
  amount DECIMAL NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1
);
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage bill_items" ON public.bill_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  reason TEXT,
  status TEXT DEFAULT 'scheduled',
  is_followup BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage appointments" ON public.appointments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Reminders
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  reminder_type TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  message TEXT,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage reminders" ON public.reminders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON public.owners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stock_updated_at BEFORE UPDATE ON public.stock FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
