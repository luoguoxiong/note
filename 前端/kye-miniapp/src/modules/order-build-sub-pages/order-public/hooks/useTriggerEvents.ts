import { ModuleType } from '@order-public-sub-public/constants/global'
import { PartialModule, TriggEventFunc } from '@order-public-sub-public/types'

import { existRelationMap } from '@order-public-sub-public/configs'

/**
 * @description 跨组件调度hook
 */
export function useTriggerEvents() {
  /**
   * @description 触发关系表中的处理函数
   * @param fromComponentKey 来源，发出方
   * @param value
   */
  const trigger = (fromComponentKey: ModuleType, value: PartialModule) => {
    console.log(`${fromComponentKey} 变化了，value:`, value)

    try {
      const currentTarget = existRelationMap?.[fromComponentKey]
      //如触发更新的value对象无对应key，不做处理
      if (currentTarget?.changeKeys.every((key) => !Reflect.has(value, key))) {
        console.log(
          `来自${fromComponentKey}的触发无效，变化的对象不包含如下key: ${currentTarget?.changeKeys.toString()}`,
        )
        return
      }
      currentTarget?.triggerFunction.forEach((func: TriggEventFunc) => {
        func(value)
      })
    } catch (error) {
      console.log(`${fromComponentKey} 变化触发异常： ${error}`)
    }
  }

  return {
    trigger,
  }
}
