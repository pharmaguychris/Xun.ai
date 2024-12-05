import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.1/+esm'

// Initialize Supabase client
const supabaseUrl = 'https://tgfrxcymiwzdyxjpqxvg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZnJ4Y3ltaXd6ZHl4anBxeHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNzAwOTEsImV4cCI6MjA0ODk0NjA5MX0.4eUvssudTmYZSLv4BLjAymamKLieKD0OtovpzsQQOMQ'

export const supabase = createClient(supabaseUrl, supabaseKey);
