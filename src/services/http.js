export async function requestJson(url, { method = 'GET', query, body, headers } = {}) {
  const fullUrl = new URL(url, window.location.origin)
  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      fullUrl.searchParams.set(k, String(v))
    })
  }

  const res = await fetch(fullUrl.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  })

  const text = await res.text()
  const data = text ? safeJsonParse(text) : null

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `请求失败（${res.status}）`
    const err = new Error(message)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s)
  } catch {
    return { raw: s }
  }
}
