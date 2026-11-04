import { computed } from 'vue'
import localValidateField from '@order-public-sub-public/validate/localValidateField'
import {
  localCheckResult,
  ProductInfoConfig,
  ChangeKeys,
  ProductInfo,
  GoodsSize,
  Module,
} from '@order-public-sub-public/types'
import validateRules from '../config/validateRules'
import {
  goodsType,
  productCode,
  preWaybillGoodsSizeList,
  count,
  actualWeight,
  volumeSize,
  matchList,
  unfoldSizeVisible,
  goodsSupplement,
} from '../hooks/state'
import useEffect from '@order-public-sub-public/validate'

import { ModuleType } from '@order-public-sub-public/constants'
import { lessTwoCharacters, notEmpty, symbolNumber } from '@order-public-sub-public/utils/pattern'
import useEmit from './useEmit'
import { popupVisible } from './useVisible'
import { getTotalCount } from '../utils/index'
import { getCurrentPageName } from '@order-public-sub-public/validate/utils'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export type Rule = {
  rule: RegExp
  errorMessage: string
}

type Config = ProductInfoConfig & {
  active: boolean
  container: string
  fieldsConfigType: string
}

interface ValidateMap {
  [key: string]: {
    value: string
    rules: Rule[]
  }
}

export type FieldKey =
  | 'goodsType'
  | 'productCode'
  | 'preWaybillGoodsSizeList'
  | 'count'
  | 'actualWeight'
  | 'volumeSize'
  | 'productInfo'
  | 'productInfo.goodsSupplement'

// const restrictStoreData = computed(
//   () => piniaStore.globalData.restrictData.goodsRestrict?.goodsRestrictPropertyList
// )
const config = computed(() => piniaStore.schema.moduleConfigData(ModuleType['货物信息']) as Config)
// 校验基础模板
const baseValidateResult = () => {
  let baseValidateResult: localCheckResult = {
    content: '请完善尺寸',
    passed: false,
    key: 'toast',
  }

  if (config.value?.container === 'popup') {
    const validateElement = document.getElementById('product-info-bottom-popup')?.children?.[1]
    baseValidateResult = { ...baseValidateResult, bubbleConfig: { appendTo: validateElement, offset: [0, 16] } }
  }

  if (config.value?.container === 'unfold' && !unfoldSizeVisible.value) {
    const validateElement = document.querySelector('.product-info-unfold-size')
    baseValidateResult = {
      ...baseValidateResult,
      key: 'productInfo.preWaybillGoodsSizeList',
      bubbleConfig: { appendTo: validateElement, offset: [0, 0], placement: 'top-end' },
    }
  }

  if (config.value?.container === 'unfold' && unfoldSizeVisible.value) {
    const validateElement = document.querySelector('.product-info-unfold-size-popup')
    baseValidateResult = { ...baseValidateResult, bubbleConfig: { appendTo: validateElement } }
  }
  return baseValidateResult
}

