import type { ObjectDirective, DirectiveBinding } from 'vue'
import { ModuleType } from '@order-public-sub-public/constants'

interface vHotZoneOptions {
  moduleType: ModuleType
  visible: boolean
  validateCallback: () => void
  customerCallback?: () => void
  zIndex?: string
}

const createHotZone = (el: HTMLElement) => {
  el.style.position = 'relative'

  const overlayElement = document.createElement('div')
  overlayElement.className = `hot-zone`
  overlayElement.style.position = 'absolute'
  overlayElement.style.top = '0'
  overlayElement.style.bottom = '0'
  overlayElement.style.left = '0'
  overlayElement.style.right = '0'

  el?.appendChild(overlayElement)
}

const visibleHotZone = (el: HTMLElement, binding: DirectiveBinding<vHotZoneOptions>) => {
  const {
    value: { zIndex = '10', visible, validateCallback, customerCallback },
  } = binding

  const hotZone = el.querySelector('.hot-zone') as HTMLDivElement

  if (hotZone) {
    hotZone.style.zIndex = zIndex
    hotZone.style.visibility = !visible ? 'visible' : 'hidden'
    hotZone.onclick = (event: Event) => {
      !visible && event?.stopPropagation()
      validateCallback && validateCallback()
      customerCallback && customerCallback()
    }
  }
}

const vHotZone: ObjectDirective<HTMLElement, vHotZoneOptions> = {
  mounted(el, binding) {
    createHotZone(el)
    visibleHotZone(el, binding)
  },

  updated(el, binding) {
    visibleHotZone(el, binding)
  },
}

export default vHotZone
