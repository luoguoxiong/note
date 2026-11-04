import type { Directive } from 'vue'

export const exposure: Directive = {
  mounted(el, binding, vnode) {
    const props = vnode.props || {}
    const exposureReport = props['exposure-report'] || props['exposureReport']
    // ⭐ 把数据缓存到 DOM 节点上
    el['exposure-report'] = exposureReport
  },
}
