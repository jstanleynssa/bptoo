'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface HeraldElement {
  id: string
  name: string
  description: string
  stanleyNote: string
  // SVG ellipse in % of image (viewBox 0 0 100 100, preserveAspectRatio none)
  cx: number; cy: number; rx: number; ry: number
  tooltipSide?: 'left' | 'right'
}

const ELEMENTS: HeraldElement[] = [
  {
    id: 'crest',
    name: 'Crest',
    description: 'A crest is a component of a heraldic display, consisting of the device borne on top of the helm. Originally a more decorative sculpture worn by knights in tournaments and battles, crests became widely adopted after the 16th century.',
    stanleyNote: 'The Stanley crest is a plume of the house color, Azure.',
    cx: 50, cy: 21, rx: 5, ry: 5, tooltipSide: 'right',
  },
  {
    id: 'torse',
    name: 'Torse',
    description: 'In heraldry, a torse or wreath is a twisted roll of fabric laid about the top of the helmet and the base of the crest. It has the dual purpose of securing the helm between helm and crest, and of holding the mantling in place.',
    stanleyNote: 'The Stanley torse is a combination of gold and white.',
    cx: 50, cy: 28, rx: 4, ry: 2, tooltipSide: 'right',
  },
  {
    id: 'helm',
    name: 'Helm',
    description: 'In heraldic achievements, the helmet or helm is situated above the shield and bears the torse and crest. The style of helmet employed varies according to rank and social status, and these styles developed over time to mark the development of actual military helmets.',
    stanleyNote: 'The Stanley helm is an argent sallet developed in the 15th century that completely enclosed the head while remaining compact and light. The Stanley helm features hawk wings on the visor hinge.',
    cx: 50, cy: 33, rx: 8, ry: 6, tooltipSide: 'left',
  },
  {
    id: 'mantling',
    name: 'Mantling',
    description: 'In heraldry, mantling or lambrequin is drapery tied to the helmet above the shield. It is a depiction of the protective cloth covering used to stave off the elements and offer protection in battle.',
    stanleyNote: 'The mantling of the Stanley crest is done in the house colors of blue and gold.',
    cx: 50, cy: 43, rx: 20, ry: 10, tooltipSide: 'left',
  },
  {
    id: 'supporter-left',
    name: 'Supporter',
    description: 'In heraldry, supporters are figures or objects usually placed on either side of the shield, often depicted holding it up. They are attendant figures that complete the full heraldic achievement.',
    stanleyNote: 'The Stanley attendants are a pair of hawks — symbols of intelligence, independence, adaptability, clairvoyance, and spiritual awareness.',
    cx: 31, cy: 57, rx: 8, ry: 10, tooltipSide: 'left',
  },
  {
    id: 'supporter-right',
    name: 'Supporter',
    description: 'In heraldry, supporters are figures or objects usually placed on either side of the shield, often depicted holding it up. They are attendant figures that complete the full heraldic achievement.',
    stanleyNote: 'The Stanley attendants are a pair of hawks — symbols of intelligence, independence, adaptability, clairvoyance, and spiritual awareness.',
    cx: 69, cy: 57, rx: 8, ry: 10, tooltipSide: 'right',
  },
  {
    id: 'escutcheon',
    name: 'Escutcheon',
    description: 'In heraldry, an escutcheon is a shield that forms the main or focal element in an achievement or design. The word escutcheon (late 15th century) is based on Old North French escuteon (shield).',
    stanleyNote: 'The Stanley coat of arms is displayed on a heater style shield developed in the late 15th century, evolved from kite shields to be more manageable and versatile.',
    cx: 50, cy: 57, rx: 13, ry: 12, tooltipSide: 'right',
  },
  {
    id: 'field',
    name: 'Field',
    description: 'In heraldry, the background of the shield is called the field. The field is usually composed of one or more tinctures (colors) or metals or furs.',
    stanleyNote: 'The Stanley field is quartered in Azure (blue) and Argent (silver/white).',
    cx: 50, cy: 54, rx: 9, ry: 8, tooltipSide: 'left',
  },
  {
    id: 'charge',
    name: 'Charge',
    description: 'In heraldry, a charge is any emblem or device occupying the field of an escutcheon. It may be a geometric design or symbolic representation of a person, animal, plant, object, or building.',
    stanleyNote: 'Translated from French, fleur de lis means "Flower of the lily" and symbolically represents everlasting love, purity, resilience, freedom, and faith.',
    cx: 50, cy: 57, rx: 5, ry: 5, tooltipSide: 'right',
  },
  {
    id: 'motto',
    name: 'Motto',
    description: 'In heraldry, a motto is often found below the shield on a decorative, flat, ribboned scroll from the Middle Ages. The text variety of mottos possessed a coat of arms to complete the achievement.',
    stanleyNote: 'The Latin phrase Quantum ab eis gradibus victoria means "Success From One Step for All".',
    cx: 50, cy: 69, rx: 17, ry: 3, tooltipSide: 'left',
  },
  {
    id: 'order',
    name: 'Order',
    description: 'An order is a visible honor awarded by a sovereign state, monarch, or dynastic house to a person in recognition of individual merit, often coming with distinctive insignia such as collars, medals, badges, and sashes.',
    stanleyNote: 'The book represents the pursuit of knowledge and understanding as a core value of the Stanley family.',
    cx: 50, cy: 76, rx: 6, ry: 5, tooltipSide: 'right',
  },
  {
    id: 'compartment',
    name: 'Compartment',
    description: 'In heraldry, a compartment is a design placed under the shield — usually rocks, a grassy mound, or some sort of landscape upon which the supporters are depicted as standing.',
    stanleyNote: 'The Tudor Rose is the national emblem of England, a symbol of peace and unity signifying the period of reconciliation following the War of the Roses in the 15th century.',
    cx: 50, cy: 82, rx: 7, ry: 5, tooltipSide: 'left',
  },
]

