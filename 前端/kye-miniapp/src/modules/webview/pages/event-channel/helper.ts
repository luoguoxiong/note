import { urlContact, uuid } from '@/public/utils'
import { EventBus, EventHandler } from './emit'
import kyeNavigate from '@/public/utils/native/navigate'

const eventChannel: Record<string, EventBus> = {}

export type CreateEventChannelPayload = {
  url: string
  query?: string
  handlers?: Record<string, EventHandler>
}

export function createEventChannel(payload: CreateEventChannelPayload) {
  const channelId = uuid()

  eventChannel[channelId] = new EventBus()

  Object.entries(payload.handlers || {}).forEach(([key, handler]) => {
    eventChannel[channelId].on(key, handler)
  })

  eventChannel[channelId].once('__destroy__', () => {
    eventChannel[channelId].emit('destroy')

    eventChannel[channelId].clear()
    delete eventChannel[channelId]
  })
  const common = { channelId, url: payload.url }

  const webviewUrl = urlContact(
    '/modules/webview/pages/event-channel/index',
    payload.query ? { ...common, query: payload.query } : common,
  )

  kyeNavigate.navigateTo({
    ...payload,
    url: webviewUrl,
  })
}

export function getEventChannel(channelId: string) {
  return eventChannel[channelId]
}
