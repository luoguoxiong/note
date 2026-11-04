import { RelationMap, ValidationMap } from '@order-public-sub-public/types'
import { reactive } from 'vue'
import { forIn } from 'lodash-es'
import { GLOBAL_CONFIG_MAP } from './globalRelationMap'
import { ModuleType } from '@order-public-sub-public/constants'
import { moduleSq } from './moduleSq'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

/**
 * @description 初始化跨组件关系
 */
const initRelation = () => {
  const relationMap: RelationMap = {}
  forIn(GLOBAL_CONFIG_MAP, (value, key) => {
    relationMap[key] = value.relation
  })
  return relationMap
}

/**
 * @description 初始化校验关系
 */
const initValidation = () => {
  const validationMap: ValidationMap = {}
  forIn(GLOBAL_CONFIG_MAP, (value, key) => {
    validationMap[key] = value.validation
  })
  return validationMap
}

//组件依赖关系表
export const relationMap = initRelation()

//组件校验函数表
export const validationMap = initValidation()

//实际组件依赖关系表
export const existRelationMap = reactive<RelationMap>({})

//实际组件校验函数表
export const existValidationMap = reactive<ValidationMap>({})

//批量组件校验函数表

export const batchExistValidationMap = reactive<ValidationMap>({})

/**
 * @description 处理实际存在的key
 * @param key
 */
export const addKeyInExistMap = (key: ModuleType) => {
  if (!GLOBAL_CONFIG_MAP[key]) {
    return
  }
  existRelationMap[key] = GLOBAL_CONFIG_MAP[key].relation
  existValidationMap[key] = GLOBAL_CONFIG_MAP[key].validation

  existRelationMap[ModuleType['预估运费']] = GLOBAL_CONFIG_MAP[ModuleType['预估运费']].relation
  existValidationMap[ModuleType['预估运费']] = GLOBAL_CONFIG_MAP[ModuleType['预估运费']].validation

  window.existRelationMap = { ...window.existRelationMap, ...existRelationMap }
  window.existValidationMap = { ...window.existValidationMap, ...existValidationMap }
}

export const setComponentListAndMap = (list: string[]) => {
  const fixSortList = fixSortComponentList(list)
  piniaStore.globalData.setComponentList({ key: fixSortList })
  piniaStore.globalData.setComponentsMap({ map: existRelationMap })
}

/**
 * 基于moduleSq 排序，如果不存在则在原位置不动
 * @param list
 * @returns
 */
const fixSortComponentList = (list: string[]) => {
  list.sort((a, b) => {
    // 检查 a和b是否在obj中
    const valueA = moduleSq[a as keyof typeof moduleSq]
    const valueB = moduleSq[b as keyof typeof moduleSq]

    // 如果a不在obj中，那么它应该排在b之后（保持原位）
    if (valueA === undefined) {
      return 1
    }

    // 如果b不在obj中，那么它应该排在a之后（保持原位）
    if (valueB === undefined) {
      return -1
    }

    // 如果a和b都在obj中，则按值排序
    return valueA - valueB
  })
  return list
}

/**
 * @description 重置关系表
 */
export const resetExistMap = () => {
  for (const key in existRelationMap) {
    delete existRelationMap[key]
  }

  for (const key in existValidationMap) {
    delete existValidationMap[key]
  }

  piniaStore.globalData.resetComponentList(undefined)
  piniaStore.globalData.resetEventsMap(undefined)
  piniaStore.globalData.resetComponentsMap(undefined)

  window.existRelationMap = {}
  window.existValidationMap = {}
}

/**
 * @description 处理实批量组件对应的函数表
 * @param key
 */
export const addBatchExistValidationMap = (key: ModuleType) => {
  const validation = GLOBAL_CONFIG_MAP[key]?.validation
  if (typeof validation !== 'function') {
    return
  }
  batchExistValidationMap[key] = validation
}
