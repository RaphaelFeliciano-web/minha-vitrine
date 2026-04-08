import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERRO: Variáveis de ambiente do Supabase não encontradas. Verifique o arquivo .env ou as configurações da Vercel.");
}

// O fallback para string vazia evita que o JS trave o carregamento da página inteira
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "")