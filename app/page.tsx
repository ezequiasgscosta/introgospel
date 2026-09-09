"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/supabaseClient"

interface Musica {
	id: number
	nome_da_musica: string
	nome_do_cantor: string
	tom: string | null
}

function SearchIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
			<circle cx="11" cy="11" r="6.5" />
			<path d="m16 16 4.5 4.5" strokeLinecap="round" />
		</svg>
	)
}

function ArrowUpRightIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
			<path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
}

function MusicNoteIcon({ className = "h-5 w-5" }: { className?: string }) {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
			<path d="M9 18V5l10-2v13" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M9 8 19 6" strokeLinecap="round" />
			<ellipse cx="6" cy="18" rx="3" ry="2.5" />
			<ellipse cx="16" cy="16" rx="3" ry="2.5" />
		</svg>
	)
}

export default function Home() {
	const [musicas, setMusicas] = useState<Musica[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const [carregando, setCarregando] = useState(true)
	const [erro, setErro] = useState<string | null>(null)

	useEffect(() => {
		async function carregarMusicas() {
			const { data, error } = await supabase
				.from("musicas")
				.select("id, nome_da_musica, nome_do_cantor, tom")
				.order("id", { ascending: false })

			if (error) {
				console.error("Erro ao buscar músicas:", error)
				setErro("Não foi possível carregar suas cifras agora.")
			} else {
				setMusicas(data || [])
			}

			setCarregando(false)
		}

		carregarMusicas()
	}, [])

	const termo = searchTerm.trim().toLowerCase()
	const resultados = useMemo(
		() =>
			musicas.filter((musica) =>
				[musica.nome_da_musica, musica.nome_do_cantor]
					.join(" ")
					.toLowerCase()
					.includes(termo)
			),
		[musicas, termo]
	)

	const artistas = new Set(musicas.map((musica) => musica.nome_do_cantor.toLowerCase()))
	const recentes = musicas.slice(0, 5)
	const mostrandoBusca = termo.length > 0

	return (
		<main className="min-h-[calc(100vh-4.5rem)] overflow-hidden bg-[#07111f] text-slate-100">
			<section className="relative border-b border-white/10 bg-[#0b1b2e]">
				<div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(126,166,194,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(126,166,194,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
				<div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_15%,rgba(239,126,74,0.22),transparent_42%)]" />

				<div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-20 lg:px-10 lg:pb-24">
					<div>
						<div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#f39a6b]">
							<span className="h-px w-8 bg-[#f39a6b]" />
							Seu repertório, seu ritmo
						</div>
						<h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
							A música começa quando você encontra a cifra certa.
						</h1>
						<p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
							Guarde suas cifras, descubra o próximo som e toque sem perder tempo procurando.
						</p>

						<div className="mt-9 flex flex-wrap gap-3">
							<Link href="/criacao" className="inline-flex items-center gap-2 bg-[#ed8554] px-5 py-3 text-sm font-bold text-[#1d1720] transition hover:bg-[#f49d71]">
								Criar nova cifra
								<ArrowUpRightIcon />
							</Link>
							<Link href="/Fed" className="inline-flex items-center gap-2 border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5">
								Abrir biblioteca
							</Link>
						</div>
					</div>

					<div className="relative lg:pb-1">
						<div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
							<span>Buscar no repertório</span>
							<span className="text-[#f39a6b]">{musicas.length} cifras</span>
						</div>
						<label className="flex items-center gap-3 border border-white/15 bg-[#07111f]/80 px-4 py-4 shadow-2xl shadow-black/20 transition focus-within:border-[#f39a6b]">
							<SearchIcon />
							<span className="sr-only">Pesquisar música ou cantor</span>
							<input
								type="search"
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
								placeholder="Música, cantor ou banda..."
								className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
							/>
							<kbd className="hidden border border-white/15 px-2 py-1 text-[10px] text-slate-500 sm:block">⌘ K</kbd>
						</label>
						<p className="mt-3 text-xs text-slate-500">Pesquise por título ou artista e abra a cifra em um toque.</p>
					</div>
				</div>
			</section>

			<div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
				{mostrandoBusca ? (
					<section aria-labelledby="resultados-title">
						<div className="mb-7 flex items-end justify-between gap-4">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f39a6b]">Pesquisa</p>
								<h2 id="resultados-title" className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Resultados para “{searchTerm}”</h2>
							</div>
							<span className="text-sm text-slate-500">{resultados.length} encontrada{resultados.length === 1 ? "" : "s"}</span>
						</div>
						{resultados.length > 0 ? (
							<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{resultados.map((musica) => <MusicCard key={musica.id} musica={musica} />)}
							</div>
						) : (
							<EmptyState texto="Nenhuma cifra encontrada com esse termo." />
						)}
					</section>
				) : (
					<>
						<section className="grid gap-3 border-y border-white/10 py-5 sm:grid-cols-3 sm:gap-0">
							<Stat label="Cifras salvas" value={carregando ? "--" : String(musicas.length)} detail="no seu repertório" />
							<Stat label="Artistas" value={carregando ? "--" : String(artistas.size)} detail="vozes para descobrir" />
							<Stat label="Seu espaço" value="Livre" detail="feito para tocar" />
						</section>

						<section className="mt-16" aria-labelledby="recentes-title">
							<div className="mb-7 flex items-end justify-between gap-4">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f39a6b]">Continue daqui</p>
									<h2 id="recentes-title" className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Adicionadas recentemente</h2>
								</div>
								<Link href="/Fed" className="hidden items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-[#f39a6b] sm:flex">
									Ver biblioteca <ArrowUpRightIcon />
								</Link>
							</div>

							{erro ? <EmptyState texto={erro} action="Tentar pela biblioteca" /> : carregando ? <LoadingGrid /> : recentes.length > 0 ? (
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									{recentes.map((musica) => <MusicCard key={musica.id} musica={musica} />)}
								</div>
							) : <EmptyState texto="Seu repertório ainda está vazio." action="Criar primeira cifra" href="/criacao" />}
						</section>

						<section className="mt-16 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
							<Link href="/criacao" className="group relative overflow-hidden border border-[#b85b3d]/50 bg-[#351d20] p-7 transition hover:border-[#f39a6b] sm:p-9">
								<div className="relative z-10 max-w-md">
									<span className="mb-8 inline-flex h-10 w-10 items-center justify-center bg-[#ed8554] text-[#1d1720]"><MusicNoteIcon /></span>
									<h2 className="text-2xl font-semibold text-white">Transforme uma ideia em música.</h2>
									<p className="mt-3 text-sm leading-6 text-slate-300">Monte sua cifra por tom, organize cada linha e deixe tudo pronto para o próximo ensaio.</p>
									<span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#f39a6b]">Começar agora <ArrowUpRightIcon /></span>
								</div>
								<div className="absolute -bottom-16 -right-8 text-[15rem] font-black leading-none text-[#f39a6b]/10 transition group-hover:translate-x-2">♪</div>
							</Link>
							<div className="border border-white/10 bg-[#0d1a2a] p-7 sm:p-9">
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tudo conectado</p>
								<h2 className="mt-3 text-2xl font-semibold text-white">Da criação ao palco.</h2>
								<div className="mt-7 space-y-5">
									<QuickLink href="/Fed" number="01" title="Biblioteca" text="Encontre qualquer cifra salva." />
									<QuickLink href="/login" number="02" title="Sua conta" text="Entre para manter seu repertório." />
									<QuickLink href="/administracao" number="03" title="Administração" text="Organize músicas e usuários." />
								</div>
							</div>
						</section>
					</>
				)}
			</div>

			<footer className="border-t border-white/10 bg-[#050c16]">
				<div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
					<div className="flex items-center gap-2 font-semibold text-slate-300"><span className="text-[#f39a6b]"><MusicNoteIcon /></span> intro<span className="text-[#f39a6b]">gospel</span></div>
					<p>Um lugar para guardar o que você toca.</p>
				</div>
			</footer>
		</main>
	)
}

