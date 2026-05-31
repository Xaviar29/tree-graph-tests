// Deterministic seeded PRNG (Mulberry32)
export function createRng(seed: number) {
  let s = seed | 0
  return {
    next(): number {
      s = (s + 0x6d2b79f5) | 0
      let t = Math.imul(s ^ (s >>> 15), 1 | s)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
    range(min: number, max: number): number {
      return min + this.next() * (max - min)
    },
    int(min: number, max: number): number {
      return Math.round(this.range(min, max))
    },
    pick<T>(arr: T[]): T {
      return arr[Math.floor(this.next() * arr.length)]
    },
  }
}

// Deterministic daily seed based on date
export function dailySeed(suffix = ''): number {
  const d = new Date()
  const day = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
  let hash = 0
  for (const ch of day + suffix) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0
  return hash
}
