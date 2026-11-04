import { inject, getCurrentInstance, onUnmounted } from 'vue'
import type { InjectionKey } from 'vue'
import type { ChildrenContext } from './types'

export function useParent<C extends ChildrenContext<any, any>>(key: InjectionKey<C>) {
  const internalInstance = getCurrentInstance()

  const parent = inject<ChildrenContext<any, any>>(key)

  if (parent?.linkChildren && internalInstance?.proxy) {
    type Child = C extends ChildrenContext<infer T, any> ? T : never
    const child = internalInstance.proxy as Child
    parent.linkChildren(child)

    onUnmounted(() => {
      if (parent.unlinkChildren) {
        parent.unlinkChildren(child)
      }
    })
  }

  return {
    parent,
  }
}
