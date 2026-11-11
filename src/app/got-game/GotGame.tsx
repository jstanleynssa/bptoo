'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Shuffle, RotateCcw, ArrowLeft } from 'lucide-react'
import type { GotCharacter } from '@/data/got-characters'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function FlipCard({ char, flipped, onFlip }: { char: GotCharacter; flipped: boolean; onFlip: () => void }) {
  return (
    <div className="[perspective:1000px] cursor-pointer group" onClick={onFlip}>
      <div
        className={`relative w-full [transform-style:preserve-3d] transition-transform duration-700 ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
        style={{ aspectRatio: '3/4.4' }}
      >
        {/* Front — portrait */}
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
          <Image
            src={char.portraitUrl}
            alt="Who is this character?"
            fill
            className="object-cover object-top scale-[1.06] origin-top"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          {/* Hover hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
            <span className="text-xs text-white/80 font-medium tracking-wide uppercase bg-black/60 px-2 py-1 rounded-full">
              Click to reveal
            </span>
          </div>
        </div>

        {/* Back — character card */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl overflow-y-auto ring-1 ring-amber-900/50"
          style={{ background: 'linear-gradient(160deg, #1a1208 0%, #0f0a04 50%, #0a0a0a 100%)' }}
        >
          <div className="p-4 flex flex-col h-full">
            {/* House allegiance tag */}
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-500/70 font-medium mb-1">
              {char.allegiance}
            </div>

            {/* Name */}
            <h2 className="text-lg font-bold leading-tight mb-2 text-amber-100" style={{ fontFamily: 'Peralta, serif' }}>
              {char.name}
            </h2>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-700/60 to-transparent mb-3" />

            {/* Stats */}
            <div className="space-y-1 mb-3 text-xs">
              {char.born && (
                <div className="flex gap-2">
                  <span className="text-zinc-500 shrink-0 w-16">Born</span>
                  <span className="text-zinc-300">{char.born}</span>
                </div>
              )}
              {char.firstAppearance && (
                <div className="flex gap-2">
                  <span className="text-zinc-500 shrink-0 w-16">Appears</span>
                  <span className="text-zinc-300">{char.firstAppearance}</span>
                </div>
              )}
              {char.age > 0 && (
                <div className="flex gap-2">
                  <span className="text-zinc-500 shrink-0 w-16">Age</span>
                  <span className="text-zinc-300">{char.age}</span>
                </div>
              )}
              {char.aliases && (
                <div className="flex gap-2">
                  <span className="text-zinc-500 shrink-0 w-16">Known as</span>
                  <span className="text-zinc-300 italic">{char.aliases}</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-900/40 to-transparent mb-3" />

            {/* Description */}
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-6 flex-1">
              {char.description}
            </p>

            {/* Flip back hint */}
            <div className="text-center mt-3">
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest">tap to flip</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GotGame({ characters }: { characters: GotCharacter[] }) {
  const [cards, setCards] = useState(() => shuffle(characters))
  const [flipped, setFlipped] = useState<Set<number>>(new Set())

  const toggleFlip = useCallback((id: number) => {
    setFlipped(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const doShuffle = () => {
    setCards(shuffle(characters))
    setFlipped(new Set())
  }

  const reset = () => setFlipped(new Set())

  const revealedCount = flipped.size
  const totalCount = cards.length

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0A0A0A]/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/projects/faces-of-a-game-of-thrones"
              className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-amber-400 leading-none" style={{ fontFamily: 'Peralta, serif' }}>
                Faces of A Game of Thrones
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">Can you name them all?</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Score */}
            <div className="text-center">
              <div className="text-lg font-bold text-amber-400 leading-none">{revealedCount}<span className="text-zinc-600 text-sm font-normal">/{totalCount}</span></div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-wide">revealed</div>
            </div>

            <div className="flex gap-1">
              <button onClick={reset} title="Flip all cards back"
                className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
                <RotateCcw size={15} />
              </button>
              <button onClick={doShuffle} title="Shuffle and reset"
                className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors">
                <Shuffle size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-amber-700 to-amber-400 transition-all duration-500"
            style={{ width: `${(revealedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Instructions (shown until first flip) */}
      {revealedCount === 0 && (
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-2 text-center">
          <p className="text-zinc-500 text-sm">
            Look at each face. When you think you know who it is — click to reveal.
          </p>
        </div>
      )}

      {/* Card grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {cards.map(char => (
            <FlipCard
              key={char.id}
              char={char}
              flipped={flipped.has(char.id)}
              onFlip={() => toggleFlip(char.id)}
            />
          ))}
        </div>
      </div>

      {/* Completion banner */}
      {revealedCount === totalCount && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-30">
          <div className="pointer-events-auto bg-zinc-900 border border-amber-700/50 rounded-2xl px-8 py-6 text-center shadow-2xl mx-4">
            <div className="text-3xl mb-2">🏆</div>
            <h2 className="text-xl font-bold text-amber-400 mb-1" style={{ fontFamily: 'Peralta, serif' }}>
              All {totalCount} Revealed
            </h2>
            <p className="text-zinc-400 text-sm mb-4">You know your Westeros.</p>
            <button onClick={doShuffle}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-600 rounded-lg text-sm font-medium transition-colors">
              Shuffle & Play Again
            </button>
          </div>
        </div>
      )}

      <div className="h-16" />
    </div>
  )
}
