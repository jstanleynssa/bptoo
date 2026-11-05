'use client'

import { useState, useEffect } from 'react'
import { Loader2, Send } from 'lucide-react'

interface CommentFormProps {
  contentType: 'post' | 'project'
  contentSlug: string
  parentId?: string
  onSubmitted: (comment: CommentData) => void
  onCancel?: () => void
  compact?: boolean
}

export interface CommentData {
  id: string
  parent_id: string | null
  author_name: string
  author_website: string | null
  body: string
  vote_score: number
  is_deleted: boolean
  created_at: string
}

const STORAGE_KEY = 'bptoo_commenter'

export default function CommentForm({ contentType, contentSlug, parentId, onSubmitted, onCancel, compact }: CommentFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill from localStorage on mount
  useEffect(() => {
    if (compact) return // replies don't need name/email
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { name: n, email: e } = JSON.parse(saved)
        if (n) setName(n)
        if (e) setEmail(e)
      }
    } catch {}
  }, [compact])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType, contentSlug, parentId,
        authorName: name || 'Anonymous',
        authorEmail: email || null,
        commentBody: body,
        honeypot,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      setSubmitting(false)
      return
    }

    // Remember commenter info for next time
    if (!compact && name) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, email }))
      } catch {}
    }

    onSubmitted(data)
    setBody('')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Honeypot — hidden from humans, bots fill it in */}
      <input
        type="text" name="website_url" value={honeypot}
        onChange={e => setHoneypot(e.target.value)}
        style={{ display: 'none' }} tabIndex={-1} autoComplete="off"
        aria-hidden="true"
      />

      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Name (or leave blank for Anonymous)"
              maxLength={100}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:border-[#FACD40] outline-none transition-colors"
            />
          </div>
          <div>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email (optional, never shown)"
              maxLength={254}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:border-[#FACD40] outline-none transition-colors"
            />
          </div>
        </div>
      )}

      <div>
        <textarea
          value={body} onChange={e => setBody(e.target.value)}
          placeholder={compact ? 'Write a reply…' : 'What do you think?'}
          required minLength={2} maxLength={2000}
          rows={compact ? 2 : 4}
          className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 focus:border-[#FACD40] outline-none resize-none transition-colors"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-white/20">{body.length}/2000</span>
          {!compact && <span className="text-xs text-white/20">Your email is never shown or sold</span>}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex items-center justify-between">
        {name && !compact && (
          <span className="text-xs text-white/30">
            Posting as <span className="text-white/50">{name}</span> ·{' '}
            <button type="button" onClick={() => { setName(''); setEmail(''); localStorage.removeItem(STORAGE_KEY) }}
              className="underline hover:text-white/60 transition-colors">
              change
            </button>
          </span>
        )}
        <div className={`flex gap-2 ${name && !compact ? '' : 'ml-auto'}`}>
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">
              Cancel
            </button>
          )}
          <button type="submit" disabled={submitting || body.length < 2}
            className="flex items-center gap-2 px-4 py-2 bg-[#FACD40] hover:bg-[#FACD40]/80 text-black rounded-xl text-sm font-medium transition-colors disabled:opacity-40">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {compact ? 'Reply' : 'Post comment'}
          </button>
        </div>
      </div>
    </form>
  )
}
