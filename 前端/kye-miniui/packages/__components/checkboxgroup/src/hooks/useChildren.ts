import { ref, getCurrentInstance, provide, type InjectionKey } from 'vue'

export function useChildren<T, Extra extends Record<string, any> = {}>(key: InjectionKey<T>, options?: Extra) {
  const children = ref<T[]>([])
  const internalInstance = getCurrentInstance()

  const linkChildren = (child: T) => {
    children.value.push(child)
  }

  const unlinkChildren = (child: T) => {
    const index = children.value.indexOf(child)
    if (index > -1) {
      children.value.splice(index, 1)
    }
  }

  provide(key, {
    linkChildren,
    unlinkChildren,
    children, // The parent exposes a reactive list of children
    ...options,
  })

  return {
    children,
    linkChildren,
    unlinkChildren,
  }
}
