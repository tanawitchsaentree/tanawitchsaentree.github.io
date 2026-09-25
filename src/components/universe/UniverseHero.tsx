import { allianzMeta } from '@/data/universes/allianz-meta'
import { BackButton } from '@/components/universe/BackButton'
import { ProjectHero } from '@/components/case-study/ProjectHero'

export function UniverseHero() {
  return <div className="allianz-opening">
    <BackButton />
    <ProjectHero company={allianzMeta.company} period={allianzMeta.year}
      title="AI document workflows" intro={allianzMeta.summary}
      details={[["Role", "Senior Designer"], ["Ownership", "Sole designer on the project"], ["Scope", "Configuration and operator workflows"]]} />
  </div>
}
