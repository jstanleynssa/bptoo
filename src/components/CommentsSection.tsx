'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ChevronUp, ChevronDown, MessageSquare, ExternalLink, Trash2 } from 'lucide-react'
import CommentForm, { type CommentData } from '@/components/CommentForm'

interface CommentsSectionProps {
  contentType: 'post' | 'project'
  contentSlug: string
  isAdmin?: boolean
}

function getVoterId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'bptoo_voter_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

function formatAuthor(comment: CommentData) {
  if (comment.author_website) {
    return (
      <a href={comment.author_website} target="_blank" rel="noopener noreferrer"
        className="font-semibold text-white hover:text-[#FACD40] transition-colors inline-flex items-center gap-1">
        {comment.author_name} <ExternalLink size={11} />
      </a>
    )
  }
  return <span className="font-semibold text-white">{comment.author_name}</span>
}

function CommentItem({
  comment, replies, onReply, onVote, onDelete, isAdmin, votedMap
}: {
  comment: CommentData
  replies: CommentData[]
  onReply: (parentId: string, c: CommentData) => void
  onVote: (id: string, vote: 1 | -1) => void
  onDelete: (id: string) => void
  isAdmin: boolean
  votedMap: Record<string, 1 | -1>
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const myVote = votedMap[comment.id]

  return (
    <div className="group">
      <div className={`flex gap-3 ${comment.is_deleted ? 'opacity-40' : ''}`}>
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
          <button onClick={() => onVote(comment.id, 1)}
            className={`p-0.5 rounded transition-colors ${myVote === 1 ? 'text-[#FACD40]' : 'text-white/30 hover:text-white/70'}`}>
            <ChevronUp size={18} />
          </button>
          <span className={`text-xs font-bold ${comment.vote_score > 0 ? 'text-[#FACD40]' : comment.vote_score < 0 ? 'text-red-400' : 'text-white/40'}`}>
            {comment.vote_score}
          </span>
          <button onClick={() => onVote(comment.id, -1)}
            className={`p-0.5 rounded transition-colors ${myVote === -1 ? 'text-red-400' : 'text-white/30 hover:text-white/70'}`}>
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {formatAuthor(comment)}
            <span className="text-white/30 text-xs">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap break-words">{comment.body}</p>

          {/* Actions */}
          {!comment.is_deleted && (
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => setShowReplyForm(r => !r)}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
                <MessageSquare size={12} />
                Reply
              </button>
              {isAdmin && (
                <button onClick={() => onDelete(comment.id)}
                  className="flex items-center gap-1 text-xs text-white/20 hover:text-red-400 transition-colors">
                  <Trash2 size={12} />
                  Remove
                </button>
              )}
            </div>
          )}

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <CommentForm
                contentType={'post'} contentSlug={''}
                parentId={comment.id}
                compact
                onSubmitted={c => { onReply(comment.id, c); setShowReplyForm(false) }}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-3 pl-4 border-l border-white/10 space-y-4">
              {replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} replies={[]}
                  onReply={onReply} onVote={onVote} onDelete={onDelete}
                  isAdmin={isAdmin} votedMap={votedMap} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommentsSection({ contentType, contentSlug, isAdmin = false }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState(true)
  const [votedMap, setVotedMap] = useState<Record<string, 1 | -1>>({})

  const load = useCallback(async () => {
    const res = await fetch(`/api/comments?contentType=${contentType}&contentSlug=${contentSlug}`)
    if (res.ok) setComments(await res.json())
    setLoading(false)

    // Load saved votes
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`bptoo_votes_${contentSlug}`)
      if (saved) setVotedMap(JSON.parse(saved))
    }
  }, [contentType, contentSlug])

  useEffect(() => { load() }, [load])

  function handleNew(comment: CommentData) {
    setComments(prev => [...prev, comment])
  }

  function handleReply(parentId: string, reply: CommentData) {
    setComments(prev => [...prev, { ...reply, parent_id: parentId }])
  }

  async function handleVote(id: string, vote: 1 | -1) {
    const voterId = getVoterId()
    const res = await fetch(`/api/comments/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId, vote }),
    })
    if (!res.ok) return
    const { score } = await res.json()

    setComments(prev => prev.map(c => c.id === id ? { ...c, vote_score: score } : c))

    // Track local vote state
    setVotedMap(prev => {
      const next = { ...prev }
      if (prev[id] === vote) delete next[id] // toggle off
      else next[id] = vote
      if (typeof window !== 'undefined') {
        localStorage.setItem(`bptoo_votes_${contentSlug}`, JSON.stringify(next))
      }
      return next
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this comment?')) return
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(prev => prev.map(c => c.id === id
        ? { ...c, is_deleted: true, body: '[removed]', author_name: '[removed]' }
        : c
      ))
    }
  }

  const topLevel = comments.filter(c => !c.parent_id)
  const replies = comments.filter(c => c.parent_id)
  const total = comments.filter(c => !c.is_deleted).length

  return (
    <section className="mt-16 pt-10 border-t border-white/10">
      <h2 className="text-2xl text-white mb-8" style={{ fontFamily: 'Peralta, serif' }}>
        {total > 0 ? `${total} ${total === 1 ? 'comment' : 'comments'}` : 'Discussion'}
      </h2>

      {/* New comment form */}
      <div className="mb-10 p-5 bg-white/5 border border-white/10 rounded-2xl">
        <CommentForm contentType={contentType} contentSlug={contentSlug}
          onSubmitted={handleNew} />
      </div>

      {/* Comment list */}
      {loading ? (
        <p className="text-white/30 text-sm">Loading…</p>
      ) : topLevel.length === 0 ? (
        <p className="text-white/30 text-sm">No comments yet — be the first.</p>
      ) : (
        <div className="space-y-6">
          {topLevel
            .sort((a, b) => b.vote_score - a.vote_score) // Reddit-style: highest votes first
            .map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={replies.filter(r => r.parent_id === comment.id)}
                onReply={handleReply}
                onVote={handleVote}
                onDelete={handleDelete}
                isAdmin={isAdmin}
                votedMap={votedMap}
              />
            ))}
        </div>
      )}
    </section>
  )
}
