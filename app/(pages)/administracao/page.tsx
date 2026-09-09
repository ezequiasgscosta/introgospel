"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"
import Link from "next/link"
import { usuarioPodeGerenciar } from "@/app/lib/autorizacao"

// Interfaces
interface Usuario {
  id: string
  email: string
  role: "DONO" | "ADM" | "USER"
}

interface BlocoCifra {
  esquerda: string
  direita: string
}

interface LinhaCifra {
  blocos: BlocoCifra[]
}

interface Musica {
  id: string | number
  nome_da_musica: string
  nome_do_cantor: string
  tom: string
  linha: LinhaCifra[]
}

interface Feedback {
  tipo: "erro" | "sucesso"
  mensagem: string
}

export default function PainelAdmin() {
  const router = useRouter()
  const [abaAtiva, setAbaAtiva] = useState<"musicas" | "usuarios">("musicas")

  // Estados para Músicas
  const [musicas, setMusicas] = useState<Musica[]>([])
  const [buscaMusica, setBuscaMusica] = useState("")

  // Estados para Usuários
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [buscaUsuario, setBuscaUsuario] = useState("")

  const [carregando, setCarregando] = useState(true)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [autorizado, setAutorizado] = useState(false)

  // =========================
  // FUNÇÕES DE MÚSICAS
  // =========================

  const buscarMusicas = async () => {
    try {
      const { data, error } = await supabase
        .from("musicas")
        .select("*")
        .order("id", { ascending: false })

      if (error) {
        console.error("Erro do Supabase ao carregar músicas:", error.message)
        setFeedback({ tipo: "erro", mensagem: `Erro ao buscar músicas: ${error.message}` })
      } else {
        setMusicas(data || [])
      }
    } catch (err) {
      console.error("Erro inesperado de rede ao buscar músicas:", err)
    }
  }

  const excluirMusica = async (id: string | number) => {
    if (!confirm("Tem certeza que deseja excluir esta música?")) return

    try {
      const { error } = await supabase.from("musicas").delete().eq("id", id)

      if (error) {
        setFeedback({ tipo: "erro", mensagem: "Erro ao excluir música: " + error.message })
      } else {
        setMusicas((prev) => prev.filter((m) => m.id !== id))
        setFeedback({ tipo: "sucesso", mensagem: "Música excluída com sucesso!" })
      }
    } catch (err) {
      console.error("Erro de rede ao excluir música:", err)
    }
  }

  // =========================
  // FUNÇÕES DE USUÁRIOS
  // =========================

  const buscarUsuarios = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*")

      if (error) {
        console.error("Erro do Supabase ao carregar usuários:", error.message)
      } else {
        setUsuarios(data || [])
      }
    } catch (err) {
      console.error("Erro inesperado ao buscar usuários:", err)
    }
  }

  useEffect(() => {
    async function verificarAcesso() {
      const acesso = await usuarioPodeGerenciar()

      if (acesso !== "permitido") {
        router.replace(acesso === "nao-autenticado" ? "/login" : "/Fed")
        return
      }

      setAutorizado(true)
      setCarregando(true)
      await Promise.all([buscarMusicas(), buscarUsuarios()])
      setCarregando(false)
    }

    verificarAcesso()
  }, [router])

  if (!autorizado) {
    return null
  }

  const alterarPermissaoUsuario = async (id: string, novaRole: "ADM" | "USER") => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: novaRole })
        .eq("id", id)

      if (error) {
        setFeedback({ tipo: "erro", mensagem: "Erro ao alterar permissão: " + error.message })
      } else {
        setUsuarios((prev) =>
          prev.map((u) => (u.id === id ? { ...u, role: novaRole } : u))
        )
        setFeedback({ tipo: "sucesso", mensagem: "Permissão atualizada com sucesso!" })
      }
    } catch (err) {
      console.error("Erro de rede ao atualizar permissão:", err)
    }
  }

  // Filtros de Busca
  const musicasFiltradas = musicas.filter(
    (m) =>
      (m.nome_da_musica || "").toLowerCase().includes(buscaMusica.toLowerCase()) ||
      (m.nome_do_cantor || "").toLowerCase().includes(buscaMusica.toLowerCase())
  )

  const usuariosFiltrados = usuarios.filter((u) =>
    (u.email || "").toLowerCase().includes(buscaUsuario.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {feedback && (
          <div
            role="status"
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              feedback.tipo === "erro"
                ? "border-red-800 bg-red-950/50 text-red-300"
                : "border-green-800 bg-green-950/50 text-green-300"
            }`}
          >
            {feedback.mensagem}
          </div>
        )}

        <header className="mb-6 border-b border-gray-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">⚙️ Painel Administrativo</h1>
            <p className="text-sm text-gray-400">Gerencie usuários, permissões e cifras cadastradas.</p>
          </div>

          {/* NAVEGAÇÃO ENTRE ABAS */}
          <div className="flex gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800">
            <button
              onClick={() => setAbaAtiva("musicas")}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
                abaAtiva === "musicas"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🎵 Músicas ({musicas.length})
            </button>
            <button
              onClick={() => setAbaAtiva("usuarios")}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
                abaAtiva === "usuarios"
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              👥 Usuários ({usuarios.length})
            </button>
          </div>
        </header>

        {carregando ? (
          <div className="text-center py-20 text-gray-400 font-mono">⏳ Carregando dados...</div>
        ) : (
          <>
            {/* GERENCIAMENTO DE MÚSICAS */}
            {abaAtiva === "musicas" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-4">
                  <input
                    type="text"
                    placeholder="🔍 Buscar por música ou cantor..."
                    value={buscaMusica}
                    onChange={(e) => setBuscaMusica(e.target.value)}
                    className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-800/50 text-gray-400 border-b border-gray-800">
                      <tr>
                        <th className="p-4">Música</th>
                        <th className="p-4">Cantor</th>
                        <th className="p-4">Tom</th>
                        <th className="p-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {musicasFiltradas.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-500">
                            Nenhuma música encontrada.
                          </td>
                        </tr>
                      ) : (
                        musicasFiltradas.map((musica) => (
                          <tr key={musica.id} className="hover:bg-gray-800/30 transition">
                            <td className="p-4 font-semibold text-white">{musica.nome_da_musica}</td>
                            <td className="p-4 text-gray-300">{musica.nome_do_cantor}</td>
                            <td className="p-4">
                              <span className="bg-blue-950/60 text-blue-400 border border-blue-800/50 px-2 py-0.5 rounded text-xs font-mono font-bold">
                                {musica.tom}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <Link
                                href={`/criacao?editar=${musica.id}`}
                                className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-600/30 rounded text-xs font-semibold transition"
                              >
                                ✏️ Editar
                              </Link>
                              <button
                                onClick={() => excluirMusica(musica.id)}
                                className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 rounded text-xs font-semibold transition"
                              >
                                🗑️ Excluir
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GERENCIAMENTO DE USUÁRIOS */}
            {abaAtiva === "usuarios" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-4">
                  <input
                    type="text"
                    placeholder="🔍 Buscar usuário por e-mail..."
                    value={buscaUsuario}
                    onChange={(e) => setBuscaUsuario(e.target.value)}
                    className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-800/50 text-gray-400 border-b border-gray-800">
                      <tr>
                        <th className="p-4">E-mail do Usuário</th>
                        <th className="p-4">Permissão Atual</th>
                        <th className="p-4 text-right">Alterar Permissão</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {usuariosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-gray-500">
                            Nenhum usuário encontrado.
                          </td>
                        </tr>
                      ) : (
                        usuariosFiltrados.map((usuario) => (
                          <tr key={usuario.id} className="hover:bg-gray-800/30 transition">
                            <td className="p-4 font-mono text-gray-200">{usuario.email || "Sem e-mail"}</td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  usuario.role === "DONO"
                                    ? "bg-amber-950/80 text-amber-300 border border-amber-700/50"
                                    : usuario.role === "ADM"
                                    ? "bg-purple-950/80 text-purple-300 border border-purple-700/50"
                                    : "bg-gray-800 text-gray-400 border border-gray-700"
                                }`}
                              >
                                {usuario.role === "DONO"
                                  ? "👑 Dono"
                                  : usuario.role === "ADM"
                                  ? "⚡ ADM"
                                  : "👤 Usuário"}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {usuario.role === "DONO" ? (
                                <span className="text-xs text-gray-500 italic pr-2">Protegido</span>
                              ) : (
                                <select
                                  value={usuario.role || "USER"}
                                  onChange={(e) =>
                                    alterarPermissaoUsuario(
                                      usuario.id,
                                      e.target.value as "ADM" | "USER"
                                    )
                                  }
                                  className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500"
                                >
                                  <option value="USER">Usuário Padrão</option>
                                  <option value="ADM">Administrador (ADM)</option>
                                </select>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}