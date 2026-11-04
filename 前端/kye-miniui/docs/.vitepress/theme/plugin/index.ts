import fs from 'fs'
import path from 'path'
import type MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token'

export function localComponentPreview(md: MarkdownIt) {
  const defaultHtmlInline = md.renderer.rules.html_inline
  const defaultHtmlBlock = md.renderer.rules.html_block

  function renderDemoPreview(content: string, env: any) {
    const match = content.match(/<code-preview\s+path=["'](.+?)["']\s*(title=["'](.*?)["'])?\s*(description=["'](.*?)["'])?\s*\/?>/)
    if (!match) return content

    const demoPath = match[1]
    const title = match[3] || ''
    const description = match[5] || ''

    const mdDir = env?.filePath ? path.dirname(env.filePath) : process.cwd()
    const filePath = path.resolve(mdDir, demoPath)

    let code = ''
    try {
      code = fs.readFileSync(filePath, 'utf-8')
    } catch {
      code = `vue 文件不存在: ${filePath}`
    }

    const highlighted = md.options.highlight ? md.options.highlight(code, 'vue', '') : code

    // 返回 Vue 组件形式，带折叠 + 复制按钮
    const encodedCode = encodeURIComponent(code)
    const encodedHighlighted = encodeURIComponent(highlighted)

    return `
<DemoPreview
  title="${title}"
  description="${description}"
  code="${encodedCode}"
  highlighted="${encodedHighlighted}"
/>
`
  }

  md.renderer.rules.html_inline = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    if (token.content.includes('<code-preview')) {
      return renderDemoPreview(token.content, env)
    }
    return defaultHtmlInline ? defaultHtmlInline(tokens, idx, options, env, self) : token.content
  }

  md.renderer.rules.html_block = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    if (token.content.includes('<code-preview')) {
      return renderDemoPreview(token.content, env)
    }
    return defaultHtmlBlock ? defaultHtmlBlock(tokens, idx, options, env, self) : token.content
  }
}

