import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

const IP_SALT = process.env.IP_HASH_SALT ?? 'bptoo-comment-salt-2024'
const RATE_LIMIT_MAX = 5    // comments per IP per window
const RATE_WINDOW_MS = 60 * 60 * 1000  // 1 hour

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + IP_SALT).digest('hex').slice(0, 32)
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim()
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const contentType = searchParams.get('contentType')
  const contentSlug = searchParams.get('contentSlug')

  if (!contentType || !contentSlug) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('comments') as any)
    .select('id, parent_id, author_name, author_website, body, vote_score, is_deleted, created_at')
    .eq('content_type', contentType)
    .eq('content_slug', contentSlug)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { contentType, contentSlug, parentId, authorName, authorEmail,
    authorWebsite, commentBody, honeypot } = body

  // ── Honeypot check ───────────────────────────────────────────────────────
  if (honeypot) {
    // Bot filled the hidden field — silently accept but don't save
    return NextResponse.json({ id: 'fake', ok: true })
  }

  // ── Input validation ─────────────────────────────────────────────────────
  if (!contentType || !contentSlug || !authorName || !authorEmail || !commentBody) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const name = stripHtml(authorName).slice(0, 100)
  const email = stripHtml(authorEmail).slice(0, 254)
  const website = authorWebsite ? stripHtml(authorWebsite).slice(0, 2048) : null
  const text = stripHtml(commentBody).slice(0, 2000)

  if (name.length < 1) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!isValidEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  if (text.length < 2) return NextResponse.json({ error: 'Comment too short' }, { status: 400 })
  if (!['post', 'project'].includes(contentType)) return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })

  // ── Rate limiting ────────────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
  const ipHash = hashIp(ip)
  const windowStart = new Date(Date.now() - RATE_WINDOW_MS).toISOString()

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase.from('comments') as any)
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', windowStart)

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return NextResponse.json({ error: 'Too many comments — please slow down.' }, { status: 429 })
  }

  // ── Insert ───────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: comment, error: insertError } = await (supabase.from('comments') as any)
    .insert({
      content_type: contentType,
      content_slug: contentSlug,
      parent_id: parentId || null,
      author_name: name,
      author_email: email,
      author_website: website,
      body: text,
      ip_hash: ipHash,
    })
    .select('id, parent_id, author_name, author_website, body, vote_score, is_deleted, created_at')
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  // ── Notify ───────────────────────────────────────────────────────────────
  const webhookUrl = process.env.COMMENT_WEBHOOK_URL
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'new_comment',
        content_type: contentType,
        content_slug: contentSlug,
        author: name,
        body: text.slice(0, 200),
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/${contentType === 'post' ? 'blog' : 'projects'}/${contentSlug}`,
      }),
    }).catch(() => {}) // fire and forget
  }

  return NextResponse.json(comment, { status: 201 })
}
