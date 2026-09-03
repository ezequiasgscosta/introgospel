"use client"
import { useState } from 'react'

interface BlocoCifra {
  esquerda: string;
  direita: string;
}

interface LinhaCifra {
  blocos: BlocoCifra[];
}

interface ItemEdicao {
  indexLinha: number;
  indexBloco: number;
  mao: 'esquerda' | 'direita';
}

const camposHarmonicos: Record<string, string[]> = {
  'C':  ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
  'C#': ['C#', 'D#m', 'E#m', 'F#', 'G#', 'A#m', 'B#dim'],
  'D':  ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
  'D#': ['D#', 'E#m', 'F##m', 'G#', 'A#', 'B#m', 'C##dim'],
  'E':  ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
  'F':  ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
  'F#': ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'],
  'G':  ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
  'G#': ['G#', 'A#m', 'B#m', 'C#', 'D#', 'E#m', 'F##dim'],
  'A':  ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
  'A#': ['A#', 'B#m', 'C##m', 'D#', 'E#', 'F##m', 'G##dim'],
  'B':  ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
}

export default function Criacao() {
  const notasCromaticas: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  
  const [tomSelecionado, setTomSelecionado] = useState<string>('C')
  const [maoAtiva, setMaoAtiva] = useState<'esquerda' | 'direita'>('esquerda')
  const [linhas, setLinhas] = useState<LinhaCifra[]>([{ blocos: [] }])
  
  const [itemEmEdicao, setItemEmEdicao] = useState<ItemEdicao | null>(null)
  const [textoEdicao, setTextoEdicao] = useState<string>('')

  const botoesAtuais = maoAtiva === 'esquerda' 
    ? camposHarmonicos[tomSelecionado] 
    : notasCromaticas

  const adicionarNota = (nota: string) => {
    setLinhas((prevLinhas) =>
      prevLinhas.map((linha, indexLinha) => {
        if (indexLinha !== prevLinhas.length - 1) return linha;

        const blocosAtuais = [...linha.blocos];

        if (maoAtiva === 'esquerda') {
          // MÃO ESQUERDA: Procura o último bloco para ver se ele tem a mão esquerda vazia
          // e se a mão direita DESTE bloco também está vazia (ou seja, se veio de um avanço da esquerda).
          // Mas a regra diz: se a esquerda anda, a direita permanece no mesmo lugar.
          // Para que a esquerda ande sozinha sem empurrar a direita, tentamos preencher uma lacuna existente na esquerda.
          let blocoEncontrado = false;
          
          for (let i = blocosAtuais.length - 1; i >= 0; i--) {
            if (!blocosAtuais[i].esquerda) {
              blocosAtuais[i] = { ...blocosAtuais[i], esquerda: nota };
              blocoEncontrado = true;
              break;
            }
          }

          if (!blocoEncontrado) {
            blocosAtuais.push({ esquerda: nota, direita: '' });
          }
        } else {
          // MÃO DIREITA: Sempre avança e empurra a esquerda junto!
          // Cria um novo bloco onde a esquerda inicia vazia, garantindo que o fluxo ande junto.
          blocosAtuais.push({ esquerda: '', direita: nota });
        }

        return { ...linha, blocos: blocosAtuais };
      })
    );
  }

  const novaLinha = () => {
    setLinhas([...linhas, { blocos: [] }])
  }

  const removerUltimaNota = () => {
    setLinhas((prevLinhas) => {
      const indexLinhaAtual = prevLinhas.length - 1;
      const linhaAtual = prevLinhas[indexLinhaAtual];

      if (linhaAtual.blocos.length > 0) {
        const novosBlocos = [...linhaAtual.blocos];
        const ultimoBlocoIdx = novosBlocos.length - 1;
        const ultimoBloco = novosBlocos[ultimoBlocoIdx];

        if (maoAtiva === 'direita') {
          // Se a mão ativa for direita, remove o bloco inteiro criado por ela
          novosBlocos.pop();
        } else {
          // Se for esquerda, limpa apenas a string da esquerda do último bloco que contiver algo na esquerda
          let removido = false;
          for (let i = novosBlocos.length - 1; i >= 0; i--) {
            if (novosBlocos[i].esquerda) {
              if (novosBlocos[i].direita === '') {
                novosBlocos.splice(i, 1);
              } else {
                novosBlocos[i] = { ...novosBlocos[i], esquerda: '' };
              }
              removido = true;
              break;
            }
          }
          if (!removido) novosBlocos.pop();
        }

        return prevLinhas.map((linha, index) => {
          if (index !== indexLinhaAtual) return linha;
          return { ...linha, blocos: novosBlocos };
        });
      } 
      
      if (prevLinhas.length > 1) {
        return prevLinhas.slice(0, -1);
      }

      return prevLinhas;
    });
  }

  const limparCifra = () => {
    setLinhas([{ blocos: [] }])
    setItemEmEdicao(null)
  }

  const iniciarEdicao = (indexLinha: number, indexBloco: number, mao: 'esquerda' | 'direita', valorAtual: string) => {
    setItemEmEdicao({ indexLinha, indexBloco, mao })
    setTextoEdicao(valorAtual)
  }

  const salvarEdicao = () => {
    if (!itemEmEdicao) return

    setLinhas((prevLinhas) => 
      prevLinhas.map((linha, idxLinha) => {
        if (idxLinha !== itemEmEdicao.indexLinha) return linha

        const novosBlocos = linha.blocos.map((bloco, idxBloco) => {
          if (idxBloco !== itemEmEdicao.indexBloco) return bloco
          return {
            ...bloco,
            [itemEmEdicao.mao]: textoEdicao
          }
        })

        return { ...linha, blocos: novosBlocos }
      })
    )

    setItemEmEdicao(null)
  }

  return (
    <div className="h-[100dvh] bg-gray-900 text-white flex flex-col items-center p-4 font-sans overflow-hidden">

      {/* --- SELETOR DE CAMPO HARMÔNICO --- */}
      <div className="w-full max-w-[700px] bg-gray-800 p-3 rounded-lg border border-gray-700 mb-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-sm font-semibold text-gray-300">🎵 Tom do Campo Harmônico:</span>
        <select 
          value={tomSelecionado}
          onChange={(e) => setTomSelecionado(e.target.value)}
          className="bg-gray-950 border border-gray-700 px-3 py-1.5 rounded text-sm font-mono text-blue-400 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
        >
          {Object.keys(camposHarmonicos).map((tom) => (
            <option key={tom} value={tom}>Campo de {tom} Maior</option>
          ))}
        </select>
      </div>

      {/* --- BOTÕES DE CONTROLE SUPERIORES --- */}
      <div className="flex gap-2 justify-between w-full max-w-[700px] mb-4">
        <div className="bg-gray-800 p-1 rounded-lg flex gap-1 border border-gray-700">
          <button
            onClick={() => setMaoAtiva('esquerda')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
              maoAtiva === 'esquerda' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            ✋ Mão Esquerda (Acordes)
          </button>
          <button
            onClick={() => setMaoAtiva('direita')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
              maoAtiva === 'direita' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            🤚 Mão Direita (Notas)
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={novaLinha} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-xs font-semibold rounded transition flex items-center gap-1">
            ⏎ Pular Linha
          </button>
          <button onClick={removerUltimaNota} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-xs font-semibold rounded transition">
            ↩️ Apagar
          </button>
          <button onClick={limparCifra} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-semibold rounded transition">
            🗑️ Limpar
          </button>
        </div>
      </div>

      {/* --- MODAL DE EDIÇÃO FLUTUANTE --- */}
      {itemEmEdicao && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 p-5 rounded-xl max-w-xs w-full shadow-2xl">
            <h3 className="text-sm font-bold text-gray-300 mb-2">✏️ Adicionar 7, 9 ou Extensão:</h3>
            <input 
              type="text"
              value={textoEdicao}
              onChange={(e) => setTextoEdicao(e.target.value)}
              className="w-full bg-gray-950 border border-gray-600 rounded p-2 text-white font-mono text-lg font-bold mb-4 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setItemEmEdicao(null)} className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded font-semibold">Cancelar</button>
              <button onClick={salvarEdicao} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded font-semibold">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PAINEL DA CIFRA ESTILO CIFRA CLUB --- */}
      <div className="w-[95dvw] h-[55dvh] bg-gray-950 p-4 rounded-lg mb-6 border border-gray-800 overflow-y-auto xl:w-[700px]">
        {linhas.length === 1 && linhas[0].blocos.length === 0 ? (
          <span className="text-gray-500 italic text-sm">Selecione o Tom acima, escolha a mão e clique nos botões para compor...</span>
        ) : (
          <div className="flex flex-col gap-8 font-mono">
            {linhas.map((linha, indexLinha) => (
              <div key={indexLinha} className="border-b border-gray-800 pb-6 last:border-0 flex flex-col gap-2">
                
                {/* LINHA SUPERIOR: Mão Esquerda */}
                <div className="flex items-center">
                  <span className="text-[10px] text-blue-400 font-sans font-bold bg-blue-950/50 px-1.5 py-0.5 rounded mr-3 w-8 text-center shrink-0 select-none">ESQ</span>
                  <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">
                    {linha.blocos.map((bloco, indexBloco) => (
                      <div key={indexBloco} className="min-w-[40px] h-[32px] flex items-center justify-center">
                        {bloco.esquerda ? (
                          <button 
                            onClick={() => iniciarEdicao(indexLinha, indexBloco, 'esquerda', bloco.esquerda)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-0.5 rounded text-sm shadow cursor-pointer border border-transparent hover:border-blue-300 transition-colors w-full text-center"
                          >
                            {bloco.esquerda}
                          </button>
                        ) : (
                          <div className="w-full h-full border-b border-dashed border-gray-800/40"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* LINHA INFERIOR: Mão Direita */}
                <div className="flex items-center">
                  <span className="text-[10px] text-purple-400 font-sans font-bold bg-purple-950/50 px-1.5 py-0.5 rounded mr-3 w-8 text-center shrink-0 select-none">DIR</span>
                  <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">
                    {linha.blocos.map((bloco, indexBloco) => (
                      <div key={indexBloco} className="min-w-[40px] h-[32px] flex items-center justify-center">
                        {bloco.direita ? (
                          <button 
                                onClick={() => iniciarEdicao(indexLinha, indexBloco, 'direita', bloco.direita)}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-2 py-0.5 rounded text-sm shadow cursor-pointer border border-transparent hover:border-purple-300 transition-colors w-full text-center"
                              >
                                {bloco.direita}
                          </button>
                        ) : (
                          <div className="w-full h-full border-b border-dashed border-gray-800/40"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SELETOR DINÂMICO NO RODAPÉ --- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-800 p-3 flex justify-center">
        <div className={`grid gap-2 w-full max-w-[700px] ${maoAtiva === 'esquerda' ? 'grid-cols-7' : 'grid-cols-6'}`}>
          {botoesAtuais.map((nota) => (
            <button
              key={nota}
              onClick={() => adicionarNota(nota)}
              className={`font-mono font-bold transition-all duration-150 active:scale-95 shadow border rounded-lg ${
                maoAtiva === 'esquerda'
                  ? 'bg-gray-700 hover:bg-blue-600 text-white border-gray-600 hover:border-blue-400 p-4 text-xs sm:text-sm'
                  : 'bg-gray-700 hover:bg-purple-600 text-white border-gray-600 hover:border-purple-400 p-3.5 text-sm'
              }`}
            >
              {nota}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
