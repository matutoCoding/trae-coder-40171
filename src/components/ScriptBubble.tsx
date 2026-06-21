import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ScriptBubbleProps {
  script: string
}

export default function ScriptBubble({ script }: ScriptBubbleProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = script
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="relative rounded-xl bg-blue-50 p-3.5 pr-12">
      <div className="absolute left-3.5 top-0 h-3 w-3 -translate-y-1/2 rotate-45 bg-blue-50" />
      <p className="text-xs leading-relaxed text-blue-800">{script}</p>
      <button
        onClick={handleCopy}
        className={`absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
          copied
            ? 'bg-emerald-100 text-emerald-600'
            : 'bg-white/60 text-blue-400 hover:bg-white hover:text-blue-600'
        }`}
        title="复制话术"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
