import { getGridProjects } from '@/lib/projects'
import { HomeClient } from '@/components/HomeClient'

// Server component — fetches project metadata at build time
export default function HomePage() {
  const projects = getGridProjects()
  return <HomeClient projects={projects} />
}
