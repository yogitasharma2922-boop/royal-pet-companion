
# Royal Pet Clinic Management System

## Overview
A comprehensive veterinary clinic management system for a small team (Doctor + Receptionist) with role-based access, fast data entry, and complete patient history tracking.

## Backend Setup (Supabase)
- Authentication with login/registration pages
- Role-based access (Doctor, Receptionist) using a separate `user_roles` table
- Full database with tables for owners, pets, visits, clinical exams, diagnoses, treatments, prescriptions, vaccinations, billing, stock, and appointments

## Core ID & Case Number System
- **Owner ID**: Auto-generated permanent ID per owner (linked by mobile number)
- **Pet ID**: Auto-generated permanent ID per pet
- **Case Number**: `RPC-YYYYMMDD-XXX` format, auto-incrementing daily
- Searching by owner mobile or pet name instantly loads full history

## Pages & Modules

### 1. Login & Registration
- Login page with email/password
- Registration page with role selection
- Redirect to dashboard after login

### 2. Dashboard
- Today's patients summary
- Pending follow-ups list
- Low stock alerts
- Upcoming appointments
- Quick search bar (by owner mobile or pet name)

### 3. Registration / Walk-In
- Fast-entry form: Owner details (name, mobile, alternate, address) and Pet details (name, animal type, breed, age, sex, weight)
- Auto-detect returning owners by mobile number → auto-fill owner & pet info
- Auto-generate Case No, Date, Sr No
- Minimal clicks: dropdowns for animal type, breed suggestions, quick number inputs

### 4. Clinical Examination
- Vitals: Temperature, Respiration Rate, Heart Rate
- General Exam: Weight, Mucous Membrane, Dehydration, Body Condition, Appetite, Gait, Urination, Stool (all as quick dropdowns/radio buttons)
- System Exam: Alimentary, Respiratory, Cardiovascular, Urogenital, Gynecology, Skin (normal/abnormal with notes)

### 5. Diagnosis & Tests
- Quick-select common tests: Blood Test, CBC, LFT, KFT, Electrolyte, Thyroid, Viral, X-Ray, Sonography, Echo, ECG
- Store test results and reports per visit
- View past test history for the pet

### 6. Treatment
- Quick-select treatment categories: Antibiotic, Antifungal, Antiviral, Vitamin, Mineral, Painkiller, Saline
- Link to stock for availability check

### 7. Prescription
- Add medicines with Dose, Duration, Instructions
- Block prescribing if medicine is out of stock
- Generate downloadable PDF prescription

### 8. Vaccination
- Dog vaccines: 9in1, Anti Rabies, Corona, Kennel Cough
- Cat vaccines: Tricat, Anti Rabies
- Other: Deworming, Tick medicine
- Auto-create 21-day follow-up reminder after vaccination

### 9. Billing & Invoice
- Line items: Consultation, Treatment, Medicines, Vaccination, Food
- Payment mode: Cash / Online
- Auto-total calculation
- Generate downloadable PDF invoice

### 10. Stock Management
- Track Medicines, Vaccines, Consumables with quantity and expiry
- Low stock alerts (configurable threshold)
- Expiry date alerts
- Block prescribing unavailable items

### 11. Appointment Scheduler
- Calendar view for booking appointments
- Follow-up visit tracking
- Link appointments to existing pets/owners

### 12. Reminders & Notifications
- In-app "Thank you" popup after each visit with pet name
- In-app reminders for: vaccination due, follow-up due, tomorrow's appointments
- WhatsApp message integration via edge function for sending reminders to owners

## Role-Based Access
- **Doctor**: Full access to all modules including clinical exam, diagnosis, treatment, prescription
- **Receptionist**: Access to registration, billing, appointments, stock management; read-only for clinical data

## Design & UX
- Professional dark sidebar navigation with icons
- Clean, fast-entry forms with tab navigation between fields
- Pet history panel accessible from any module
- Search bar always visible in header
- Mobile-responsive but optimized for desktop use