export function HeraldicAchievement({ imageUrl }: { imageUrl: string }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const hoveredEl = ELEMENTS.find(e => e.id === hovered)

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div ref={containerRef} className="relative select-none not-prose my-8" style={{ fontFamily: 'serif' }}>
      {/* Base image */}
      <Image
        src={imageUrl}
        alt="Stanley Heraldic Achievement"
        width={800}
        height={1200}
        className="w-full h-auto block rounded-xl"
        priority
      />

      {/* SVG hotspot overlay — coordinates in % of image */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
        style={{ cursor: hoveredEl ? 'pointer' : 'default' }}
      >
        {/* Render from largest to smallest so smaller zones (charge) are on top */}
        {[...ELEMENTS].reverse().map(el => (
          <ellipse
            key={el.id}
            cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry}
            fill={hovered === el.id ? 'rgba(250,205,64,0.18)' : 'transparent'}
            stroke={hovered === el.id ? 'rgba(250,205,64,0.7)' : 'transparent'}
            strokeWidth="0.3"
            onMouseEnter={() => setHovered(el.id)}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredEl && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: `${hoveredEl.tooltipSide === 'right' || mousePos.x < 50 ? mousePos.x + 2 : Math.max(2, mousePos.x - 42)}%`,
            top: `${Math.min(85, Math.max(5, mousePos.y - 10))}%`,
            width: '38%',
          }}
        >
          <div
            className="rounded-xl border border-yellow-700/60 shadow-2xl p-4"
            style={{
              background: 'rgba(14, 10, 4, 0.94)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <h3 className="text-base font-bold mb-2" style={{ color: '#FACD40', fontFamily: 'Peralta, serif', letterSpacing: '0.05em' }}>
              {hoveredEl.name}
            </h3>
            <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {hoveredEl.description}
            </p>
            <p className="text-xs leading-relaxed italic" style={{ color: '#7eb8f7' }}>
              {hoveredEl.stanleyNote}
            </p>
          </div>
        </div>
      )}

      {/* Hover hint */}
      {!hovered && (
        <div className="absolute bottom-3 right-4 text-xs rounded-lg px-2 py-1"
          style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.5)' }}>
          Hover over elements to explore
        </div>
      )}
    </div>
  )
}
