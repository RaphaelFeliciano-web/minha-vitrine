import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ALERTA: Variáveis do Supabase ausentes. O app pode falhar ao conectar.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");