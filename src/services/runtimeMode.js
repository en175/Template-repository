const KEY = 'template.useMock'

export function getUseMock() {
  try {
    const v = localStorage.getItem(KEY)
    if (v === null) return true
    return v === '1'
  } catch {
    return true
  }
}

export function setUseMock(v) {
  try {
    localStorage.setItem(KEY, v ? '1' : '0')
  } catch {
    return
  }
}
