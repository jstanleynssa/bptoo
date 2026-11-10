import GotGame from './GotGame'
import { GOT_CHARACTERS } from '@/data/got-characters'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Faces of A Game of Thrones — Who Is This?',
  description: 'Can you identify all 49 characters from Jason Stanley\'s Faces of A Game of Thrones companion?',
}

export default function GotGamePage() {
  return <GotGame characters={GOT_CHARACTERS} />
}
