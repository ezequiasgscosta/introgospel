"use client"
import { useState } from 'react'

// Interface para definir rigidamente a estrutura de cada linha da cifra
interface LinhaCifra {
  esquerda: string[];
  direita: string[];
}

// Interface para controlar qual nota/acorde está sendo editado no momento
interface NotaEdicao {
  indexLinha: number;
  mao: 'esquerda' | 'direita';
  indexNota: number;
}

// Mapeamento dos Campos Harmônicos Maiores (Graus: I, ii, iii, IV, V, vi, vii°)
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
  
  // Estados do componente
  const [tomSelecionado, setTomSelecionado] = useState<string>('C')
  const [maoAtiva, setMaoAtiva] = useState<'esquerda' | 'direita'>('esquerda')
  const [linhas, setLinhas] = useState<LinhaCifra[]>([{ esquerda: [], direita: [] }])
  
  // Estados para gerenciar a edição direta da nota clicada
  const [notaEmEdicao, setNotaEmEdicao] = useState<NotaEdicao | null>(null)
  const [textoEdicao, setTextoEdicao] = useState<string>('')

  // Define dinamicamente o rodapé (Mão Esquerda = 7 Acordes do Tom, Direita = 12 Notas)
  const botoesAtuais = maoAtiva === 'esquerda' 
    ? camposHarmonicos[tomSelecionado] 
    : notasCromaticas

  // Adiciona a nota de forma imutável (evita duplicação no Strict Mode)
  const adicionarNota = (nota: string) => {
    setLinhas((prevLinhas) =>
      prevLinhas.map((linha, index) => {
        if (index !== prevLinhas.length - 1) return linha;
        return {
          ...linha,
          [maoAtiva]: [...linha[maoAtiva], nota]
        };
      })
    );
  }

  // Cria uma nova linha limpa
  const novaLinha = () => {
    setLinhas([...linhas, { esquerda: [], direita: [] }])
  }

  // Apaga o último item inserido ou remove uma linha inteira se estiver vazia
  const removerUltimaNota = () => {
    setLinhas((prevLinhas) => {
      const indexLinhaAtual = prevLinhas.length - 1;
      const linhaAtual = prevLinhas[indexLinhaAtual];

      if (linhaAtual[maoAtiva].length > 0) {
        return prevLinhas.map((linha, index) => {
          if (index !== indexLinhaAtual) return linha;
          return { 
            ...linha, 
            [maoAtiva]: linha[maoAtiva].slice(0, -1) 
          };
        });
      } 
      
      if (prevLinhas.length > 1 && linhaAtual.esquerda.length === 0 && linhaAtual.direita.length === 0) {
        return prevLinhas.slice(0, -1);
      }

      return prevLinhas;
    });
  }

  // Reseta todo o painel
  const limparCifra = () => {
    setLinhas([{ esquerda: [], direita: [] }])
    setNotaEmEdicao(null)
  }

  // Abre a janela para editar a nota/acorde clicado
  const iniciarEdicao = (indexLinha: number, mao: 'esquerda' | 'direita', indexNota: number, valorAtual: string) => {
    setNotaEmEdicao({ indexLinha, mao, indexNota })
    setTextoEdicao(valorAtual)
  }

  // Salva a alteração da nota digitada na caixa flutuante
  const salvarEdicao = () => {
    if (!notaEmEdicao) return

    setLinhas((prevLinhas) => 
      prevLinhas.map((linha, idxLinha) => {
        if (idxLinha !== notaEmEdicao.indexLinha) return linha

        const novoArrayMao = [...linha[notaEmEdicao.mao]]
        novoArrayMao[notaEmEdicao.indexNota] = textoEdicao

        return {
          ...linha,
          [notaEmEdicao.mao]: novoArrayMao
        }
      })
    )

    setNotaEmEdicao(null)
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

      {/* --- MODAL / CAIXA DE EDIÇÃO FLUTUANTE --- */}
      {notaEmEdicao && (
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
              <button 
                onClick={() => setNotaEmEdicao(null)}
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

      {/* --- PAINEL DA CIFRA ESTILO CIFRA CLUB --- */}
      <div className="w-[95dvw] h-[55dvh] bg-gray-950 p-4 rounded-lg mb-6 border border-gray-800 overflow-y-auto xl:w-[700px]">
        {linhas.length === 1 && linhas[0].esquerda.length === 0 && linhas[0].direita.length === 0 ? (
          <span className="text-gray-500 italic text-sm">Selecione o Tom acima, escolha a mão e clique nos botões para compor...</span>
        ) : (
          <div className="flex flex-col gap-6 font-mono">
            {linhas.map((linha, indexLinha) => (
              <div key={indexLinha} className="border-b border-gray-800 pb-4 last:border-0">
                
                {/* LINHA SUPERIOR: Mão Esquerda (Acordes em Azul) */}
                <div className="min-h-[32px] flex flex-wrap gap-1.5 items-center mb-1">
                  <span className="text-[10px] text-blue-400 font-sans font-bold bg-blue-950/50 px-1.5 py-0.5 rounded mr-1 select-none">ESQ</span>
                  {linha.esquerda.map((nota, indexNota) => (
                    <button 
                      key={indexNota} 
                      onClick={() => iniciarEdicao(indexLinha, 'esquerda', indexNota, nota)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-0.5 rounded text-sm shadow cursor-pointer border border-transparent hover:border-blue-300 transition-colors"
                      title="Clique para editar este acorde"
                    >
                      {nota}
                    </button>
                  ))}
                </div>

                {/* LINHA INFERIOR: Mão Direita (Letras/Melodia em Roxo) */}
                <div className="min-h-[32px] flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-purple-400 font-sans font-bold bg-purple-950/50 px-1.5 py-0.5 rounded mr-1 select-none">DIR</span>
                  {linha.direita.map((nota, indexNota) => (
                    <button 
                      key={indexNota} 
                      onClick={() => iniciarEdicao(indexLinha, 'direita', indexNota, nota)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-2 py-0.5 rounded text-sm shadow cursor-pointer border border-transparent hover:border-purple-300 transition-colors"
                      title="Clique para editar esta nota"
                    >
                      {nota}
                    </button>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SELETOR DINÂMICO NO RODAPÉ FIXO --- */}
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