function MusicCard({ musica }: { musica: Musica }) {
	return (
		<Link href={`/Fed/${musica.id}`} className="group flex min-h-28 items-center gap-4 border border-white/10 bg-[#0d1a2a] p-5 transition hover:-translate-y-0.5 hover:border-[#f39a6b]/70 hover:bg-[#112238]">
			<div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#18304a] text-[#f39a6b]"><MusicNoteIcon /></div>
			<div className="min-w-0 flex-1">
				<h3 className="truncate font-semibold text-white transition group-hover:text-[#f39a6b]">{musica.nome_da_musica}</h3>
				<p className="mt-1 truncate text-sm text-slate-400">{musica.nome_do_cantor}</p>
			</div>
			<div className="flex shrink-0 flex-col items-end gap-2">
				{musica.tom && <span className="text-xs font-semibold text-[#f39a6b]">Tom {musica.tom}</span>}
				<ArrowUpRightIcon />
			</div>
		</Link>
	)
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
	return (
		<div className="border-l border-white/10 px-1 py-2 first:border-0 sm:px-6 first:sm:pl-0">
			<p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
			<div className="mt-2 flex items-baseline gap-2"><strong className="text-2xl font-semibold text-white">{value}</strong><span className="text-sm text-slate-500">{detail}</span></div>
		</div>
	)
}

function QuickLink({ href, number, title, text }: { href: string; number: string; title: string; text: string }) {
	return (
		<Link href={href} className="group flex items-start gap-4">
			<span className="pt-0.5 text-xs font-semibold text-[#f39a6b]">{number}</span>
			<span><strong className="block text-sm font-semibold text-white group-hover:text-[#f39a6b]">{title}</strong><span className="mt-1 block text-sm text-slate-500">{text}</span></span>
			<span className="ml-auto text-slate-600 transition group-hover:text-[#f39a6b]"><ArrowUpRightIcon /></span>
		</Link>
	)
}

function EmptyState({ texto, action, href = "/Fed" }: { texto: string; action?: string; href?: string }) {
	return (
		<div className="border border-dashed border-white/15 bg-[#0d1a2a]/60 px-6 py-12 text-center">
			<div className="mx-auto flex h-12 w-12 items-center justify-center bg-[#18304a] text-[#f39a6b]"><MusicNoteIcon /></div>
			<p className="mt-4 text-sm text-slate-400">{texto}</p>
			{action && <Link href={href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#f39a6b] hover:text-[#ffc09f]">{action} <ArrowUpRightIcon /></Link>}
		</div>
	)
}

function LoadingGrid() {
	return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-28 animate-pulse border border-white/10 bg-[#0d1a2a]" />)}</div>
}