// eslint-disable-next-line max-lines-per-function
export const useValidate = () => {
  const config = computed(() => piniaStore.schema.moduleConfigData(ModuleType['货物信息']) as Config)
  const moduleVisible = computed(
    () => piniaStore.schema.moduleConfigData(ModuleType['货物信息'], true)?.visible || false,
  )
  const restrictStoreData = computed(() => piniaStore.globalData.restrictData?.goodsRestrict)

  const { emitName } = useEmit()
  const { effectBubble, remoteCheck } = useEffect()

  const validateField = async (field: FieldKey, extraRules?: Rule[]): Promise<localCheckResult> => {
    const validateMap: ValidateMap = {
      goodsType: {
        rules: validateRules.goodsType,
        value: goodsType.value,
      },
    }

    const { value, rules } = validateMap[field]
    const comboRules: Rule[] = [...(extraRules || []), ...rules]

    return localValidateField(`productInfo.${field}`, value, comboRules)
  }

  const validateCollection = async (): Promise<localCheckResult[]> => {
    const validatePromises = moduleVisible.value
      ? [
          useGoodsTypeValidate(),
          useMatchListValidate(),
          useProductCodeValidate(),
          useCountValidate(),
          useActualWeightValidate(),
          useVolumeSizeValidate(),
        ]
      : []
    const sizeValidateList = await useSizeValidate()

    let validateResult: Promise<localCheckResult>[] = validatePromises
    if (
      (config.value?.container === 'popup' && !popupVisible.value) ||
      (config.value?.container === 'page' && getCurrentPageName()?.indexOf('product-info') === -1)
    ) {
      validateResult = (await Promise.all(validatePromises))?.map((item) => {
        return new Promise((reslove) => {
          reslove({ ...item, key: 'productInfo.productInfo', bubbleConfig: { placement: 'top-end' } })
        })
      })
      if (sizeValidateList.length) {
        for (let i = 0; i < sizeValidateList.length; i++) {
          const subItem = sizeValidateList[i]
          validateResult.push(
            new Promise((reslove) => {
              reslove({ ...subItem, key: 'productInfo.productInfo', bubbleConfig: { placement: 'top-end' } })
            }),
          )
        }
      }
    } else {
      if (sizeValidateList.length) {
        for (let i = 0; i < sizeValidateList.length; i++) {
          const subItem = sizeValidateList[i]
          validateResult.push(
            new Promise((reslove) => {
              reslove({ ...subItem })
            }),
          )
        }
      }
    }

    return Promise.all(validateResult)
  }

  const useGoodsTypeValidate = async (): Promise<localCheckResult> => {
    let extraRules: Rule[] = []

    config.value?.fieldsConfig?.forEach((item) => {
      if (item.name === 'cargoName' && item.required) {
        extraRules = [
          { rule: notEmpty, errorMessage: '请输入托寄物名称' },
          {
            rule: lessTwoCharacters,
            errorMessage: '托寄物不能少于2个字',
          },
          {
            rule: symbolNumber,
            errorMessage: '托寄物名称不可为数字和字符',
          },
        ]
      }
    })

    const { validateField } = useValidate()

    let validateResult = await validateField('goodsType', extraRules)

    validateResult = { ...validateResult, bubbleConfig: { offset: [0, 16] } }
    if (config.value?.container === 'popup') {
      const validateElement = document.getElementById('product-info-bottom-popup')?.children?.[1]
      validateResult = {
        ...validateResult,
        bubbleConfig: {
          appendTo: validateElement,
          placement: 'top-start',
        },
      }
    }

    if (config.value?.container === 'page') {
      const currentPageName = getCurrentPageName()
      validateResult = {
        ...validateResult,
        bubbleConfig: { placement: currentPageName === 'product-info' ? 'top-start' : 'top-end', offset: [0, 2] },
      }
    }

    return validateResult
  }

  const useMatchListValidate = async (): Promise<localCheckResult> => {
    let validateResult: localCheckResult = { content: '', passed: true, key: '' }

    if (config.value?.fieldsConfigType !== 'combination') {
      // 校验电池包装
      if (
        goodsType.value === restrictStoreData.value?.goodsName &&
        restrictStoreData.value?.goodsRestrictPropertyList &&
        restrictStoreData.value?.goodsRestrictPropertyList?.length > 0
      ) {
        for (let i = 0; i <= restrictStoreData.value.goodsRestrictPropertyList.length - 1; i++) {
          const item = restrictStoreData.value.goodsRestrictPropertyList[i]
          if (item.require) {
            if (!matchList.value?.map((secItem) => secItem.code).includes(item.code)) {
              validateResult = {
                key: `productInfo.${item.code}`,
                passed: false,
                content: item.bubbleTip,
                noNeedErrorColor: true,
                bubbleConfig: { offset: [0, 16], placement: 'top-start' },
              }
              break
            }
          }
        }
      }
    }

    if (config.value?.container === 'popup') {
      const validateElement = document.getElementById('product-info-bottom-popup')?.children?.[1]
      validateResult = {
        ...validateResult,
        bubbleConfig: { appendTo: validateElement, placement: 'top-start', offset: [0, 16] },
      }
    }

    return validateResult
  }

  const useCountValidate = async () => {
    let validateResult: localCheckResult = { content: '', passed: true, key: 'productInfo.count' }

    const element = document.getElementById('product-spec-piece-id')

    config.value?.fieldsConfig?.forEach((item) => {
      if (item.name === 'pieceCount') {
        if (!count.value && item.required) {
          validateResult = {
            content: '请输入件数/箱数',
            passed: false,
            key: 'productInfo.count',
            bubbleConfig: { placement: 'top', offset: [0, 0], appendTo: element },
          }
        } else {
          if (count.value < getTotalCount.value) {
            validateResult = {
              content: `件数/箱数不能小于尺寸件数之和${getTotalCount.value}件`,
              passed: false,
              key: 'productInfo.count',
              bubbleConfig: { placement: 'top', offset: [0, 8], appendTo: element },
            }
          }
        }
      }
    })

    if (config.value?.container === 'popup') {
      const validateElement = document.getElementById('product-info-bottom-popup')?.children?.[1]
      validateResult = {
        ...validateResult,
        bubbleConfig: { appendTo: validateElement, placement: 'top', offset: [0, 8] },
      }
    }

    return validateResult
  }

  const useActualWeightValidate = async () => {
    let validateResult: localCheckResult = { content: '', passed: true, key: 'productInfo.actualWeight' }

    config.value?.fieldsConfig?.forEach((item) => {
      if (item.name === 'weightCount' && item.required) {
        if (!actualWeight.value) {
          validateResult = {
            content: '请输入总重量',
            passed: false,
            key: 'productInfo.actualWeight',
            bubbleConfig: { placement: 'top', offset: [0, 8] },
          }
        }
      }
    })

    if (config.value?.container === 'popup') {
      const validateElement = document.getElementById('product-info-bottom-popup')?.children?.[1]
      validateResult = {
        ...validateResult,
        bubbleConfig: { appendTo: validateElement, placement: 'top', offset: [0, 8] },
      }
    }

    return validateResult
  }

  const useVolumeSizeValidate = async () => {
    let validateResult: localCheckResult = { content: '', passed: true, key: 'productInfo.volumeSize' }

    config.value?.fieldsConfig?.forEach((item) => {
      if (item.name === 'goodsVolume' && item.required) {
        if (!volumeSize.value) {
          validateResult = {
            content: '请输入总体积',
            passed: false,
            key: 'productInfo.volumeSize',
            bubbleConfig: { placement: 'top', offset: [0, 8] },
          }
        }
      }
    })

    if (config.value?.container === 'popup') {
      const validateElement = document.getElementById('product-info-bottom-popup')?.children?.[1]
      validateResult = {
        ...validateResult,
        bubbleConfig: { appendTo: validateElement, placement: 'top', offset: [0, 8] },
      }
    }

    return validateResult
  }

  const useProductCodeValidate = async (): Promise<localCheckResult> => {
    let validateResult: localCheckResult = { content: '', passed: true, key: 'productInfo.productCode' }
    const dyamincData = piniaStore.globalData.dynamicConfig('vipData') || {}
    if (productCode.value && dyamincData.visible) {
      if (!/^\d{10}-\d{4}$/.test(productCode.value)) {
        validateResult = {
          content: '请输入正确唯品会入库号',
          passed: false,
          key: 'productInfo.productCode',
          bubbleConfig: { offset: [0, 6] },
        }
      }
    }

    if (config.value?.container === 'popup') {
      const validateElement = document.getElementById('product-info-bottom-popup')?.children?.[1]
      validateResult = { ...validateResult, bubbleConfig: { appendTo: validateElement } }
    }

    return validateResult
  }

  // 单行数据校验结果
  const checkLineValidateResult = (params: { data: GoodsSize; required: boolean; index: number }) => {
    const { data, required, index } = params
    console.log(required)
    const checkKeys = ['length', 'width', 'height', 'count', 'singleWeight']

    // 空行校验(全空非必填不校验)
    const emptyLineCheck = !data.width && !data.height && !data.length && !required
    const hasDataLineCheck = data.width && data.height && data.length
    const isWhole = hasDataLineCheck || emptyLineCheck
    const baseValidateTpl = baseValidateResult()
    const checkResult = checkKeys.reduce((pre, cur) => {
      const isPassed = !!isWhole || !!data[cur as keyof GoodsSize]
      pre.push({
        ...baseValidateTpl,
        key: `productInfo.preWaybillGoodsSizeList-${cur}-${index}`,
        passed: isPassed,
      })
      return pre
    }, [] as localCheckResult[])
    return {
      checkResult,
      hasDataLineCheck,
    }
  }

  // 尺寸列表外部调用校验
  const useSizeValidate = async (): Promise<localCheckResult[]> => {
    const sizeListValidate = await useProductSizeValidate()
    if (sizeListValidate.length) {
      return sizeListValidate
    } else {
      const checkResult = {
        content: '',
        passed: true,
        key: 'productInfo.preWaybillGoodsSizeList',
        bubbleConfig: { offset: [0, 16] },
      } as localCheckResult
      return [checkResult]
    }
  }

  // 尺寸列表弹窗校验
  const useProductSizeValidate = async (): Promise<localCheckResult[]> => {
    const baseValidateTpl = baseValidateResult()
    const sizeListValidateResult: localCheckResult[] = [] // 校验结果集

    // 是否必填
    const goodsSizeRequired = config.value?.fieldsConfig?.find((item) => item.name === 'goodsSize')?.required || false
    const isEmpty = preWaybillGoodsSizeList.value.filter((i) => i.width && i.height && i.length)
    const unfoldShow = config.value?.container === 'unfold' && !unfoldSizeVisible.value
    if (preWaybillGoodsSizeList.value.length <= 0 || (isEmpty?.length <= 0 && unfoldShow)) {
      sizeListValidateResult.push({
        ...baseValidateTpl,
        passed: !goodsSizeRequired,
      })
    } else {
      for (let i = 0; i < preWaybillGoodsSizeList.value?.length; i++) {
        const item = preWaybillGoodsSizeList.value[i]
        const { checkResult } = checkLineValidateResult({ data: item, required: goodsSizeRequired, index: i })
        sizeListValidateResult.push(...checkResult)
      }
    }
    return sizeListValidateResult
  }

  const useProductInfoValidate = async (field: FieldKey, cancelProcess = false) => {
    let validateResult: localCheckResult[] = [{ passed: true, key: '', content: '' }]
    let fieldKey: ChangeKeys = ''
    let emitNameAndData: Partial<ProductInfo> = {}

    if (field === 'goodsType') {
      validateResult = [await useGoodsTypeValidate(), await useMatchListValidate()]
      fieldKey = 'productInfo.goodsType'
      emitNameAndData = { goodsType: goodsType.value }
    }
    if (field === 'productInfo.goodsSupplement') {
      validateResult = []
      fieldKey = 'productInfo.goodsSupplement'
      emitNameAndData = { goodsSupplement: goodsSupplement.value }
    }

    if (field === 'productCode') {
      validateResult = [await useProductCodeValidate()]
      fieldKey = 'productInfo.productCode'
      emitNameAndData = { productCode: productCode.value }
    }

    if (field === 'count') {
      validateResult = [await useCountValidate()]
      fieldKey = 'productInfo.count'
      emitNameAndData = { count: count.value }
    }

    if (field === 'actualWeight') {
      validateResult = [await useActualWeightValidate()]
      fieldKey = 'productInfo.actualWeight'
      emitNameAndData = { actualWeight: actualWeight.value }
    }

    if (field === 'volumeSize') {
      validateResult = [await useVolumeSizeValidate()]
      fieldKey = 'productInfo.volumeSize'
      emitNameAndData = { volumeSize: volumeSize.value }
    }

    if (field === 'preWaybillGoodsSizeList') {
      validateResult = [...(await useProductSizeValidate())]
      fieldKey = 'productInfo.preWaybillGoodsSizeList'
      emitNameAndData = { preWaybillGoodsSizeList: preWaybillGoodsSizeList.value }
    }

    if (field === 'productInfo') {
      validateResult = await validateCollection()
      fieldKey = 'productInfo'
    }
    // 触发副作用
    await effectBubble(validateResult)
    if (!cancelProcess) {
      // 远程校验
      const resData = await remoteCheck(fieldKey, {
        productInfo: {
          goodsType: goodsType.value,
          goodsSupplement: goodsSupplement.value,
          productCode: productCode.value,
          count: count.value,
          actualWeight: actualWeight.value,
          volumeSize: volumeSize.value,
          preWaybillGoodsSizeList: preWaybillGoodsSizeList.value?.filter(
            (item) => item.width && item.height && item.length && item.count,
          ),
          matchList: matchList.value,
          ...emitNameAndData,
        },
      })
      return resData
    }

    // 发布事件
    emitName(emitNameAndData)
  }

  return {
    moduleVisible,
    validateField,
    validateCollection,
    useGoodsTypeValidate,
    useProductCodeValidate,
    useProductSizeValidate,
    useProductInfoValidate,
  }
}

