import s from './ProjectHero.module.css'

type Props = {
  company: string
  period: string
  title: string
  intro: string
  details: readonly (readonly [string, string])[]
}

export function ProjectHero({ company, period, title, intro, details }: Props) {
  return <header className={s.hero}>
    <div className={s.identity}><span>{company}</span><span>{period}</span></div>
    <div className={s.grid}>
      <div className={s.story}><h1>{title}</h1><p>{intro}</p></div>
      <dl className={s.details}>{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </div>
  </header>
}
