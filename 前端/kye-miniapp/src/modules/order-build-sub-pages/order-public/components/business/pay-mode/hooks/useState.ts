import { popVisible } from './state'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const usePopVisible = () => {
  const setPopVisible = (value: boolean) => {
    popVisible.value = value
  }

  return { popVisible, setPopVisible }
}

export const setPayModeDisabled = (value: boolean) => {
  piniaStore.globalData.setDynamicConfigItem({
    configItem: {
      key: 'payMode',
      value: {
        visible: true,
        disabled: value,
        required: true,
      },
    },
  })
}
