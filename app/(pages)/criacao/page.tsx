"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/supabaseClient"
import { usuarioPodeGerenciar } from "@/app/lib/autorizacao"

interface BlocoCifra {
  esquerda: string
  direita: string
}

interface LinhaCifra {
  blocos: BlocoCifra[]
}

interface ItemEdicao {
  indexLinha: number
  indexBloco: number
  mao: "esquerda" | "direita"
}

interface Feedback {
  tipo: "erro" | "sucesso"
  mensagem: string
}

interface MusicaEdicao {
  id: number
  nome_da_musica: string
  nome_do_cantor: string
  tom: string | null
  linha: LinhaCifra[] | null
}

const camposHarmonicos: Record<string, string[]> = {
  C: ["C", "Dm", "Em", "F", "G", "Am", "Bdim"],
  "C#": ["C#", "D#m", "E#m", "F#", "G#", "A#m", "B#dim"],
  D: ["D", "Em", "F#m", "G", "A", "Bm", "C#dim"],
  "D#": ["D#", "E#m", "F##m", "G#", "A#", "B#m", "C##dim"],
  E: ["E", "F#m", "G#m", "A", "B", "C#m", "D#dim"],
  F: ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"],
  "F#": ["F#", "G#m", "A#m", "B", "C#", "D#m", "E#dim"],
  G: ["G", "Am", "Bm", "C", "D", "Em", "F#dim"],
  "G#": ["G#", "A#m", "B#m", "C#", "D#", "E#m", "F##dim"],
  A: ["A", "Bm", "C#m", "D", "E", "F#m", "G#dim"],
  "A#": ["A#", "B#m", "C##m", "D#", "E#", "F##m", "G##dim"],
  B: ["B", "C#m", "D#m", "E", "F#", "G#m", "A#dim"],
}

