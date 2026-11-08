'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface MoodLog {
  id: string
  logged_at: string
  score: number
  label: string | null
  note: string | null
  is_public: boolean
}

const LABELS: Record<number, { label: string; color: string; emoji: string }> = {
  1:  { label: 'Stuck',     color: '#6366f1', emoji: '🌑' },
  2:  { label: 'Stuck',     color: '#6366f1', emoji: '🌑' },
  3:  { label: 'Low',       color: '#8b5cf6', emoji: '🌘' },
  4:  { label: 'Low',       color: '#8b5cf6', emoji: '🌘' },
  5:  { label: 'Okay',      color: '#FACD40', emoji: '🌗' },
  6:  { label: 'Okay',      color: '#FACD40', emoji: '🌗' },
  7:  { label: 'Scattered', color: '#84cc16', emoji: '🌀' },
  8:  { label: 'Flowing',   color: '#f59e0b', emoji: '🌔' },
  9:  { label: 'Hypo',      color: '#f97316', emoji: '🌕' },
  10: { label: 'Hypo',      color: '#ef4444', emoji: '🌕' },
}

export default function MoodPage() {
  const [logs, setLogs] = useState<MoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(5)
  const [note, setNote] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10))
  const supabase = createClient()

  const load = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('mood_logs') as any)
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(60)
    setLogs(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function logMood() {
    setSaving(true)
    const info = LABELS[score]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('mood_logs') as any).insert({
      score,
      label: info.label,
      note: note || null,
      is_public: isPublic,
      // Parse as local noon to avoid UTC offset shifting the date back a day
      logged_at: new Date(`${logDate}T12:00:00`).toISOString(),
    })
    if (error) { toast.error(error.message) }
    else { toast.success('Mood logged'); setNote(''); await load() }
    setSaving(false)
  }

  async function deletelog(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('mood_logs') as any).delete().eq('id', id)
    setLogs(l => l.filter(x => x.id !== id))
  }

  const info = LABELS[score]

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mood Log</h1>
        <p className="text-zinc-400 text-sm mt-1">How are you riding the wave today?</p>
      </div>

      {/* Logger */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-5xl">{info.emoji}</span>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold" style={{ color: info.color }}>{score}</p>
            <p className="text-zinc-400 text-sm">{info.label}</p>
          </div>
        </div>

        {/* Score slider */}
        <input
          type="range" min={1} max={10} value={score}
          onChange={e => setScore(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer mb-2"
          style={{ accentColor: info.color }}
        />
        <div className="flex justify-between text-xs text-zinc-600 mb-5">
          <span>🌑 Stuck</span>
          <span>🌗 Okay</span>
          <span>🌀 Scattered</span>
          <span>🌕 Hypo</span>
        </div>

        {/* Date — defaults to today, can backfill past dates */}
        <div className="flex items-center gap-3 mb-1">
          <label className="text-sm text-zinc-400 shrink-0">Date</label>
          <input
            type="date"
            value={logDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={e => setLogDate(e.target.value)}
            className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:border-violet-500 outline-none transition-colors"
          />
          {logDate !== new Date().toISOString().slice(0, 10) && (
            <button type="button" onClick={() => setLogDate(new Date().toISOString().slice(0, 10))}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Today</button>
          )}
        </div>

        {/* Note */}
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="What's going on? (optional)"
          rows={2}
          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm resize-none focus:border-violet-500 outline-none placeholder-zinc-600 transition-colors mb-4"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400">
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)}
              className="accent-violet-500 w-4 h-4" />
            Show publicly
          </label>
          <button onClick={logMood} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Log mood
          </button>
        </div>
      </div>

      {/* History */}
      <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Recent logs</h2>
      {loading ? (
        <div className="text-zinc-500 text-center py-8"><Loader2 size={18} className="animate-spin inline" /></div>
      ) : logs.length === 0 ? (
        <p className="text-zinc-500 text-center py-8">No logs yet.</p>
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const li = LABELS[log.score]
            return (
              <div key={log.id} className="flex items-start gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl group">
                <span className="text-xl shrink-0">{li.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: li.color }}>{log.score}/10 · {li.label}</span>
                    {!log.is_public && <span className="text-xs text-zinc-600 border border-zinc-700 px-1.5 py-0.5 rounded">Private</span>}
                  </div>
                  {log.note && <p className="text-zinc-400 text-sm mt-0.5">{log.note}</p>}
                  <p className="text-zinc-600 text-xs mt-1">{format(new Date(log.logged_at), 'MMM d, yyyy · h:mm a')}</p>
                </div>
                <button onClick={() => deletelog(log.id)}
                  className="p-1.5 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
