import { Marked, type Tokens } from 'marked'

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const SAFE_URL = /^(?:https?:|mailto:)/i

/**
 * A Markdown renderer that is safe to use with `v-html` on untrusted input
 * (model output and task text): raw HTML is escaped, only http(s)/mailto
 * links are allowed, and images are rendered as their alt text.
 */
const marked = new Marked({
  gfm: true,
  breaks: true,
  async: false,
  renderer: {
    html({ text }: Tokens.HTML | Tokens.Tag) {
      return escapeHtml(text)
    },
    link({ href, title, tokens }: Tokens.Link) {
      const label = this.parser.parseInline(tokens)
      if (!SAFE_URL.test(href.trim())) return label
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
      return `<a href="${escapeHtml(href)}"${titleAttr} target="_blank" rel="noopener noreferrer nofollow">${label}</a>`
    },
    image({ text }: Tokens.Image) {
      return escapeHtml(text)
    },
  },
})

export function renderMarkdown(markdown: string): string {
  try {
    return marked.parse(markdown, { async: false }) as string
  } catch {
    return escapeHtml(markdown)
  }
}
