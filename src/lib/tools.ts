export interface Tool {
  id: string
  label: string
  abbr?: string        // 2-letter badge (Adobe style)
  emoji?: string       // emoji fallback
  color: string        // text/accent color
  bg?: string          // badge bg (Adobe apps)
}

export const TOOLS: Tool[] = [
  // ── Adobe Creative Suite ──────────────────────────────────────────────────
  { id: 'photoshop',    label: 'Photoshop',       abbr: 'Ps', color: '#31A8FF', bg: '#001E36' },
  { id: 'illustrator',  label: 'Illustrator',     abbr: 'Ai', color: '#FF9A00', bg: '#330000' },
  { id: 'indesign',     label: 'InDesign',        abbr: 'Id', color: '#FF3366', bg: '#49021F' },
  { id: 'premiere',     label: 'Premiere Pro',    abbr: 'Pr', color: '#9999FF', bg: '#00005B' },
  { id: 'aftereffects', label: 'After Effects',   abbr: 'Ae', color: '#9999FF', bg: '#00005B' },
  { id: 'mediaencoder', label: 'Media Encoder',   abbr: 'Me', color: '#00E4BB', bg: '#170B1A' },
  { id: 'acrobat',      label: 'Acrobat',         abbr: 'Ac', color: '#FF0000', bg: '#330000' },
  { id: 'xd',           label: 'Adobe XD',        abbr: 'Xd', color: '#FF61F6', bg: '#2B002B' },
  { id: 'lightroom',    label: 'Lightroom',        abbr: 'Lr', color: '#31A8FF', bg: '#001B2B' },
  { id: 'audition',     label: 'Audition',         abbr: 'Au', color: '#00E4BB', bg: '#000F12' },
  // ── Physical / craft ─────────────────────────────────────────────────────
  { id: 'cricut',       label: 'Cricut',       emoji: '✂️',  color: '#3CB24D' },
  { id: 'heatpress',    label: 'Heat Press',   emoji: '🔥',  color: '#FF6B35' },
  { id: 'photography',  label: 'Photography',  emoji: '📷',  color: '#8B9196' },
  { id: 'camera',       label: 'Video Camera', emoji: '🎥',  color: '#8B9196' },
  { id: '3dprint',      label: '3D Printing',  emoji: '🖨️', color: '#E76F51' },
  { id: 'sewing',       label: 'Sewing',       emoji: '🧵',  color: '#E63946' },
  // ── AI / digital ─────────────────────────────────────────────────────────
  { id: 'ai',           label: 'AI Tools',     emoji: '🤖',  color: '#8B5CF6' },
  { id: 'midjourney',   label: 'Midjourney',   emoji: '🎨',  color: '#7B61FF' },
  { id: 'chatgpt',      label: 'ChatGPT',      emoji: '💬',  color: '#10A37F' },
  { id: 'claude',       label: 'Claude',       emoji: '🧠',  color: '#CC785C' },
  // ── Dev / code ───────────────────────────────────────────────────────────
  { id: 'code',         label: 'Custom Code',  emoji: '💻',  color: '#4B9CE2' },
  { id: 'figma',        label: 'Figma',        emoji: '🎯',  color: '#F24E1E' },
  { id: 'davinci',      label: 'DaVinci',      abbr: 'DV',   color: '#FFB400', bg: '#1A1A2E' },
]

export const TOOL_MAP = Object.fromEntries(TOOLS.map(t => [t.id, t]))
