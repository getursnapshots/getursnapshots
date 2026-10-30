-- ====================================================================
-- SUPABASE SCHEMA FOR SNAP SHOTS APPOINTMENT BOOKINGS
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/llxrklcidaqszupftvmc/sql
-- ====================================================================

-- 1. Create the bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    service TEXT,
    package TEXT,
    price TEXT,
    event_date TEXT,
    time TEXT,
    duration TEXT,
    location TEXT,
    country TEXT DEFAULT 'India',
    coupon_code TEXT,
    discount_applied TEXT,
    requirements TEXT,
    source TEXT DEFAULT 'Website Booking Form',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow visitors to insert new booking appointments (Anonymous & Authenticated)
DROP POLICY IF EXISTS "Allow public booking submissions" ON public.bookings;
CREATE POLICY "Allow public booking submissions"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. Policy: Allow reading bookings (Anonymous & Authenticated)
DROP POLICY IF EXISTS "Allow reading bookings" ON public.bookings;
CREATE POLICY "Allow reading bookings"
ON public.bookings
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Policy: Allow update status of bookings
DROP POLICY IF EXISTS "Allow updating bookings" ON public.bookings;
CREATE POLICY "Allow updating bookings"
ON public.bookings
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON public.bookings (phone);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON public.bookings (email);
