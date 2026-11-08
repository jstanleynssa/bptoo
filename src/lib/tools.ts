export interface Tool {
  id: string
  label: string
  abbr?: string
  emoji?: string
  color: string
  bg?: string
  description?: string
  domain?: string  // used to fetch the actual logo in tooltips
}

export const TOOLS: Tool[] = [
  // ── Adobe Creative Suite ─────────────────────────────────────────────────
  { id: 'photoshop',    label: 'Photoshop',         abbr: 'Ps', color: '#31A8FF', bg: '#001E36', description: 'Photo editing & compositing' },
  { id: 'illustrator',  label: 'Illustrator',       abbr: 'Ai', color: '#FF9A00', bg: '#330000', description: 'Vector graphics & illustration' },
  { id: 'indesign',     label: 'InDesign',          abbr: 'Id', color: '#FF3366', bg: '#49021F', description: 'Page layout & print design' },
  { id: 'premiere',     label: 'Premiere Pro',      abbr: 'Pr', color: '#9999FF', bg: '#00005B', description: 'Professional video editing' },
  { id: 'aftereffects', label: 'After Effects',     abbr: 'Ae', color: '#9999FF', bg: '#00005B', description: 'Motion graphics & visual effects' },
  { id: 'mediaencoder', label: 'Media Encoder',     abbr: 'Me', color: '#00E4BB', bg: '#170B1A', description: 'Video encoding & export' },
  { id: 'acrobat',      label: 'Acrobat',           abbr: 'Ac', color: '#FF0000', bg: '#330000', description: 'PDF creation & editing' },
  { id: 'xd',           label: 'Adobe XD',          abbr: 'Xd', color: '#FF61F6', bg: '#2B002B', description: 'UI/UX design & prototyping' },
  { id: 'lightroom',    label: 'Lightroom',          abbr: 'Lr', color: '#31A8FF', bg: '#001B2B', description: 'Photo organization & editing' },
  { id: 'audition',     label: 'Audition',           abbr: 'Au', color: '#00E4BB', bg: '#000F12', description: 'Audio recording & editing' },
  // ── Physical / craft ─────────────────────────────────────────────────────
  { id: 'cricut',       label: 'Cricut',       emoji: '✂️',  color: '#3CB24D', domain: 'cricut.com',         description: 'Precision cutting machine for vinyl, paper & fabric' },
  { id: 'heatpress',    label: 'Heat Press',   emoji: '🔥',  color: '#FF6B35',                               description: 'Applies designs to fabric with heat & pressure' },
  { id: 'photography',  label: 'Photography',  emoji: '📷',  color: '#8B9196',                               description: 'Still photography' },
  { id: 'camera',       label: 'Video Camera', emoji: '🎥',  color: '#8B9196',                               description: 'Video production & cinematography' },
  { id: 'iphone',       label: 'iPhone',       emoji: '📱',  color: '#6E6E73', domain: 'apple.com',          description: 'Shot or edited on iPhone' },
  { id: '3dprint',      label: '3D Printing',  emoji: '🖨️', color: '#E76F51',                               description: 'Additive manufacturing & rapid prototyping' },
  { id: 'sewing',       label: 'Sewing',       emoji: '🧵',  color: '#E63946',                               description: 'Hand or machine sewing & fabric work' },
  // ── AI / digital ─────────────────────────────────────────────────────────
  { id: 'ai',           label: 'AI Tools',     emoji: '🤖',  color: '#8B5CF6',                               description: 'AI-assisted creation & automation' },
  { id: 'midjourney',   label: 'Midjourney',   emoji: '🎨',  color: '#7B61FF', domain: 'midjourney.com',     description: 'AI image generation from text prompts' },
  { id: 'chatgpt',      label: 'ChatGPT',      emoji: '💬',  color: '#10A37F', domain: 'openai.com',         description: "OpenAI's conversational AI assistant" },
  { id: 'claude',       label: 'Claude',       emoji: '🧠',  color: '#CC785C', domain: 'anthropic.com',      description: "Anthropic's AI assistant" },
  { id: 'elevenlabs',   label: 'ElevenLabs',   emoji: '🎙️', color: '#6C47FF', domain: 'elevenlabs.io',      description: 'AI voice cloning & text-to-speech' },
  { id: 'heygen',       label: 'HeyGen',       emoji: '🎬',  color: '#00C2CB', domain: 'heygen.com',         description: 'AI avatar video generation' },
  { id: 'faceapp',      label: 'FaceApp',      emoji: '🤳',  color: '#FF6B9D', domain: 'faceapp.com',           description: 'AI photo editing & face transformation' },
  { id: 'istock',       label: 'iStock',       emoji: '🖼️', color: '#009BDE', domain: 'istockphoto.com',       description: 'Stock photos, video & illustrations' },
  { id: 'envato',       label: 'Envato',       emoji: '🛒',  color: '#81B441', domain: 'envato.com',            description: 'Creative assets — templates, music, graphics' },
  { id: 'flux',         label: 'Flux',         emoji: '⚡',  color: '#E0E0E0', domain: 'blackforestlabs.ai',   description: 'State-of-the-art AI image generation model' },
  { id: 'imagineart',   label: 'ImagineArt',   emoji: '🌟',  color: '#FF6B6B', domain: 'imagineart.ai',         description: 'AI image generation platform' },
  { id: 'seedream',     label: 'Seedream',     emoji: '🌱',  color: '#4ECDC4', domain: 'seedream.ai',           description: 'AI image & video generation model' },
  { id: 'gptimage',     label: 'GPT Image',    emoji: '🖼️', color: '#10A37F', domain: 'openai.com',            description: "OpenAI's AI image generation" },
  { id: 'nanobanana',   label: 'Nano Banana',  emoji: '🍌',  color: '#FFD93D',                               description: 'AI image generation model' },
  // ── Dev / design ─────────────────────────────────────────────────────────
  { id: 'code',         label: 'Custom Code',  emoji: '💻',  color: '#4B9CE2',                               description: 'Hand-written software & scripting' },
  { id: 'figma',        label: 'Figma',        emoji: '🎯',  color: '#F24E1E', domain: 'figma.com',          description: 'Collaborative UI design & prototyping' },
  { id: 'davinci',      label: 'DaVinci Resolve', abbr: 'DV', color: '#FFB400', bg: '#1A1A2E',               description: 'Professional video editing & color grading' },
  { id: 'openclaw',     label: 'OpenClaw',     emoji: '🦎',  color: '#7C3AED', domain: 'openclaw.ai',        description: 'AI agent platform used to build this site' },
  { id: 'supabase',     label: 'Supabase',     emoji: '🔖',  color: '#3ECF8E', domain: 'supabase.com',       description: 'Open source database, auth & storage' },
]

export const TOOL_MAP = Object.fromEntries(TOOLS.map(t => [t.id, t]))
