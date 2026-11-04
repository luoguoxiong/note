import validateRules from '@order-public-sub-public/hooks/address/receive/config/validateRules'
import localValidateField from '@order-public-sub-public/validate/localValidateField'
import useEffect from '@order-public-sub-public/validate'
import { ChangeKeys, FieldKey, OrderInfo, CheckResponse } from '@order-public-sub-public/types'
import { filterAllSpace } from '@order-public-sub-public/utils'
import { useInitConfig } from './useInitConfig'

import { senderReceiverCheck } from '@order-public-sub-public/apis/address/index'
// 单个校验（本地）
// eslint-disable-next-line max-lines-per-function
export const checkValidate = async ({
  required,
  fieldKey,
  value = '',
  originalData = {},
}: {
  required?: boolean
  fieldKey: FieldKey
  value?: string
  originalData?: any
  needRemoteCheck?: boolean
}) => {
  const { effectBubble, remoteCheckDataHandOut } = useEffect()
  try {
    const fieldValue = filterAllSpace(value)
    const v = await localValidateField(`receive.${fieldKey}`, fieldValue, validateRules[fieldKey])
    // 必填或有值
    if (required || fieldValue) {
      await effectBubble([v])

      const { data: checkResultList } = await senderReceiverCheck({
        elementsChange: [`receive.${fieldKey}` as ChangeKeys],
        orderInfo: {
          receive: {
            ...originalData,
            mobile: filterAllSpace(originalData.mobile),
            telephone: filterAllSpace(originalData.telephone),
          },
        } as OrderInfo,
      })

      await remoteCheckDataHandOut({ checkResultList: checkResultList } as CheckResponse)
    }

    // 非必填，无值
    if (!required && !fieldValue) {
      const { data: checkResultList } = await senderReceiverCheck({
        elementsChange: [`receive.${fieldKey}` as ChangeKeys],
        orderInfo: {
          receive: {
            ...originalData,
            mobile: filterAllSpace(originalData.mobile),
            telephone: filterAllSpace(originalData.telephone),
          },
        } as OrderInfo,
      })
      await remoteCheckDataHandOut({ checkResultList: checkResultList } as CheckResponse)
    }
  } catch (error) {
    console.log('error', error)
  }
}

// 多个校验（本地）
/* eslint-disable */
export const manyValidate = async ({
  data,
  remoteCheckKey = 'receive',
  originalData,
  needRemoteCheck = false,
}: {
  data: any
  remoteCheckKey?: string
  originalData: any
  needRemoteCheck?: boolean
}): Promise<boolean> => {
  const { effectBubble, remoteCheckDataHandOut } = useEffect()
  const { addressProps } = useInitConfig()
  const newArr = []
  for (const item of data || []) {
    if (typeof item.value === 'string') {
      // 固定电话未填，分机号已填，需要气泡提示用户输入固定电话
      if (originalData.extension && !originalData.telephone) {
        newArr.push(
          localValidateField(`receive.telephone`, filterAllSpace(originalData.telephone), validateRules['telephone']),
        )
      } else {
        newArr.push(
          localValidateField(`receive.${item.fieldKey}`, filterAllSpace(item.value), validateRules[item.fieldKey]),
        )
      }
    } else if (Array.isArray(item.value)) {
      // 处理省市区单个气泡提示
      const [province, city, county] = item.value
      // 省市区场景
      if (!province && !city && !county) {
        newArr.push(localValidateField(`receive.${item.fieldKey}`, '', validateRules['address']))
      } else {
        if (!province) {
          newArr.push(localValidateField(`receive.${item.fieldKey}`, '', validateRules['province']))
        }

        if (!city && !county) {
          newArr.push(localValidateField(`receive.${item.fieldKey}`, '', validateRules['cityCounty']))
        }
        if (!city) {
          newArr.push(localValidateField(`receive.${item.fieldKey}`, '', validateRules['city']))
        }
      }
    }
  }

  try {
    const res = await Promise.all(newArr)

    await effectBubble(res)
    if (needRemoteCheck) {
      const { data: checkResultList } = await senderReceiverCheck({
        elementsChange: [remoteCheckKey as ChangeKeys],
        orderInfo: {
          receive: {
            ...originalData,
            mobile: filterAllSpace(originalData.mobile),
            telephone: filterAllSpace(originalData.telephone),
          },
        } as OrderInfo,
      })

      await remoteCheckDataHandOut({ checkResultList: checkResultList } as CheckResponse)
    }
    return res.every((i) => i.passed)
  } catch (error: any) {
    console.log('error', error)

    // 等待初始化的时候会偶发性抛出false的错误，
    // error一般是由content，为false为特别个例，暂时这么处理
    // false的时候假设校验通过可以保存数据
    if (error === false) {
      return true
    } else {
      return false
    }
  }
}
