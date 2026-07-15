type SplitTitleProps = {
  title: string
  accentWords?: number
  className?: string
  accentClassName?: string
  baseClassName?: string
}

export function SplitTitle({
  title,
  accentWords = 1,
  className = '',
  accentClassName = 'text-accent',
  baseClassName = 'text-foreground dark:text-white',
}: SplitTitleProps) {
  const words = title.trim().split(/\s+/).filter(Boolean)
  const accentCount = Math.max(1, Math.min(accentWords, words.length))
  const baseWords = words.slice(0, Math.max(0, words.length - accentCount)).join(' ')
  const accentText = words.slice(words.length - accentCount).join(' ')

  return (
    <span className={className}>
      {baseWords && <span className={baseClassName}>{baseWords} </span>}
      <span className={accentClassName}>{accentText}</span>
    </span>
  )
}

