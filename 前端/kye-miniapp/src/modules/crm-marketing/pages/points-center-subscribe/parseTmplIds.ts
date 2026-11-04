/** 外部传入订阅模板 ID 的 query 键名（任填其一） */
const QUERY_KEYS = ['tmplIds', 'tmplId', 'templateIds', 'subscribeTmplIds'] as const

/**
 * 从页面 onLoad 的 query 中解析模板 ID（多个用英文逗号分隔），支持 URL 编码。
 */
export function parseTmplIdsFromQuery(query: Record<string, string | undefined>) {
  const out: string[] = []

  for (const key of QUERY_KEYS) {
    const raw = query[key]
    if (raw == null || raw === '') continue

    let decoded = raw
    try {
      decoded = decodeURIComponent(raw)
    } catch {
      decoded = raw
    }

    const trimmed = decoded.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('[')) {
      try {
        const arr = JSON.parse(trimmed) as unknown
        if (Array.isArray(arr)) {
          arr.forEach((id) => {
            const s = String(id).trim()
            if (s) out.push(s)
          })
          if (out.length) return out
        }
      } catch {
        // 非 JSON 则按逗号拆
      }
    }

    trimmed.split(',').forEach((s) => {
      const id = s.trim()
      if (id) out.push(id)
    })

    if (out.length) return out
  }

  return out
}
