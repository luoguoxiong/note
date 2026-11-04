import { getQueryObject } from '@order-public-sub-public/utils'
import { localStorage } from '@order-public-sub-public/utils/storage'

export const getSessionIdLog = () => {
  const sessionId = getQueryObject()?.sessionId_log || localStorage?.getItem('sessionId_log')
  return sessionId || ''
}
