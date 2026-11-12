'use client'

import { useState, useEffect, useRef } from 'react'

interface HeraldInfo {
  name: string
  description: string
  stanleyNote: string
}

// Map SVG group IDs → heraldic element info.
// Groups sharing an element (mantling parts, compartment parts) use the same description.
const HERALD_DATA: Record<string, HeraldInfo> = {
  crest: {
    name: 'Crest',
    description: 'A crest is a component of a heraldic display, consisting of the device borne on top of the helm. Originally a more decorative sculpture worn by knights in tournaments and battles, crests became widely adopted after the 16th century.',
    stanleyNote: 'The Stanley crest is a plume of the house color, Azure.',
  },
  torse: {
    name: 'Torse',
    description: 'In heraldry, a torse or wreath is a twisted roll of fabric laid about the top of the helmet and the base of the crest. It has the dual purpose of securing the helm between helm and crest, and of holding the mantling in place.',
    stanleyNote: 'The Stanley torse is a combination of gold and white.',
  },
  helm: {
    name: 'Helm',
    description: 'In heraldic achievements, the helmet or helm is situated above the shield and bears the torse and crest. The style of helmet employed varies according to rank and social status, and these styles developed over time to mark the development of actual military helmets.',
    stanleyNote: 'The Stanley helm is an argent sallet developed in the 15th century that completely enclosed the head while remaining compact and light. It features hawk wings on the visor hinge.',
  },
  mantling_01: {
    name: 'Mantling',
    description: 'In heraldry, mantling or lambrequin is drapery tied to the helmet above the shield. It is a depiction of the protective cloth covering used to stave off the elements and offer protection in battle.',
    stanleyNote: 'The mantling of the Stanley crest is done in the house colors of blue and gold.',
  },
  mantling_03: {
    name: 'Mantling',
    description: 'In heraldry, mantling or lambrequin is drapery tied to the helmet above the shield. It is a depiction of the protective cloth covering used to stave off the elements and offer protection in battle.',
    stanleyNote: 'The mantling of the Stanley crest is done in the house colors of blue and gold.',
  },
  'mantling_03-2': {
    name: 'Mantling',
    description: 'In heraldry, mantling or lambrequin is drapery tied to the helmet above the shield. It is a depiction of the protective cloth covering used to stave off the elements and offer protection in battle.',
    stanleyNote: 'The mantling of the Stanley crest is done in the house colors of blue and gold.',
  },
  supporter: {
    name: 'Supporters',
    description: 'In heraldry, supporters are figures or objects usually placed on either side of the shield, often depicted holding it up. They are attendant figures that complete the full heraldic achievement.',
    stanleyNote: 'The Stanley attendants are a pair of hawks — symbols of intelligence, independence, adaptability, clairvoyance, and spiritual awareness.',
  },
  escutcheon: {
    name: 'Escutcheon',
    description: 'In heraldry, an escutcheon is a shield that forms the main or focal element in an achievement or design. The word escutcheon (late 15th century) is based on Old North French escuteon (shield). The field — the background of the shield — is composed of one or more tinctures or metals.',
    stanleyNote: 'The Stanley coat of arms is displayed on a heater style shield, quartered in Azure (blue) and Argent (silver/white).',
  },
  charge: {
    name: 'Charge',
    description: 'In heraldry, a charge is any emblem or device occupying the field of an escutcheon. It may be a geometric design or symbolic representation of a person, animal, plant, object, or building.',
    stanleyNote: 'Translated from French, fleur de lis means "Flower of the lily" and symbolically represents everlasting love, purity, resilience, freedom, and faith.',
  },
  name: {
    name: 'Name Banner',
    description: 'In heraldry, a scroll or banner bearing the family name is often displayed prominently above or across the top of the shield. This decorative element identifies the family or house to which the coat of arms belongs.',
    stanleyNote: 'The Stanley name has Anglo-Norman origins, derived from "stan" (stone) and "leah" (woodland clearing) — Stone Clearing — rooted in the Staffordshire region of England.',
  },
  motto: {
    name: 'Motto',
    description: 'In heraldry, a motto is often found below the shield on a decorative, flat, ribboned scroll. The text variety of mottos possessed a coat of arms to complete the full achievement.',
    stanleyNote: 'The Latin phrase Quantum ab eis gradibus victoria means "Success From One Step for All".',
  },
  order: {
    name: 'Order',
    description: 'An order is a visible honor awarded by a sovereign state, monarch, or dynastic house to a person in recognition of individual merit, often coming with distinctive insignia such as collars, medals, badges, and sashes.',
    stanleyNote: 'The book represents the pursuit of knowledge and understanding as a core value of the Stanley family.',
  },
  compartment_01: {
    name: 'Compartment',
    description: 'In heraldry, a compartment is a design placed under the shield — usually rocks, a grassy mound, or some sort of landscape upon which the supporters are depicted as standing.',
    stanleyNote: 'The Tudor Rose is the national emblem of England, a symbol of peace and unity signifying the period of reconciliation following the War of the Roses in the 15th century.',
  },
  compartment_02: {
    name: 'Compartment',
    description: 'In heraldry, a compartment is a design placed under the shield — usually rocks, a grassy mound, or some sort of landscape upon which the supporters are depicted as standing.',
    stanleyNote: 'The Tudor Rose is the national emblem of England, a symbol of peace and unity signifying the period of reconciliation following the War of the Roses in the 15th century.',
  },
}

