/** Lightweight syntax highlighting for admin code preview (no external deps). */

type TokenType = 'keyword' | 'string' | 'comment' | 'tag' | 'attr' | 'plain'

const KEYWORDS = new Set([
  'const',
  'let',
  'var',
  'function',
  'return',
  'import',
  'export',
  'from',
  'default',
  'async',
  'await',
  'if',
  'else',
  'for',
  'while',
  'switch',
  'case',
  'break',
  'continue',
  'try',
  'catch',
  'throw',
  'new',
  'class',
  'extends',
  'implements',
  'interface',
  'type',
  'enum',
  'public',
  'private',
  'protected',
  'static',
  'readonly',
  'void',
  'null',
  'undefined',
  'true',
  'false',
  'SELECT',
  'FROM',
  'WHERE',
  'INSERT',
  'INTO',
  'VALUES',
  'CREATE',
  'TABLE',
  'ALTER',
  'INDEX',
  'PRIMARY',
  'KEY',
  'REFERENCES',
  'NOT',
  'NULL',
  'DEFAULT',
  'BOOLEAN',
  'TEXT',
  'UUID',
  'TIMESTAMPTZ',
])

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function wrap(type: TokenType, text: string): string {
  return `<span class="code-token code-token--${type}">${escapeHtml(text)}</span>`
}

function highlightLine(line: string, language: string): string {
  const lang = language.toLowerCase()

  if (/^\s*\/\//.test(line) || /^\s*--/.test(line)) {
    return wrap('comment', line)
  }

  if (/^\s*\/\*/.test(line) || /^\s*\*/.test(line)) {
    return wrap('comment', line)
  }

  if (lang === 'html' || lang.includes('html')) {
    return line.replace(
      /(&lt;\/?)([\w-]+)([^&]*?)(&gt;?)/g,
      (_, open, tag, rest, close) => {
        const attrs = rest.replace(
          /([\w-]+)(=)("([^"]*"|'[^']*'))/g,
          (_m: string, name: string, eq: string, value: string) =>
            `${wrap('attr', name)}${eq}${wrap('string', value)}`,
        )
        return `${wrap('tag', open)}${wrap('tag', tag)}${attrs}${wrap('tag', close || '')}`
      },
    )
  }

  let result = ''
  let i = 0

  while (i < line.length) {
    const rest = line.slice(i)

    const strMatch = rest.match(/^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/)
    if (strMatch) {
      result += wrap('string', strMatch[0])
      i += strMatch[0].length
      continue
    }

    const wordMatch = rest.match(/^[\w$]+/)
    if (wordMatch) {
      const word = wordMatch[0]
      result += KEYWORDS.has(word) ? wrap('keyword', word) : escapeHtml(word)
      i += word.length
      continue
    }

    result += escapeHtml(rest[0])
    i += 1
  }

  return result
}

export function highlightCode(source: string, language = 'typescript'): string {
  return source
    .split('\n')
    .map((line) => highlightLine(line, language))
    .join('\n')
}
