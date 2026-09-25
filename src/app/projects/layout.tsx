import type { ReactNode } from 'react'
import '../../styles/projects.css'

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <div className="project-pages">{children}</div>
}
