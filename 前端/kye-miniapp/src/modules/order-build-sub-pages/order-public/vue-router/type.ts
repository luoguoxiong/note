// src/router/types.ts

export interface RouteQuery {
  [key: string]: string | number | boolean | undefined | null
}

export interface RouteParams {
  [key: string]: string | number | boolean | undefined | null
}

export interface RouteLocationNormalized {
  path: string
  name?: string
  query: RouteQuery
  params: RouteParams
  fullPath: string
  meta: Record<string, any>
}