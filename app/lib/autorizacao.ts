import { supabase } from "@/supabaseClient"

export type Role = "DONO" | "ADM" | "USER"
export type AcessoGerenciamento = "permitido" | "nao-autenticado" | "sem-permissao"

export async function usuarioPodeGerenciar() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return "nao-autenticado" as const

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: Role }>()

  if (error) {
    console.error("Erro ao verificar permissao:", error.message)
    return "sem-permissao" as const
  }

  return data.role === "DONO" || data.role === "ADM"
    ? "permitido" as const
    : "sem-permissao" as const
}