import katex from "katex"

/**
 * 行内公式渲染。把 KaTeX 字符串渲染成 HTML。
 * 用法：<Math tex="x > b" /> 或在富文本里用 <Math> 包裹片段。
 */
export function Math({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: display,
  })
  return (
    <span
      className="katex-host"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
