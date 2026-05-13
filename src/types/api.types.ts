export interface ApiResponse<T> {
  success: boolean
  data: T | null
  meta: {
    cachedAt: string
    source: string
    ttlMs: number
  }
  error?: {
    code: string
    message: string
  }
}