const INTERACTIVE_IDS = Object.keys(HERALD_DATA)

function processSvg(svgText: string): string {
  // Add data-heraldic-id attribute and class to each interactive group
  return svgText.replace(/<g id="([^"]+)"/g, (match, id) => {
    if (INTERACTIVE_IDS.includes(id)) {
      return `<g id="${id}" data-heraldic-id="${id}" class="heraldic-zone"`
    }
    return match
  })
}

export function HeraldicAchievementSVG({ svgUrl }: { svgUrl: string }) {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(svgUrl)
      .then(r => r.text())
      .then(text => setSvgContent(processSvg(text)))
      .catch(console.error)
  }, [svgUrl])

  const hoveredInfo = hovered ? HERALD_DATA[hovered] : null

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    // Find the nearest heraldic zone
    const zone = (e.target as Element).closest('[data-heraldic-id]')
    setHovered(zone?.getAttribute('data-heraldic-id') ?? null)
  }

  function handleMouseLeave() { setHovered(null) }

  if (!svgContent) {
    return (
      <div className="my-8 flex items-center justify-center py-20 rounded-xl bg-white/5">
        <span className="text-white/40 text-sm">Loading…</span>
      </div>
    )
  }

  // Tooltip placement: keep it on screen
  const tipX = mousePos.x > 60 ? mousePos.x - 280 : mousePos.x + 20
  const tipY = Math.max(10, mousePos.y - 80)

  return (
    <div className="relative my-8 not-prose select-none" ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Global CSS for heraldic hover glow */}
      <style>{`
        .heraldic-zone {
          cursor: pointer;
          transition: filter 0.2s ease;
        }
        .heraldic-zone:hover {
          filter:
            drop-shadow(0 0 6px rgba(250, 205, 64, 1))
            drop-shadow(0 0 18px rgba(250, 205, 64, 0.55))
            drop-shadow(0 0 35px rgba(250, 205, 64, 0.2))
            brightness(1.08);
        }
        @keyframes heraldic-pop {
          0%   { transform: scale(0.6); opacity: 0; }
          55%  { transform: scale(1.07); opacity: 1; }
          75%  { transform: scale(0.96); }
          90%  { transform: scale(1.02); }
          100% { transform: scale(1);    opacity: 1; }
        }
        .heraldic-tooltip {
          animation: heraldic-pop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: bottom left;
        }
      `}</style>

      {/* Inline SVG */}
      <div
        className="w-full"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{ lineHeight: 0 }}
      />

      {/* Tooltip */}
      {hoveredInfo && (
        <div
          className="absolute z-50 pointer-events-none w-64 rounded-xl border border-yellow-700/60 shadow-2xl p-4 heraldic-tooltip"
          style={{
            left: tipX,
            top: tipY,
            background: 'rgba(10, 7, 2, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h3 className="text-sm font-bold mb-1.5" style={{ color: '#FACD40', fontFamily: 'Peralta, serif', letterSpacing: '0.06em' }}>
            {hoveredInfo.name}
          </h3>
          <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.72)' }}>
            {hoveredInfo.description}
          </p>
          <p className="text-xs leading-relaxed italic" style={{ color: '#7eb8f7' }}>
            {hoveredInfo.stanleyNote}
          </p>
        </div>
      )}

      {/* Hint when nothing hovered */}
      {!hovered && (
        <div className="absolute bottom-3 right-3 text-xs rounded-lg px-2 py-1"
          style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.4)' }}>
          Hover to explore
        </div>
      )}
    </div>
  )
}
