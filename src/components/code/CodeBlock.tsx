'use client'

import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckIcon, CopyIcon } from '@/components/ui/icons'
import { highlightCode } from '@/components/code/highlight-code'
import { cn } from '@/lib'

type CodeBlockProps = {
  code: string
  language?: string
  className?: string
  showLineNumbers?: boolean
}

export function CodeBlock({
  code,
  language = 'typescript',
  className,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const highlighted = useMemo(() => highlightCode(code, language), [code, language])
  const lines = useMemo(() => code.split('\n'), [code])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked */
    }
  }, [code])

  return (
    <div
      className={cn(
        'code-block overflow-hidden rounded-2xl border border-violet-500/20 bg-zinc-950/90 shadow-xl shadow-black/30',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/70 bg-zinc-900/70 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-2.5 rounded-full bg-violet-500/80" aria-hidden />
          <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {language}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void handleCopy()}
          className="!min-h-8 shrink-0 !px-2.5 text-xs text-zinc-300 hover:text-white"
        >
          {copied ? (
            <>
              <CheckIcon className="size-3.5 text-emerald-400" aria-hidden />
              Kopiert
            </>
          ) : (
            <>
              <CopyIcon className="size-3.5" aria-hidden />
              Copy Code
            </>
          )}
        </Button>
      </div>

      <div className="code-block__scroll max-h-[min(70vh,32rem)] overflow-auto">
        <pre className="code-block__pre m-0 p-0 text-[12px] leading-relaxed sm:text-[13px]">
          <code className="block min-w-full">
            {showLineNumbers
              ? lines.map((line, index) => (
                  <div key={`${index}-${line.slice(0, 8)}`} className="code-block__line flex">
                    <span
                      className="code-block__ln select-none px-3 py-0.5 text-right text-zinc-600"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <span
                      className="code-block__content flex-1 whitespace-pre px-3 py-0.5 text-zinc-100"
                      dangerouslySetInnerHTML={{
                        __html: highlightCode(line, language),
                      }}
                    />
                  </div>
                ))
              : (
                  <span
                    className="block whitespace-pre px-4 py-3 text-zinc-100"
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                  />
                )}
          </code>
        </pre>
      </div>
    </div>
  )
}