// 清除尺寸列表副作用
export const clearSizeListEffect = () => {
  if (preWaybillGoodsSizeList.value?.length) {
    const checkResultList = []
    for (let index = 0; index < preWaybillGoodsSizeList.value.length; index++) {
      const lineData = preWaybillGoodsSizeList.value[index]
      const checkLineResult = clearLineEffect({ data: lineData, index })
      checkResultList.push(...checkLineResult)
    }
    const { effectBubble } = useEffect()
    effectBubble(checkResultList)
  }
}

// 清除尺寸列表单行副作用
export const clearLineEffect = (params: { data: GoodsSize; index: number }) => {
  const config = computed(() => piniaStore.schema.moduleConfigData(ModuleType['货物信息']) as Config)
  const required = config.value?.fieldsConfig?.find((item) => item.name === 'goodsSize')?.required || false

  const { data, index } = params
  const checkKeys = ['length', 'width', 'height', 'count', 'singleWeight']

  // 空行校验(全空非必填不校验)
  const emptyLineCheck = !data.width && !data.height && !data.length && !required
  const hasDataLineCheck = data.width && data.height && data.length

  const isWhole = hasDataLineCheck || emptyLineCheck
  const baseValidate = baseValidateResult()

  return checkKeys.reduce((pre, cur) => {
    const isPassed = !!isWhole || !!data[cur as keyof GoodsSize]
    // 只收集校验通过的
    if (isPassed) {
      pre.push({
        ...baseValidate,
        key: `productInfo.preWaybillGoodsSizeList-${cur}-${index}`,
        passed: isPassed,
      })
    }
    return pre
  }, [] as localCheckResult[])
}
