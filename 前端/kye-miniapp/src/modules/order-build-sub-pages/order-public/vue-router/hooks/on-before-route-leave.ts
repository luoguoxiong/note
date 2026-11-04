import { getCurrentPage } from '@tarojs/runtime'
type LeaveGuard = (to: any, from: any, next: () => void) => void

export function onBeforeRouteLeave(guard: LeaveGuard) {
  const pageInstance = getCurrentPage()
  console.log(guard)

  return pageInstance
}
