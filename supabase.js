import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient('https://nykhsxrubtzttvmjreft.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55a2hzeHJ1YnR6dHR2bWpyZWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM1OTMyNTAsImV4cCI6MTk4OTE2OTI1MH0.1AUgn9gLgaeBDt1MeScBzym2PkUXAFXWJlx3K28Iz44')