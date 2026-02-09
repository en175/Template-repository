const STATUS = [
  { value: 'draft', label: '草稿', tagType: 'info' },
  { value: 'review', label: '待审核', tagType: 'warning' },
  { value: 'done', label: '已生效', tagType: 'success' }
]

export function getStatusMeta(value) {
  return STATUS.find((s) => s.value === value) || { value, label: value, tagType: 'info' }
}

export function listStatuses() {
  return STATUS.slice()
}

export function createMockRecords() {
  const now = Date.now()
  return Array.from({ length: 37 }).map((_, idx) => {
    const id = String(1000 + idx)
    const status = idx % 3 === 0 ? 'draft' : idx % 3 === 1 ? 'review' : 'done'
    return {
      id,
      title: `示例记录 ${id}`,
      owner: idx % 2 === 0 ? '张三' : '李四',
      amount: Math.round((Math.random() * 9000 + 1000) * 100) / 100,
      status,
      updatedAt: new Date(now - idx * 86400000).toISOString()
    }
  })
}
