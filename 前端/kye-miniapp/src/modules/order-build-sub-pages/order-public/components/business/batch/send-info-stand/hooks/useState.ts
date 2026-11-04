import { unifiedInfoSwitcher } from './state'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const useUnifiedInfoSwitcher = () => {
  const setUnifiedInfoSwitcher = (value: boolean) => {
    unifiedInfoSwitcher.value = value
    piniaStore.order.setUnifiedInfoSwitcher({ data: value })
  }

  return { unifiedInfoSwitcher, setUnifiedInfoSwitcher }
}
