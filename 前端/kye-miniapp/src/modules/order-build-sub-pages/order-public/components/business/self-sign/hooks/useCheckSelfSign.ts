import useEmit from './useEmit'
import useEffect from '@order-public-sub-public/validate'
import { ModuleType, SelfSignType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
export const useCheckSelfSign = async (value: boolean) => {
  const { remoteCheck } = useEffect()
  const changeValue = value ? SelfSignType.YES : SelfSignType.NO
  // 调用方法更新
  piniaStore.order.updateOrderByType({
    type: ModuleType['本人签收'],
    data: {
      selfSignFlag: changeValue,
    },
  })
  try {
    // 远程校验
    await remoteCheck('selfSign')
    // 发布事件
    useEmit().emitName()
  } catch (error) {
    console.log('error', error)
  }
}
