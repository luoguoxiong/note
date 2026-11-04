import { computed } from 'vue'
import { ModuleType } from '@order-public-sub-public/constants'
import { KaCustomerMapDimension, KaCustomerMapItemRow, KaCustomerMap } from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

/**
 * 重置条件：
 *    1.有原始数据但无组装数据
 *    2.原始数据和组装数据长度不一致
 *    3.长度一致编码有变化（存在一个不一样的ID）
 *    4.长度编码都一致，是否必填不一致
 */
export const isReset = () => {
  // 组装数据
  const extendKaCustomerMap = computed(() => {
    return piniaStore.extend.kaCustomerMap || []
  })

  // 原始数据
  const kaCustomerMapData = computed(() => {
    return piniaStore.schema.moduleDimensionData(ModuleType['自定义编码'])
  })

  // 无原始数据，则不重置
  if (!kaCustomerMapData.value || !kaCustomerMapData.value.rows) {
    piniaStore.extend.updateKaCustomerMap({ data: [] })
    return false
  }
  // 有原始数据，无组装数据
  if (kaCustomerMapData.value && kaCustomerMapData.value.rows && !extendKaCustomerMap.value.length) {
    return true
  }

  // 长度不一致，重置
  if (kaCustomerMapData.value.rows.length !== extendKaCustomerMap.value?.length) {
    return true
  }

  // 有原始数据&&组装数据 => 对比ID和必填设置是否一致，存在不一致即该配置了，需要重置
  if (kaCustomerMapData.value.rows.length === extendKaCustomerMap.value?.length) {
    const kyFieldObj: { [key: string]: boolean } = {}
    const requiredObj: { [key: string]: boolean } = {}
    const defaultObj = {
      kyFieldObj,
      requiredObj,
    }
    // 构建原始数据ID 和 必填 的映射字典
    const kaCustomerMapDataObj = kaCustomerMapData.value?.rows?.reduce((pre, cur) => {
      pre.kyFieldObj[cur.kyField] = true
      pre.requiredObj[cur.kyField] = cur.requiredStatus
      return pre
    }, defaultObj)
    let isReset = false

    // 循环组装数据，使用映射字典做对比,存在配置不一致 => 重置
    for (let index = 0; index < extendKaCustomerMap.value.length; index++) {
      const item = extendKaCustomerMap.value[index]
      if (
        !kaCustomerMapDataObj.kyFieldObj[item.kyField] ||
        kaCustomerMapDataObj.requiredObj[item.kyField] !== item.requiredStatus
      ) {
        isReset = true
        break
      }
    }
    return isReset
  }
}

export const buildExtendKaMap = (data: KaCustomerMapItemRow[]) => {
  console.log('开始构建自定义编码了')
  const defaultData: KaCustomerMap = []

  // 获取表单缓存数据
  const kaWayBillInfo = computed(() => {
    return piniaStore.order.moduleFormData(ModuleType['自定义编码']) || []
  })
  // 将缓存的值存储为对象， key 为id  value 为 customerFieldValue
  const kaCustomerMapKeyObj =
    kaWayBillInfo.value?.reduce(
      (pev, cur) => {
        pev[cur.kyField] = cur.customerFieldValue
        return pev
      },
      {} as { [key: string]: string },
    ) || {}
  let isRequest = false
  const returnObj = (cur: KaCustomerMapItemRow, customerFieldValue: string) => {
    return {
      customerFieldName: cur.field,
      customerFieldValue: customerFieldValue || '',
      kyField: cur.kyField,
      styleType: cur.styleType,
      optionData: cur.optionData || [],
      requiredStatus: cur.requiredStatus || false,
      isSelectFlag: cur.isSelectFlag || 0,
      customerFieldDetailList: cur.customerFieldDetailList || [],
      editable: cur.editable,
      kaTypeFlagTips: cur.kaTypeFlagTips,
      kaTypeFlag: cur.kaTypeFlag,
    }
  }

  // 构建自定义编码页面数据，如果缓存有值则使用缓存填充
  const extendKaData =
    data?.reduce((pev, cur: KaCustomerMapItemRow) => {
      if (cur.requiredStatus) {
        isRequest = true
      }
      if (cur.styleType === '20' && cur.optionData?.length) {
        const len = kaWayBillInfo.value?.filter((x) => x.kyField === cur.kyField) || []
        if (len.length) {
          len.forEach((item) => {
            pev.push(returnObj(cur, item.customerFieldValue))
          })
        } else {
          pev.push(returnObj(cur, ''))
        }
      } else {
        pev.push(returnObj(cur, kaCustomerMapKeyObj?.[cur.kyField]))
      }
      return pev
    }, defaultData) || []
  piniaStore.extend.updateKaStatus({ data: isRequest })
  piniaStore.extend.updateKaCustomerMap({ data: extendKaData as any })
}

export const initKaCustomerMap = () => {
  console.log('进入了自定义编码方法')
  // const isResetData: boolean = isReset() || false
  const kaCustomerMapData = computed(() => {
    return piniaStore.schema.moduleDimensionData(ModuleType['自定义编码'])
  })
  buildExtendKaMap(kaCustomerMapData?.value?.rows || [])
  console.log('自定义编码重新构建了数据')
}
