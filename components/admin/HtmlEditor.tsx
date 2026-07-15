'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Bold, Code2, Heading2, Italic, Link2, List, ListOrdered, Quote, RemoveFormatting } from 'lucide-react'

type HtmlEditorProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  minHeightClassName?: string
  required?: boolean
}

const allowedTags = new Set([
  'P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'A', 'UL', 'OL', 'LI',
  'H2', 'H3', 'H4', 'BLOCKQUOTE', 'PRE', 'CODE', 'SPAN', 'DIV',
])

const allowedAttributes = new Set(['href', 'target', 'rel'])

export function HtmlEditor({ value, onChange, label, minHeightClassName = 'min-h-48', required = false }: HtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const [sourceMode, setSourceMode] = useState(false)
  const [sourceValue, setSourceValue] = useState(value || '')

  useEffect(() => {
    setSourceValue(value || '')
    if (!sourceMode && editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value, sourceMode])

  function emit(html: string) {
    onChange(sanitizeHtml(html))
  }

  function command(action: string, commandValue?: string) {
    document.execCommand(action, false, commandValue)
    editorRef.current?.focus()
    emit(editorRef.current?.innerHTML || '')
  }

  function addLink() {
    const url = window.prompt('Link URL')
    if (!url) return
    command('createLink', url)
  }

  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-black">{label}{required ? ' *' : ''}</span>}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        <div className="flex flex-wrap gap-1 border-b border-white/10 bg-black/20 p-2">
          <ToolButton label="H2" onClick={() => command('formatBlock', 'h2')} icon={<Heading2 className="h-4 w-4" />} />
          <ToolButton label="Fett" onClick={() => command('bold')} icon={<Bold className="h-4 w-4" />} />
          <ToolButton label="Kursiv" onClick={() => command('italic')} icon={<Italic className="h-4 w-4" />} />
          <ToolButton label="Liste" onClick={() => command('insertUnorderedList')} icon={<List className="h-4 w-4" />} />
          <ToolButton label="Nummerierte Liste" onClick={() => command('insertOrderedList')} icon={<ListOrdered className="h-4 w-4" />} />
          <ToolButton label="Zitat" onClick={() => command('formatBlock', 'blockquote')} icon={<Quote className="h-4 w-4" />} />
          <ToolButton label="Link" onClick={addLink} icon={<Link2 className="h-4 w-4" />} />
          <ToolButton label="Format entfernen" onClick={() => command('removeFormat')} icon={<RemoveFormatting className="h-4 w-4" />} />
          <ToolButton label="HTML" active={sourceMode} onClick={() => setSourceMode((current) => !current)} icon={<Code2 className="h-4 w-4" />} />
        </div>

        {sourceMode ? (
          <textarea
            value={sourceValue}
            onChange={(event) => {
              setSourceValue(event.target.value)
              emit(event.target.value)
            }}
            className={`w-full resize-y bg-slate-950/80 px-4 py-3 font-mono text-sm text-white outline-none ${minHeightClassName}`}
            required={required}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(event) => emit(event.currentTarget.innerHTML)}
            onBlur={(event) => emit(event.currentTarget.innerHTML)}
            className={`prose prose-invert max-w-none overflow-y-auto px-4 py-3 text-sm leading-7 text-white outline-none focus:bg-white/[0.025] ${minHeightClassName}`}
            role="textbox"
            aria-multiline="true"
            aria-label={label || 'HTML Editor'}
          />
        )}
      </div>
    </label>
  )
}

function ToolButton({ label, icon, onClick, active = false }: { label: string; icon: ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-black transition ${
        active ? 'border-accent bg-accent text-black' : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function sanitizeHtml(html: string) {
  if (typeof window === 'undefined') return html
  const template = document.createElement('template')
  template.innerHTML = html

  template.content.querySelectorAll('*').forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes))
      return
    }

    Array.from(element.attributes).forEach((attribute) => {
      if (!allowedAttributes.has(attribute.name.toLowerCase())) {
        element.removeAttribute(attribute.name)
      }
    })

    if (element.tagName === 'A') {
      const href = element.getAttribute('href') || ''
      if (/^\s*javascript:/i.test(href)) element.removeAttribute('href')
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noopener noreferrer')
    }
  })

  return template.innerHTML
}
