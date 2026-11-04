import { computed } from 'vue'
import { ChangeKeys, localCheckResult, ProtectPriceConfig, ProtectPriceDimension } from '@order-public-sub-public/types'
import useEffect from '@order-public-sub-public/validate'
import { declared, visible, premiumType } from './state'

import { ModuleStyle, ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { sleep } from '@order-public-sub-public/utils/sleep'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

type FiledKey = 'declared' | 'protectPrice' | 'submit'

// eslint-disable-next-line max-lines-per-function
export const useValidate = () => {
  const { effectBubble, priceCheck, remoteCheck } = useEffect()

  const config = computed(() => piniaStore.schema.moduleConfigData(ModuleType['物品保价']))

  const validateField = async (): Promise<localCheckResult> => {
    const validateElement = document.getElementById('protect-price-desc')?.children?.[1]

    let result: localCheckResult = {
      key: 'protectPrice.declarativeValue',
      passed: true,
      content: '',
    }

    const required = config.value?.fieldsConfig?.[0]?.required

    // 当输入的托寄物需支持保价的时候才能必填校验
    const insuranceAccepted = computed(() => {
      return piniaStore.globalData.restrictData?.insuranceRestrict
    }).value?.insuranceAccepted

    if (required && !declared.value && insuranceAccepted !== false) {
      result = {
        key: 'protectPrice.declarativeValue',
        passed: false,
        content: '请输入声明价值',
        bubbleConfig: { appendTo: visible.value ? validateElement : null, offset: [0, 17] },
      }
    }

    return result
  }

  const validateCollection = async (): Promise<localCheckResult[]> => {
    const validateElement = document.getElementById('protect-price-desc')?.children?.[1]
    const validatePromises = [validateField()]
    let validateResult: Promise<localCheckResult>[] = validatePromises

    validateResult = (await Promise.all(validatePromises)).map((item) => {
      return new Promise((reslove) => {
        reslove({
          key: 'protectPrice.declarativeValue',
          passed: item.passed,
          content: item.content,
          bubbleConfig: { appendTo: visible.value ? validateElement : null, offset: [0, 17] },
        })
      })
    })

    return Promise.all(validateResult)
  }

  const useProtectPriceValidate = async (params: {
    field: FiledKey
    moduleStyle?: ModuleStyle
    isOnline?: boolean
  }) => {
    const { field, moduleStyle, isOnline } = params
    let validateResult: localCheckResult[] = [{ passed: true, key: '', content: '' }]
    let fieldKey: ChangeKeys = ''

    if (field === 'declared') {
      validateResult = [await validateField()]
      fieldKey = 'protectPrice.declarativeValue'
    }

    if (field === 'protectPrice') {
      validateResult = await validateCollection()
      fieldKey = 'protectPrice.declarativeValue'
    }

    if (field === 'submit') {
      validateResult = await validateCollection()
      fieldKey = 'protectPrice.protectPrice'
    }
    // 触发副作用
    await effectBubble(validateResult)
    if (isOnline) {
      const moduleDimensionData = piniaStore.schema.moduleDimensionData(ModuleType['物品保价'])

      // 解决问题: 采用临时数据校验 且 后端判断不需要返回给前端的场景,这里的触发比 await remoteCheck 要快, waybillInfo更新就会触发
      const processPromise = piniaStore.globalData.processPromise
      if (processPromise) {
        try {
          await processPromise
          await sleep(100)
        } catch (error) {
          console.log(error)
        }
      }
      const orderPageType = piniaStore.root.getOrderPageType
      if (orderPageType === OrderPageType.批量寄) {
        return
      }
      // 实时校验
      await priceCheck({
        premiumType: moduleDimensionData?.premiumType || '',
        temporaryData: {
          protectPrice: {
            declarativeValue: declared.value.toString().replace(/[^\d]/g, ''),
            premiumType: premiumType.value,
          },
        },
        moduleStyle,
        extraRemoteCheckParams: {
          typeList: ['protectPrice.declarativeValue'],
        },
      })
    } else {
      // 远程校验
      await remoteCheck(
        fieldKey,
        {
          protectPrice: {
            declarativeValue: declared.value.toString().replace(/[^\d]/g, ''),
            premiumType: premiumType.value,
          },
        },
        moduleStyle,
      )
    }
  }

  return {
    validateField,
    validateCollection,
    useProtectPriceValidate,
  }
}
