"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

type Musica = {
    id: number
    nome_da_musica: string
    nome_do_cantor: string
}

export default function Fed() {
    const [data, setData] = useState<Musica[]>([])
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
       async function buscarMusicas() {
    const { data, error } = await supabase
        .from('musicas')
        .select('id, nome_da_musica, nome_do_cantor')
        .order('id', { ascending: false }) // Ordena do maior ID para o menor

    if (error) {
        console.error('Erro ao buscar músicas:', error)
        setError(error.message)
        return
    }

    setData(data)
}

        buscarMusicas()
    }, [])

    // Filtra por nome da música ou nome do cantor (sem diferenciar maiúsculas/minúsculas)
    const musicasFiltradas = data.filter((musica) => {
        const termo = searchTerm.toLowerCase()
        return (
            musica.nome_da_musica.toLowerCase().includes(termo) ||
            musica.nome_do_cantor.toLowerCase().includes(termo)
        )
    })

    return (
        <div className="w-[100dvw] min-h-[100dvh] bg-red-400 p-8">
            <h1 className="text-3xl font-bold mb-6">
                Minhas músicas
            </h1>

            {/* Campo de Busca com Lupa */}
            <div className="relative mb-6 max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    {/* Ícone de Lupa em SVG */}
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Pesquisar música ou cantor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white text-gray-800"
                />
            </div>

            {error && (
                <p className="mb-4 text-white font-semibold">Erro: {error}</p>
            )}

            <div className="space-y-4">
                {musicasFiltradas.map((musica) => (
                    <Link
                        key={musica.id}
                        href={`/Fed/${musica.id}`}
                        className="block bg-white p-4 rounded-lg hover:bg-gray-100"
                    >
                        <p className="text-xl font-bold">
                            {musica.nome_da_musica}
                        </p>

                        <p className="text-gray-600">
                            {musica.nome_do_cantor}
                        </p>
                    </Link>
                ))}

                {musicasFiltradas.length === 0 && !error && (
                    <p className="text-white">Nenhuma música encontrada.</p>
                )}
            </div>
        </div>
    )
}