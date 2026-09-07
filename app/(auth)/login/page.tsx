"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)

  async function fazerLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setErro("")
    setCarregando(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      })

      if (error) {
        console.error("Erro ao fazer login:", error)
        setErro(error.message)
        return
      }

      router.push("/Fed")
    } catch (err) {
      console.error("Erro inesperado:", err)
      setErro("Ocorreu um erro ao fazer login.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">

          <div className="text-center mb-8">

            <div className="text-5xl mb-4">
              🎵
            </div>

            <h1 className="text-3xl font-bold text-white">
              Entrar
            </h1>

            <p className="text-gray-400 mt-2">
              Entre na sua conta para acessar suas cifras
            </p>

          </div>

          <form
            onSubmit={fazerLogin}
            className="flex flex-col gap-4"
          >

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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
              />

            </div>

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
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                required
                autoComplete="current-password"
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition"
              />

            </div>

            {erro && (
              <div className="bg-red-950/50 border border-red-800 text-red-400 rounded-lg p-3 text-sm">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className={`w-full py-3 rounded-lg font-bold transition ${
                carregando
                  ? "bg-blue-900 cursor-not-allowed text-blue-300"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>

          </form>

          <div className="text-center mt-6">

            <p className="text-gray-400 text-sm">
              Ainda não tem uma conta?
            </p>

            <button
              type="button"
              onClick={() => router.push("/cadastro")}
              className="text-blue-400 hover:text-blue-300 font-semibold text-sm mt-1"
            >
              Criar conta
            </button>

          </div>

        </div>

      </div>

    </main>
  )
}
