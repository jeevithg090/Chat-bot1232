import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../utils/markdown'

describe('renderMarkdown', () => {
  it('renders basic markdown', () => {
    const html = renderMarkdown('**bold** and a list:\n\n1. one\n2. ~~two~~')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<ol>')
    expect(html).toContain('<del>two</del>')
  })

  it('escapes raw HTML', () => {
    const html = renderMarkdown('<img src=x onerror="alert(1)"> <script>alert(1)</script>')
    expect(html).not.toMatch(/<img|<script/i)
    expect(html).toContain('&lt;script&gt;')
  })

  it('escapes inline HTML tags', () => {
    expect(renderMarkdown('hello <b onmouseover="x()">there</b>')).not.toContain('<b ')
  })

  it('keeps safe links and opens them in a new tab', () => {
    const html = renderMarkdown('[GitHub](https://github.com/sumirseth)')
    expect(html).toContain('href="https://github.com/sumirseth"')
    expect(html).toContain('rel="noopener noreferrer nofollow"')
  })

  it('strips javascript: and data: links', () => {
    for (const url of [
      'javascript:alert(1)',
      'data:text/html,<script>x</script>',
      'JaVaScRiPt:alert(1)',
    ]) {
      const html = renderMarkdown(`[click](${url})`)
      expect(html).not.toContain('href')
      expect(html).toContain('click')
    }
  })

  it('renders images as their alt text only', () => {
    const html = renderMarkdown('![a cat](https://example.com/cat.png)')
    expect(html).not.toContain('<img')
    expect(html).toContain('a cat')
  })
})