export default function Criacao() {
  const router = useRouter()
  const notasCromaticas: string[] = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ]

  // =========================
  // ESTADOS
  // =========================

  const [titulo, setTitulo] = useState("")
  const [cantor, setCantor] = useState("")

  const [tomSelecionado, setTomSelecionado] = useState<string>("C")

  const [maoAtiva, setMaoAtiva] = useState<
    "esquerda" | "direita"
  >("esquerda")

  const [linhas, setLinhas] = useState<LinhaCifra[]>([
    { blocos: [] },
  ])

  const [itemEmEdicao, setItemEmEdicao] =
    useState<ItemEdicao | null>(null)

  const [textoEdicao, setTextoEdicao] = useState<string>("")

  const [salvando, setSalvando] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [idEmEdicao, setIdEmEdicao] = useState<number | null>(null)
  const [carregandoEdicao, setCarregandoEdicao] = useState(false)
  const [autorizado, setAutorizado] = useState(false)

  useEffect(() => {
    async function verificarAcesso() {
      const acesso = await usuarioPodeGerenciar()

      if (acesso !== "permitido") {
        router.replace(acesso === "nao-autenticado" ? "/login" : "/Fed")
        return
      }

      setAutorizado(true)

      const id = new URLSearchParams(window.location.search).get("editar")
      if (!id) return

      const idNumerico = Number(id)
      if (!Number.isInteger(idNumerico)) {
        return
      }

      setCarregandoEdicao(true)
      const { data, error } = await supabase
        .from("musicas")
        .select("id, nome_da_musica, nome_do_cantor, tom, linha")
        .eq("id", idNumerico)
        .single<MusicaEdicao>()

      if (error || !data) {
        setFeedback({ tipo: "erro", mensagem: error?.message || "Música não encontrada." })
      } else {
        setIdEmEdicao(data.id)
        setTitulo(data.nome_da_musica || "")
        setCantor(data.nome_do_cantor || "")
        setTomSelecionado(data.tom || "C")
        setLinhas(data.linha && data.linha.length > 0 ? data.linha : [{ blocos: [] }])
      }
      setCarregandoEdicao(false)
    }

    verificarAcesso()
  }, [router])

  if (!autorizado) {
    return null
  }

  // =========================
  // BOTÕES DAS NOTAS
  // =========================

  const botoesAtuais =
    maoAtiva === "esquerda"
      ? camposHarmonicos[tomSelecionado]
      : notasCromaticas

  // =========================
  // SALVAR CIFRA
  // =========================

  const salvarCifra = async () => {
    setFeedback(null)

    // Verifica nome da música
    if (!titulo.trim()) {
      setFeedback({ tipo: "erro", mensagem: "Digite o nome da música." })
      return
    }

    // Verifica cantor
    if (!cantor.trim()) {
      setFeedback({ tipo: "erro", mensagem: "Digite o nome do cantor." })
      return
    }

    // Verifica se existe alguma cifra
    const cifraVazia = linhas.every(
      (linha) => linha.blocos.length === 0
    )

    if (cifraVazia) {
      setFeedback({ tipo: "erro", mensagem: "A cifra está vazia." })
      return
    }

    try {
      setSalvando(true)

      const dadosMusica = {
        nome_da_musica: titulo.trim(),
        nome_do_cantor: cantor.trim(),
        tom: tomSelecionado,
        linha: linhas,
      }

      const consulta = idEmEdicao
        ? supabase.from("musicas").update(dadosMusica).eq("id", idEmEdicao).select().single()
        : supabase.from("musicas").insert(dadosMusica).select().single()

      const { data, error } = await consulta

      if (error) {
        console.error("Erro do Supabase:", error)
        setFeedback({ tipo: "erro", mensagem: "Erro ao " + (idEmEdicao ? "atualizar" : "salvar") + " a música: " + error.message })
        return
      }

      console.log("Música salva com sucesso:", data)

      setFeedback({ tipo: "sucesso", mensagem: idEmEdicao ? "Cifra atualizada com sucesso!" : "Cifra salva com sucesso!" })

    } catch (error) {
      console.error("Erro inesperado:", error)

      setFeedback({ tipo: "erro", mensagem: "Ocorreu um erro inesperado ao " + (idEmEdicao ? "atualizar" : "salvar") + " a cifra." })
    } finally {
      setSalvando(false)
    }
  }

  // =========================
  // ADICIONAR NOTA / ACORDE
  // =========================

  const adicionarNota = (nota: string) => {
    setLinhas((prevLinhas) =>
      prevLinhas.map((linha, indexLinha) => {
        // Só modifica a última linha
        if (
          indexLinha !==
          prevLinhas.length - 1
        ) {
          return linha
        }

        const blocosAtuais = [
          ...linha.blocos,
        ]

        // =========================
        // MÃO ESQUERDA
        // =========================

        if (maoAtiva === "esquerda") {
          let blocoEncontrado = false

          // Procura um bloco que ainda não possui acorde
          for (
            let i = blocosAtuais.length - 1;
            i >= 0;
            i--
          ) {
            if (!blocosAtuais[i].esquerda) {
              blocosAtuais[i] = {
                ...blocosAtuais[i],
                esquerda: nota,
              }

              blocoEncontrado = true
              break
            }
          }

          // Se não encontrou espaço,
          // cria um novo bloco
          if (!blocoEncontrado) {
            blocosAtuais.push({
              esquerda: nota,
              direita: "",
            })
          }

        // =========================
        // MÃO DIREITA
        // =========================

        } else {
          // A mão direita sempre cria
          // um novo bloco
          blocosAtuais.push({
            esquerda: "",
            direita: nota,
          })
        }

        return {
          ...linha,
          blocos: blocosAtuais,
        }
      })
    )
  }

  // =========================
  // NOVA LINHA
  // =========================

  const novaLinha = () => {
    setLinhas((prevLinhas) => [
      ...prevLinhas,
      {
        blocos: [],
      },
    ])
  }

  // =========================
  // APAGAR ÚLTIMA NOTA
  // =========================

  const removerUltimaNota = () => {
    setLinhas((prevLinhas) => {
      const indexLinhaAtual =
        prevLinhas.length - 1

      const linhaAtual =
        prevLinhas[indexLinhaAtual]

      // Se existem blocos
      if (linhaAtual.blocos.length > 0) {
        const novosBlocos = [
          ...linhaAtual.blocos,
        ]

        if (maoAtiva === "direita") {
          // Mão direita:
          // remove o último bloco
          novosBlocos.pop()

        } else {
          // Mão esquerda:
          // procura o último acorde
          let removido = false

          for (
            let i = novosBlocos.length - 1;
            i >= 0;
            i--
          ) {
            if (novosBlocos[i].esquerda) {
              if (
                novosBlocos[i].direita === ""
              ) {
                // Se não tem nota direita,
                // remove o bloco inteiro
                novosBlocos.splice(i, 1)
              } else {
                // Caso contrário,
                // remove somente o acorde
                novosBlocos[i] = {
                  ...novosBlocos[i],
                  esquerda: "",
                }
              }

              removido = true
              break
            }
          }

          if (!removido) {
            novosBlocos.pop()
          }
        }

        return prevLinhas.map(
          (linha, index) => {
            if (
              index !== indexLinhaAtual
            ) {
              return linha
            }

            return {
              ...linha,
              blocos: novosBlocos,
            }
          }
        )
      }

      // Se a linha atual está vazia,
      // remove a linha se houver mais de uma
      if (prevLinhas.length > 1) {
        return prevLinhas.slice(0, -1)
      }

      return prevLinhas
    })
  }

  // =========================
  // LIMPAR CIFRA
  // =========================

  const limparCifra = () => {
    setLinhas([
      {
        blocos: [],
      },
    ])

    setTitulo("")
    setCantor("")
    setItemEmEdicao(null)
    setTextoEdicao("")
  }

  // =========================
  // INICIAR EDIÇÃO
  // =========================

  const iniciarEdicao = (
    indexLinha: number,
    indexBloco: number,
    mao: "esquerda" | "direita",
    valorAtual: string
  ) => {
    setItemEmEdicao({
      indexLinha,
      indexBloco,
      mao,
    })

    setTextoEdicao(valorAtual)
  }

  // =========================
  // SALVAR EDIÇÃO
  // =========================

  const salvarEdicao = () => {
    if (!itemEmEdicao) {
      return
    }

    setLinhas((prevLinhas) =>
      prevLinhas.map(
        (linha, idxLinha) => {
          if (
            idxLinha !==
            itemEmEdicao.indexLinha
          ) {
            return linha
          }

          const novosBlocos =
            linha.blocos.map(
              (bloco, idxBloco) => {
                if (
                  idxBloco !==
                  itemEmEdicao.indexBloco
                ) {
                  return bloco
                }

                return {
                  ...bloco,
                  [itemEmEdicao.mao]:
                    textoEdicao,
                }
              }
            )

          return {
            ...linha,
            blocos: novosBlocos,
          }
        }
      )
    )

    setItemEmEdicao(null)
    setTextoEdicao("")
  }

  // =========================
  // INTERFACE
  // =========================

  return (
    <div className="h-[100dvh] bg-gray-900 text-white flex flex-col items-center p-4 font-sans overflow-hidden">

      {carregandoEdicao && (
        <div className="w-full max-w-[700px] mb-3 rounded-lg border border-blue-800 bg-blue-950/50 px-4 py-3 text-sm text-blue-300">
          Carregando cifra para edição...
        </div>
      )}

      {feedback && (
        <div
          role="status"
          className={`w-full max-w-[700px] mb-3 rounded-lg border px-4 py-3 text-sm ${
            feedback.tipo === "erro"
              ? "border-red-800 bg-red-950/50 text-red-300"
              : "border-green-800 bg-green-950/50 text-green-300"
          }`}
        >
          {feedback.mensagem}
        </div>
      )}

      {/* =========================
          INFORMAÇÕES DA MÚSICA
      ========================= */}

      <div className="w-full max-w-[700px] flex flex-col sm:flex-row gap-2 mb-3">

        <input
          type="text"
          value={titulo}
          onChange={(e) =>
            setTitulo(e.target.value)
          }
          placeholder="Nome da música"
          className="flex-1 bg-gray-950 border border-gray-700 px-3 py-2 rounded text-sm text-white focus:outline-none focus:border-blue-500"
        />

        <input
          type="text"
          value={cantor}
          onChange={(e) =>
            setCantor(e.target.value)
          }
          placeholder="Nome do cantor"
          className="flex-1 bg-gray-950 border border-gray-700 px-3 py-2 rounded text-sm text-white focus:outline-none focus:border-blue-500"
        />

      </div>

      {/* =========================
          SELETOR DO TOM
      ========================= */}

      <div className="w-full max-w-[700px] bg-gray-800 p-3 rounded-lg border border-gray-700 mb-3 flex flex-col sm:flex-row items-center justify-between gap-3">

        <span className="text-sm font-semibold text-gray-300">
          🎵 Tom do Campo Harmônico:
        </span>

        <select
          value={tomSelecionado}
          onChange={(e) =>
            setTomSelecionado(e.target.value)
          }
          className="bg-gray-950 border border-gray-700 px-3 py-1.5 rounded text-sm font-mono text-blue-400 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
        >
          {Object.keys(
            camposHarmonicos
          ).map((tom) => (
            <option
              key={tom}
              value={tom}
            >
              Campo de {tom} Maior
            </option>
          ))}
        </select>

      </div>

      {/* =========================
          BOTÕES SUPERIORES
      ========================= */}

      <div className="flex gap-2 justify-between w-full max-w-[700px] mb-4 flex-wrap">

        {/* MÃOS */}

        <div className="bg-gray-800 p-1 rounded-lg flex gap-1 border border-gray-700">

          <button
            onClick={() =>
              setMaoAtiva("esquerda")
            }
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
              maoAtiva === "esquerda"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            ✋ Mão Esquerda (Acordes)
          </button>

          <button
            onClick={() =>
              setMaoAtiva("direita")
            }
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
              maoAtiva === "direita"
                ? "bg-purple-600 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🤚 Mão Direita (Notas)
          </button>

        </div>

        {/* CONTROLES */}

        <div className="flex gap-2 flex-wrap">

          <button
            onClick={novaLinha}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-xs font-semibold rounded transition flex items-center gap-1"
          >
            ⏎ Pular Linha
          </button>

          <button
            onClick={
              removerUltimaNota
            }
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-xs font-semibold rounded transition"
          >
            ↩️ Apagar
          </button>

          <button
            onClick={limparCifra}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-semibold rounded transition"
          >
            🗑️ Limpar
          </button>

          <button
            onClick={salvarCifra}
            disabled={salvando}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
              salvando
                ? "bg-blue-900 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {salvando
              ? idEmEdicao ? "⏳ Atualizando..." : "⏳ Salvando..."
              : idEmEdicao ? "💾 Atualizar cifra" : "💾 Salvar"}
          </button>

        </div>
      </div>

      {/* =========================
          MODAL DE EDIÇÃO
      ========================= */}

      {itemEmEdicao && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

          <div className="bg-gray-800 border border-gray-700 p-5 rounded-xl max-w-xs w-full shadow-2xl">

            <h3 className="text-sm font-bold text-gray-300 mb-2">
              ✏️ Adicionar 7, 9 ou Extensão:
            </h3>

            <input
              type="text"
              value={textoEdicao}
              onChange={(e) =>
                setTextoEdicao(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  salvarEdicao()
                }

                if (e.key === "Escape") {
                  setItemEmEdicao(null)
                }
              }}
              className="w-full bg-gray-950 border border-gray-600 rounded p-2 text-white font-mono text-lg font-bold mb-4 focus:outline-none focus:border-blue-500"
              autoFocus
            />

            <div className="flex gap-2 justify-end">

              <button
                onClick={() =>
                  setItemEmEdicao(null)
                }
                className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded font-semibold"
              >
                Cancelar
              </button>

              <button
                onClick={salvarEdicao}
                className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded font-semibold"
              >
                Salvar
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =========================
          PAINEL DA CIFRA
      ========================= */}

      <div className="w-[95dvw] h-[55dvh] bg-gray-950 p-4 rounded-lg mb-6 border border-gray-800 overflow-y-auto xl:w-[700px]">

        {linhas.length === 1 &&
        linhas[0].blocos.length === 0 ? (

          <span className="text-gray-500 italic text-sm">
            Selecione o Tom acima,
            escolha a mão e clique
            nos botões para compor...
          </span>

        ) : (

          <div className="flex flex-col gap-8 font-mono">

            {linhas.map(
              (linha, indexLinha) => (

                <div
                  key={indexLinha}
                  className="border-b border-gray-800 pb-6 last:border-0 flex flex-col gap-2"
                >

                  {/* =========================
                      MÃO ESQUERDA
                  ========================= */}

                  <div className="flex items-center">

                    <span className="text-[10px] text-blue-400 font-sans font-bold bg-blue-950/50 px-1.5 py-0.5 rounded mr-3 w-8 text-center shrink-0 select-none">
                      ESQ
                    </span>

                    <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">

                      {linha.blocos.map(
                        (
                          bloco,
                          indexBloco
                        ) => (

                          <div
                            key={indexBloco}
                            className="min-w-[40px] h-[32px] flex items-center justify-center"
                          >

                            {bloco.esquerda ? (

                              <button
                                onClick={() =>
                                  iniciarEdicao(
                                    indexLinha,
                                    indexBloco,
                                    "esquerda",
                                    bloco.esquerda
                                  )
                                }
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-0.5 rounded text-sm shadow cursor-pointer border border-transparent hover:border-blue-300 transition-colors w-full text-center"
                              >
                                {
                                  bloco.esquerda
                                }
                              </button>

                            ) : (

                              <div className="w-full h-full border-b border-dashed border-gray-800/40"></div>

                            )}

                          </div>

                        )
                      )}

                    </div>

                  </div>

                  {/* =========================
                      MÃO DIREITA
                  ========================= */}

                  <div className="flex items-center">

                    <span className="text-[10px] text-purple-400 font-sans font-bold bg-purple-950/50 px-1.5 py-0.5 rounded mr-3 w-8 text-center shrink-0 select-none">
                      DIR
                    </span>

                    <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">

                      {linha.blocos.map(
                        (
                          bloco,
                          indexBloco
                        ) => (

                          <div
                            key={indexBloco}
                            className="min-w-[40px] h-[32px] flex items-center justify-center"
                          >

                            {bloco.direita ? (

                              <button
                                onClick={() =>
                                  iniciarEdicao(
                                    indexLinha,
                                    indexBloco,
                                    "direita",
                                    bloco.direita
                                  )
                                }
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-2 py-0.5 rounded text-sm shadow cursor-pointer border border-transparent hover:border-purple-300 transition-colors w-full text-center"
                              >
                                {
                                  bloco.direita
                                }
                              </button>

                            ) : (

                              <div className="w-full h-full border-b border-dashed border-gray-800/40"></div>

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
        )}

      </div>

      {/* =========================
          BOTÕES DAS NOTAS
      ========================= */}

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-800 p-3 flex justify-center">

        <div
          className={`grid gap-2 w-full max-w-[700px] ${
            maoAtiva === "esquerda"
              ? "grid-cols-7"
              : "grid-cols-6"
          }`}
        >

          {botoesAtuais.map(
            (nota) => (

              <button
                key={nota}
                onClick={() =>
                  adicionarNota(nota)
                }
                className={`font-mono font-bold transition-all duration-150 active:scale-95 shadow border rounded-lg ${
                  maoAtiva === "esquerda"
                    ? "bg-gray-700 hover:bg-blue-600 text-white border-gray-600 hover:border-blue-400 p-4 text-xs sm:text-sm"
                    : "bg-gray-700 hover:bg-purple-600 text-white border-gray-600 hover:border-purple-400 p-3.5 text-sm"
                }`}
              >
                {nota}
              </button>

            )
          )}

        </div>

      </div>

    </div>
  )
}
