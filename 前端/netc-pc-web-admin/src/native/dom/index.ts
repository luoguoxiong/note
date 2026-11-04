import { Any } from '@/types'

export const querySelector = (selectors: Any) => {
  return !!document.querySelector(selectors)
}

export const querySelectorAll = (selectors: Any) => {
  return !!document.querySelectorAll(selectors)
}
