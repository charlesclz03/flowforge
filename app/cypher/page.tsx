import { redirect } from 'next/navigation'

export default function CypherPage() {
  redirect('/difficultyselection?mode=cypher&advanced=true')
}
