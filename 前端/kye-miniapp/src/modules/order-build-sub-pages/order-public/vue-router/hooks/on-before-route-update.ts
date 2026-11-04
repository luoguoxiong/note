import { getCurrentPage } from "@tarojs/runtime"

type UpdateGuard = (to: any, from: any) => void

export function onBeforeRouteUpdate(guard: UpdateGuard) {
  const pageInstance = getCurrentPage()
  console.log(guard)
  
  if (!pageInstance) {
    console.warn('无法注册 onBeforeRouteUpdate：不在页面上下文中')
    return
  }
}