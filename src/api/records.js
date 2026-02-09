import { createMockRecords } from '../data/mockRecords'
import { getUseMock } from '../services/runtimeMode'
import { requestJson } from '../services/http'

let mockDb = createMockRecords()

export async function fetchRecords({ keyword, status, page = 1, pageSize = 10 } = {}) {
  if (!getUseMock()) {
    return requestJson('/api/records', { query: { keyword, status, page, pageSize } })
  }

  await sleep(240)
  let rows = mockDb.slice()
  if (keyword) {
    const kw = String(keyword).trim()
    rows = rows.filter((r) => r.title.includes(kw) || r.id.includes(kw) || r.owner.includes(kw))
  }
  if (status) rows = rows.filter((r) => r.status === status)
  const total = rows.length
  const start = (page - 1) * pageSize
  const list = rows.slice(start, start + pageSize)
  return { list, total }
}

export async function fetchRecordDetail(id) {
  if (!getUseMock()) {
    return requestJson(`/api/records/${encodeURIComponent(id)}`)
  }

  await sleep(180)
  const row = mockDb.find((r) => r.id === id)
  if (!row) throw new Error('记录不存在')
  return row
}

export async function upsertRecord(payload) {
  if (!getUseMock()) {
    return requestJson('/api/records', { method: 'POST', body: payload })
  }

  await sleep(300)
  if (!payload || !payload.title) throw new Error('标题不能为空')

  const now = new Date().toISOString()
  if (payload.id) {
    mockDb = mockDb.map((r) => (r.id === payload.id ? { ...r, ...payload, updatedAt: now } : r))
    return { ok: true, id: payload.id }
  }

  const id = String(1000 + mockDb.length + 1)
  mockDb = [{ ...payload, id, updatedAt: now }, ...mockDb]
  return { ok: true, id }
}

export async function deleteRecord(id) {
  if (!getUseMock()) {
    return requestJson(`/api/records/${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  await sleep(240)
  mockDb = mockDb.filter((r) => r.id !== id)
  return { ok: true }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
