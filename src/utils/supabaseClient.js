import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vkkrnepveivqymcmondu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZra3JuZXB2ZWl2cXltY21vbmR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyNzcxNTEsImV4cCI6MjA1Mjg1MzE1MX0.LFpTm0ylaZipGNojvJjlKfCCxFWBXmDVY0xYy7S2MOw';

export const supabase = createClient(supabaseUrl, supabaseKey);
