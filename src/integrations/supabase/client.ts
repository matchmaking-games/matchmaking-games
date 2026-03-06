import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://njyoimhjfqtygnlccjzq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qeW9pbWhqZnF0eWdubGNjanpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzkwMzgsImV4cCI6MjA4NDI1NTAzOH0.E8XtlZQiEdmcPb1fGXLQVBQfpaM4H15oePZJG-BncyU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
