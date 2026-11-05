'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface MoodLog {
  id: string
  logged_at: string
  score: number
  label: string | null
  note: string | null
}

const LABEL_FOR_SCORE: Record<number, string> = {
  1: 'Stuck', 2: 'Stuck', 3: 'Low', 4: 'Low',
  5: 'Okay', 6: 'Okay', 7: 'Scattered', 8: 'Flowing',
  9: 'Hypo', 10: 'Hypo',
}

function scoreColor(score: number): string {
  if (score <= 2) return '#6366f1'
  if (score <= 4) return '#8b5cf6'
  if (score <= 6) return '#FACD40'
  if (score <= 8) return '#f59e0b'
  return '#ef4444'
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: MoodLog & { displayDate: string } }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm shadow-xl max-w-xs">
      <p className="text-white font-medium">{d.score}/10 · {LABEL_FOR_SCORE[d.score]}</p>
      <p className="text-zinc-400 text-xs mt-0.5">{d.displayDate}</p>
      {d.note && <p className="text-zinc-300 text-xs mt-2 border-t border-zinc-700 pt-2">{d.note}</p>}
    </div>
  )
}

export default function MoodPage() {
  const [logs, setLogs] = useState<MoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('mood_logs') as any)
        .select('*')
        .eq('is_public', true)
        .order('logged_at', { ascending: true })
        .limit(200)
      setLogs(data ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const chartData = logs.map(l => ({
    ...l,
    displayDate: format(parseISO(l.logged_at), 'MMM d, h:mm a'),
    dateShort: format(parseISO(l.logged_at), 'MMM d'),
  }))

  const latest = logs[logs.length - 1]
  const avg = logs.length ? Math.round(logs.reduce((s, l) => s + l.score, 0) / logs.length * 10) / 10 : null

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-5xl text-white mb-3" style={{ fontFamily: 'Peralta, serif' }}>
          The Wave
        </h1>
        <p className="text-white/50 max-w-xl">
          A real-time record of where I'm at. Bipolar 2 means riding variable swells —
          this is what that actually looks like over time.
        </p>
      </div>

      {/* Current + stats */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Right now</p>
            <p className="text-3xl font-bold" style={{ color: scoreColor(latest.score) }}>
              {latest.score}/10
            </p>
            <p className="text-white/60 text-sm mt-0.5">{LABEL_FOR_SCORE[latest.score]}</p>
          </div>
          {avg && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Average</p>
              <p className="text-3xl font-bold text-white">{avg}/10</p>
              <p className="text-white/60 text-sm mt-0.5">{logs.length} readings</p>
            </div>
          )}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">The scale</p>
            <div className="space-y-0.5 text-xs text-white/50">
              {[['🌑 1–2', 'Stuck'], ['🌘 3–4', 'Low'], ['🌗 5–6', 'Okay'], ['🌀 7', 'Scattered'], ['🌔 8', 'Flowing'], ['🌕 9–10', 'Hypo']].map(([e, l]) => (
                <div key={l} className="flex justify-between"><span>{e}</span><span>{l}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-sm text-white/40 mb-6 uppercase tracking-wider font-medium">Mood over time</p>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-white/30">Loading…</div>
        ) : logs.length < 2 ? (
          <div className="h-64 flex items-center justify-center text-white/30">
            Not enough data yet — check back soon.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FACD40" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FACD40" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="dateShort" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                axisLine={false} tickLine={false} />
              <YAxis domain={[1, 10]} ticks={[1, 3, 5, 7, 9]}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={5} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#FACD40"
                strokeWidth={2}
                fill="url(#moodGradient)"
                dot={{ fill: '#FACD40', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#FACD40', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent notes */}
      {logs.filter(l => l.note).length > 0 && (
        <div className="mt-10">
          <p className="text-sm text-white/40 uppercase tracking-wider font-medium mb-4">Notes from the log</p>
          <div className="space-y-3">
            {[...logs].reverse().filter(l => l.note).slice(0, 5).map(log => (
              <div key={log.id} className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="shrink-0 mt-0.5">
                  <span className="text-lg font-bold" style={{ color: scoreColor(log.score) }}>{log.score}</span>
                </div>
                <div>
                  <p className="text-white/70 text-sm leading-relaxed">{log.note}</p>
                  <p className="text-white/30 text-xs mt-1">{format(parseISO(log.logged_at), 'MMMM d, yyyy')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
