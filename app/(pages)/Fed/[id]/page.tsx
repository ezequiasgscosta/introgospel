"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/supabaseClient"
import { useParams } from "next/navigation"

interface BlocoCifra {
  esquerda: string
  direita: string
}

interface LinhaCifra {
  blocos: BlocoCifra[]
}

interface Musica {
  id: number
  nome_da_musica: string
  nome_do_cantor: string
  tom: string
  linha: LinhaCifra[]
}

export default function Cifra() {
  const params = useParams()
  const id = params.id

  const [musica, setMusica] = useState<Musica | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function buscarMusica() {
      const { data, error } = await supabase
        .from("musicas")
        .select(
          "id, nome_da_musica, nome_do_cantor, tom, linha"
        )
        .eq("id", id)
        .single()

      if (error) {
        console.error("Erro ao buscar música:", error)
        setError(error.message)
        return
      }

      setMusica(data)
    }

    buscarMusica()
  }, [id])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <p className="text-red-400 text-center">
          Erro: {error}
        </p>
      </div>
    )
  }

  if (!musica) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-400">
          Carregando...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-3 sm:p-5">

      {/* =========================
          CABEÇALHO
      ========================= */}

      <div className="w-full max-w-5xl mx-auto mb-5 sm:mb-8">

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          {musica.nome_da_musica}
        </h1>

        <p className="text-base sm:text-lg text-gray-400 mt-1">
          {musica.nome_do_cantor}
        </p>

        <p className="text-sm text-blue-400 mt-2">
          Tom: {musica.tom}
        </p>

      </div>

      {/* =========================
          CIFRA
      ========================= */}

      <div className="w-full max-w-5xl mx-auto">

        <div className="bg-gray-950 p-3 sm:p-5 md:p-6 rounded-lg border border-gray-800 overflow-x-auto">

          <div className="flex flex-col gap-6 sm:gap-8 min-w-max">

            {musica.linha.map(
              (linha, indexLinha) => (

                <div
                  key={indexLinha}
                  className="border-b border-gray-800 pb-5 sm:pb-6 last:border-0"
                >

                  {/* =========================
                      ESQUERDA
                  ========================= */}

                  <div className="flex">

                    <div className="w-8 sm:w-10 shrink-0 flex items-center justify-center mr-2 sm:mr-3">

                      <span className="text-[9px] sm:text-[10px] text-blue-400 font-sans font-bold bg-blue-950/50 px-1.5 py-0.5 rounded">
                        ESQ
                      </span>

                    </div>

                    <div className="flex flex-nowrap">

                      {linha.blocos.map(
                        (bloco, indexBloco) => (

                          <div
                            key={indexBloco}
                            className="
                              w-[42px]
                              sm:w-[48px]
                              md:w-[54px]
                              lg:w-[58px]
                              shrink-0
                              h-[30px]
                              flex
                              items-center
                              justify-center
                            "
                          >

                            {bloco.esquerda && (
                              <span className="
                                bg-blue-600
                                text-white
                                font-bold
                                px-1.5
                                sm:px-2
                                py-0.5
                                sm:py-1
                                rounded
                                text-xs
                                sm:text-sm
                                whitespace-nowrap
                              ">
                                {bloco.esquerda}
                              </span>
                            )}

                          </div>

                        )
                      )}

                    </div>

                  </div>

                  {/* =========================
                      DIREITA
                  ========================= */}

                  <div className="flex">

                    <div className="w-8 sm:w-10 shrink-0 flex items-center justify-center mr-2 sm:mr-3">

                      <span className="text-[9px] sm:text-[10px] text-purple-400 font-sans font-bold bg-purple-950/50 px-1.5 py-0.5 rounded">
                        DIR
                      </span>

                    </div>

                    <div className="flex flex-nowrap">

                      {linha.blocos.map(
                        (bloco, indexBloco) => (

                          <div
                            key={indexBloco}
                            className="
                              w-[42px]
                              sm:w-[48px]
                              md:w-[54px]
                              lg:w-[58px]
                              shrink-0
                              h-[30px]
                              flex
                              items-center
                              justify-center
                            "
                          >

                            {bloco.direita && (
                              <span className="
                                bg-purple-600
                                text-white
                                font-bold
                                px-1.5
                                sm:px-2
                                py-0.5
                                sm:py-1
                                rounded
                                text-xs
                                sm:text-sm
                                whitespace-nowrap
                              ">
                                {bloco.direita}
                              </span>
                            )}

                          </div>

                        )
                      )}

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </div>

    </div>
  )
}