import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validação rigorosa para evitar que o app quebre silenciosamente
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "" || supabaseAnonKey === "") {
  throw new Error(
    "FALHA NA CONEXÃO SUPABASE: Chaves de API não encontradas.\n" +
    "Verifique se o arquivo .env.local existe localmente ou se as variáveis de ambiente foram configuradas no painel da Vercel."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)