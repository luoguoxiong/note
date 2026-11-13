/**
 * Vue 适配的 useRemoteComponent:远程组件样式隔离
 *
 * 核心层只负责跨沙箱取回组件,但组件样式经沙箱改写后带 `.micro-module-xxx`
 * 前缀,渲染在宿主普通 DOM 里无法命中。取回后自动包裹同名隔离容器,
 * 与路由注入场景(wrapRoutesWithScope)保持同一套隔离方案。
 */
import { defineComponent, h, shallowRef, type Component } from 'vue'

/** 核心层 useRemoteComponent 的函数签名(主应用/子应用入口各注入一份实现) */
type CoreUseRemoteComponent = <T = unknown>(opts: {
  name: string
  component: string
}) => Promise<T>

/** Vue 适配版 useRemoteComponent 的选项 */
export type UseRemoteComponentOptions = {
  /** 子应用名(registerSubApp 时的 name) */
  name: string
  /** 组件名(components 映射的 key) */
  component: string
  /**
   * 是否包裹隔离容器(默认 true)。目标子应用 cssSandbox: false 时可传 false
   */
  scopedCSS?: boolean
}

/**
 * 由核心层实现创建 Vue 版 useRemoteComponent。
 * 主应用入口注入核心层主入口实现;子应用入口注入核心层 ./sub-app 实现
 * (避免子应用 bundle 拉进 loader/sandbox)。
 */
export function createVueUseRemoteComponent(
  core: CoreUseRemoteComponent,
): <T = unknown>(opts: UseRemoteComponentOptions) => Promise<T> {
  return async function useRemoteComponent<T = unknown>(
    opts: UseRemoteComponentOptions,
  ): Promise<T> {
    const { name, component, scopedCSS = true } = opts
    const inner = await core<T>({ name, component })
    if (!scopedCSS || !inner || typeof inner !== 'object') return inner
    return wrapWithScopeContainer(inner as Component, name) as T
  }
}

/**
 * 包裹远程组件:渲染在 micro-module-remote.micro-module-xxx 容器内。
 * attrs 全量透传给内层组件,插槽原样转发;expose 经 Proxy 透传内层
 * defineExpose 的属性(模板 ref 命中包装组件时宿主仍能读到内层实例)。
 * 标签为带连字符的自定义标签,样式前缀只走 class 命中,隔离不受影响。
 */
function wrapWithScopeContainer(inner: Component, appName: string): Component {
  return defineComponent({
    name: 'MicroModuleRemoteScope',
    inheritAttrs: false,
    setup(_, { attrs, slots, expose }) {
      // 内层组件实例(expose 经此透传)
      const innerRef = shallowRef<Record<PropertyKey, unknown> | undefined>()
      expose(
        new Proxy({} as Record<PropertyKey, unknown>, {
          get: (_, key) => innerRef.value?.[key],
          has: (_, key) => (innerRef.value ? key in innerRef.value : false),
        }),
      )
      // 注意:元素型 vnode 的 children 必须为数组
      // (slots 对象形式仅对组件 vnode 有效,元素会渲染为空)
      return () =>
        h(
          'micro-module-remote',
          {
            class: `micro-module-${appName}`,
            'data-micro-app': appName,
          },
          [h(inner, { ...attrs, ref: innerRef }, slots)],
        )
    },
  })
}
