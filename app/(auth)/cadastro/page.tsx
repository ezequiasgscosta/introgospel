"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"

export default function Cadastro() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")

  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [carregando, setCarregando] = useState(false)

  async function fazerCadastro(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    setErro("")
    setSucesso("")

    // Verifica se as senhas são iguais
    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.")
      return
    }

    // Verifica tamanho da senha
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.")
      return
    }

    setCarregando(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
      })

      if (error) {
        console.error("Erro ao cadastrar:", error)
        setErro(error.message)
        return
      }

      console.log("Usuário criado:", data)

      setSucesso(
        "Conta criada com sucesso! Verifique seu email para confirmar a conta."
      )

      setEmail("")
      setSenha("")
      setConfirmarSenha("")

    } catch (err) {
      console.error("Erro inesperado:", err)
      setErro("Ocorreu um erro ao criar sua conta.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">

          {/* =========================
              TÍTULO
          ========================= */}

          <div className="text-center mb-8">

            <div className="text-5xl mb-4">
              🎵
            </div>

            <h1 className="text-3xl font-bold text-white">
              Criar conta
            </h1>

            <p className="text-gray-400 mt-2">
              Crie sua conta para começar
            </p>

          </div>

          {/* =========================
              FORMULÁRIO
          ========================= */}

          <form
            onSubmit={fazerCadastro}
            className="flex flex-col gap-4"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
              />

            </div>

            {/* SENHA */}

            <div>

              <label
                htmlFor="senha"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Senha
              </label>

              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) =>
                  setSenha(e.target.value)
                }
                placeholder="Mínimo 6 caracteres"
                required
                autoComplete="new-password"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
              />

            </div>

            {/* CONFIRMAR SENHA */}

            <div>

              <label
                htmlFor="confirmarSenha"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Confirmar senha
              </label>

              <input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) =>
                  setConfirmarSenha(e.target.value)
                }
                placeholder="Digite a senha novamente"
                required
                autoComplete="new-password"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
              />

            </div>

            {/* ERRO */}

            {erro && (
              <div className="bg-red-950/50 border border-red-800 text-red-400 rounded-lg p-3 text-sm">
                {erro}
              </div>
            )}

            {/* SUCESSO */}

            {sucesso && (
              <div className="bg-green-950/50 border border-green-800 text-green-400 rounded-lg p-3 text-sm">
                {sucesso}
              </div>
            )}

            {/* BOTÃO */}

            <button
              type="submit"
              disabled={carregando}
              className={`w-full py-3 rounded-lg font-bold transition ${
                carregando
                  ? "bg-blue-900 cursor-not-allowed text-blue-300"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {carregando
                ? "Criando conta..."
                : "Criar conta"}
            </button>

          </form>

          {/* =========================
              VOLTAR PARA LOGIN
          ========================= */}

          <div className="text-center mt-6">

            <p className="text-gray-400 text-sm">
              Já possui uma conta?
            </p>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-blue-400 hover:text-blue-300 font-semibold text-sm mt-1"
            >
              Entrar
            </button>

          </div>

        </div>

      </div>

    </main>
  )
}