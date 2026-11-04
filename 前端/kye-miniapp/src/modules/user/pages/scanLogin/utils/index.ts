import type { HttpResponse } from '@/public/utils/types'

export async function unwrap<T = unknown>(resp: Promise<HttpResponse<T>>) {
  return (await resp).data
}

export * from './qr-code'
