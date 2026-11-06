import { TOOL_MAP, type Tool } from '@/lib/tools'

interface ToolBadgeProps {
  toolId: string
  size?: 'sm' | 'md'
}

export default function ToolBadge({ toolId, size = 'md' }: ToolBadgeProps) {
  const tool: Tool | undefined = TOOL_MAP[toolId]
  const dim = size === 'sm' ? 24 : 32
  const fontSize = size === 'sm' ? 9 : 11

  if (!tool) {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-medium bg-white/10 text-white/60 ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs'}`}>
        {toolId}
      </span>
    )
  }

  if (tool.abbr && tool.bg) {
    // Adobe-style: colored square with abbreviation
    return (
      <span
        title={tool.label}
        className="inline-flex items-center justify-center rounded font-black select-none shrink-0"
        style={{ width: dim, height: dim, backgroundColor: tool.bg, color: tool.color, fontSize, letterSpacing: '-0.5px' }}
      >
        {tool.abbr}
      </span>
    )
  }

  // Emoji + label badge
  return (
    <span
      title={tool.label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium border ${size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs'}`}
      style={{ borderColor: `${tool.color}50`, color: tool.color, backgroundColor: `${tool.color}18` }}
    >
      {tool.emoji && <span>{tool.emoji}</span>}
      <span>{tool.label}</span>
    </span>
  )
}
