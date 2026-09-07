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

    useEffect(() => {
        async function buscarMusicas() {
            const { data, error } = await supabase
                .from('musicas')
                .select('id, nome_da_musica, nome_do_cantor')

            if (error) {
                console.error('Erro ao buscar músicas:', error)
                setError(error.message)
                return
            }

            setData(data)
        }

        buscarMusicas()
    }, [])

    return (
        <div className="w-[100vw] min-h-[100vh] bg-red-400 p-8">
            <h1 className="text-3xl font-bold mb-6">
                Minhas músicas
            </h1>

            {error && (
                <p>Erro: {error}</p>
            )}

            <div className="space-y-4">
                {data.map((musica) => (
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
            </div>
        </div>
    )
}
