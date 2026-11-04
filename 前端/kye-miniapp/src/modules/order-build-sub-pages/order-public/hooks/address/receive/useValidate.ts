import validateRules from './config/validateRules'
import localValidateField from '@order-public-sub-public/validate/localValidateField'
import useEffect from '@order-public-sub-public/validate'
import {
  localCheckResult,
  ChangeKeys,
  FieldKey,
  PickUp,
  OrderInfo,
  CheckResponse,
  popoverConfigType,
} from '@order-public-sub-public/types'
import { filterAllSpace, getQueryObject } from '@order-public-sub-public/utils'
import useInitConfig from './useInitConfig'

import { ModuleType, OrderPageType, ModuleStyle } from '@order-public-sub-public/constants'
import { remoteBatchCheck } from '@order-public-sub-root-pages/order-batch/hooks/useBatchProcess'
import { senderReceiverCheck } from '@order-public-sub-public/apis/address/index'
import { remoteBatchSingleCheck } from '@order-public-sub-root-pages/order-batch/hooks/useBatchSingleProcess'
import { validateBatchSingleWaybill } from '@order-public-sub-public/components/business/batch/batch-waybill-list/hooks/useValidate'
import { sortBy, indexOf as indexOfLodash } from 'lodash-es'
import { isInitAddressFlag } from '@order-public-sub-public/hooks/useGlobalVariable'
import { useRoute } from '@order-public-sub-public/vue-router/index'
import { getCurrentPageName } from '@order-public-sub-public/validate/utils'
import { useStore } from '@order-public-sub-public/store'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
const piniaStore = useStore()

interface ValidationMap {
  [key: string]: {
    value: string
    rules: { rule: RegExp; errorMessage: string }[]
    bubbleConfig?: popoverConfigType
  }
}

// 单个校验（本地）
// eslint-disable-next-line max-lines-per-function
const checkValidate = async ({
  required,
  fieldKey,
  value = '',
  originalData = {},
  exhibitionInfo = {}, // 展馆号展位号信息
  needRemoteCheck = true,
}: {
  required?: boolean
  fieldKey: FieldKey
  value?: string
  originalData?: any
  exhibitionInfo?: any
  needRemoteCheck?: boolean
}) => {
  const { effectBubble, remoteCheck, remoteCheckDataHandOut } = useEffect()
  try {
    const route = useRoute()
    const fieldValue = filterAllSpace(value)
    const v = await localValidateField(`receive.${fieldKey}`, fieldValue, validateRules[fieldKey])
    const orderPageType = piniaStore.root.getOrderPageType
    // 必填或有值
    if (required || fieldValue) {
      await effectBubble([v])

      if (needRemoteCheck) {
        if (orderPageType === OrderPageType.批量寄) {
          const { waybillNumber = '', batchType = '' } = getQueryObject()
          if (batchType === 'modify') {
            const batchWaybillInfo = piniaStore.order.batchWaybillInfoList.filter(
              (item) => item.waybillNumber === waybillNumber,
            )?.[0]?.waybillInfo

            // await remoteBatchSingleCheck(
            //   `receive.${fieldKey}` as ChangeKeys,
            //   { ...batchWaybillInfo, receive: originalData },
            //   ModuleStyle.跳转
            // )
            await remoteBatchSingleCheck({
              key: `receive.${fieldKey}` as ChangeKeys,
              temporaryData: { ...batchWaybillInfo, receive: originalData },
              moduleStyle: ModuleStyle.跳转,
              orderPageType: orderPageType,
            })
          } else {
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
        } else {
          if (
            route.name &&
            (route.name?.indexOf(
              'modules/order-build-sub-pages/order-public/components/business/address-book/receive/index',
            ) > -1 ||
              route.name?.indexOf(
                'modules/order-build-sub-pages/order-public/components/business/address-book/share-page/index',
              ) > -1)
          ) {
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
          } else {
            if (fieldKey === 'exhibitionNumber') {
              originalData = {
                ...originalData,
                ...{ [fieldKey]: exhibitionInfo[fieldKey] },
                exhibitionProject: exhibitionInfo?.expoCode,
              }
            }
            if (fieldKey === 'exhibitionSiteNumber') {
              originalData = {
                ...originalData,
                ...{ [fieldKey]: exhibitionInfo[fieldKey] },
              }
            }
            await remoteCheck(`receive.${fieldKey}` as ChangeKeys, { receive: originalData })
          }
        }
      }
    }

    // 非必填，无值
    if (!required && !fieldValue) {
      if (orderPageType === OrderPageType.批量寄) {
        const { waybillNumber = '', batchType = '' } = getQueryObject()
        if (batchType === 'modify') {
          const batchWaybillInfo = piniaStore.order.batchWaybillInfoList.filter(
            (item) => item.waybillNumber === waybillNumber,
          )?.[0]?.waybillInfo
          await remoteBatchCheck(
            `receive.${fieldKey}` as ChangeKeys,
            { ...batchWaybillInfo, receive: originalData },
            ModuleStyle.跳转,
          )
        } else {
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
      } else {
        if (
          route.name &&
          (route.name?.indexOf(
            'modules/order-build-sub-pages/order-public/components/business/address-book/receive/index',
          ) > -1 ||
            route.name?.indexOf(
              'modules/order-build-sub-pages/order-public/components/business/address-book/share-page/index',
            ) > -1)
        ) {
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
        } else {
          await remoteCheck(`receive.${fieldKey}` as ChangeKeys, { receive: originalData })
        }
      }
    }
  } catch (error) {
    console.log('error', error)
  }
}

// 多个校验（本地）
/* eslint-disable */
const manyValidate = async ({
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
  const { effectBubble, remoteCheck, remoteCheckDataHandOut } = useEffect()
  const { addressProps } = useInitConfig({})
  const newArr = []
  const route = useRoute()
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
      if (!addressProps.value.addressEdit) {
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
          // bug#454433 不单独对区县进行校验
          // if (!county) {
          //   newArr.push(localValidateField(`receive.${item.fieldKey}`, '', validateRules['county']))
          // }
        }
      } else {
        // 指定地址场景
        if (!province && !city) {
          // 分字段维护
          if (addressProps.value.fieldsConfigType) {
            newArr.push(localValidateField(`receive.address`, '', validateRules['fieldSpecifyAddress']))
          } else {
            // 组合维护
            newArr.push(localValidateField(`receive.address`, '', validateRules['specifyAddress']))
          }
        }
      }
    }
  }

  console.log('arr===>', newArr)

  const orderPageType = piniaStore.root.getOrderPageType

  try {
    const res = await Promise.all(newArr)
    console.log('校验 ===>', res)

    await effectBubble(res)
    if (needRemoteCheck) {
      if (orderPageType === OrderPageType.批量寄) {
        const { waybillNumber = '', batchType = '', pageSource = '' } = getQueryObject()
        if (batchType === 'modify') {
          const batchWaybillInfo = piniaStore.order.batchWaybillInfoList.filter(
            (item) => item.waybillNumber === waybillNumber,
          )?.[0]?.waybillInfo

          // 处理批量切换收件地址调用
          if (
            pageSource === 'page' &&
            route.name &&
            route.name?.indexOf(
              'modules/order-build-sub-pages/order-public/components/business/receive/page/address-page/index',
            ) > -1
          ) {
            await remoteCheck(
              remoteCheckKey as ChangeKeys,
              { receive: originalData },
              undefined,
              undefined,
              undefined,
              pageSource,
              waybillNumber,
            )

            // 收件地址编辑后 跑当前批量子运单的本地校验
            setTimeout(() => {
              validateBatchSingleWaybill(waybillNumber)
            }, 100)
          } else {
            await remoteBatchCheck(
              remoteCheckKey as ChangeKeys,
              { ...batchWaybillInfo, receive: originalData },
              ModuleStyle.跳转,
            )
          }
        } else {
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
      } else {
        if (
          (route.name &&
            (route.name?.indexOf(
              'modules/order-build-sub-pages/order-public/components/business/address-book/receive/index',
            ) > -1 ||
              route.name?.indexOf(
                'modules/order-build-sub-pages/order-public/components/business/address-book/share-page/index',
              ) > -1)) ||
          isInitAddressFlag.value
        ) {
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
        } else {
          await remoteCheck(remoteCheckKey as ChangeKeys, { receive: originalData })
        }
      }
    }
    return res.every((i) => i.passed)
  } catch (error: any) {
    console.log('error', error)
    umpOtherReport(
      'CLK',
      { eventCode: 'clk_express_receiver_control_v1' },
      { button_name: '确定', request_result: '失败', failure_reason: error && error.content },
    )
    umpOtherReport(
      'OTHER',
      { eventCode: 'exp_other_express_single_received_address_v1' },
      { request_result: '失败', failure_reason: error && error.content },
    )
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

/* eslint-disable */
const useValidate = () => {
  const { addressProps, visible, config, moduleStyleType } = useInitConfig({})

  // 多个校验（对外）
  const validateField = async (field: FieldKey, required?: boolean): Promise<localCheckResult> => {
    const {
      person = '',
      mobile = '',
      telephone = '',
      extension = '',
      companyName = '',
      province = '',
      city = '',
      county = '',
      detailAddress = '',
      exhibitionNumber = '',
      exhibitionSiteNumber = '',
    } = piniaStore.order.moduleFormData(ModuleType['收方信息']) || {}

    const validationMap: ValidationMap = {
      person: { value: person || '', rules: validateRules.person },
      mobile: { value: filterAllSpace(mobile) || '', rules: validateRules.mobile },
      companyName: { value: companyName || '', rules: validateRules.companyName },
      detailAddress: { value: detailAddress || '', rules: validateRules.detailAddress },
      receive: { value: [province, city].join('') || '', rules: validateRules.receive },
      exhibitionNumber: {
        value: exhibitionNumber || '',
        rules: validateRules.exhibitionNumber,
        bubbleConfig: { offset: [-20, -10] },
      },
      exhibitionSiteNumber: {
        value: exhibitionSiteNumber || '',
        rules: validateRules.exhibitionSiteNumber,
      },
    }

    // 输入分机号，固定电话未填，需要气泡提示
    if (field === 'telephone') {
      if (extension && !telephone) {
        validationMap.telephone = { value: '-1', rules: validateRules.telephone }
      } else {
        validationMap.telephone = { value: filterAllSpace(telephone), rules: validateRules.telephone }
      }
    }

    // 指定地址场景
    if (addressProps.value.addressEdit) {
      if (!province && !city) {
        // 分字段维护
        if (addressProps.value.fieldsConfigType) {
          validationMap.address = { value: '', rules: validateRules.fieldSpecifyAddress }
        } else {
          // 组合维护
          validationMap.address = { value: '', rules: validateRules.specifyAddress }
        }
      }
    } else {
      // 省市区场景
      if (!province && !city) {
        validationMap.address = { value: '', rules: validateRules.address }
      } else {
        if (!province) {
          validationMap.address = { value: '', rules: validateRules.province }
        } else if (!city && !county) {
          validationMap.address = { value: '', rules: validateRules.cityCounty }
        } else if (!city) {
          validationMap.address = { value: '', rules: validateRules.city }
        }
      }
    }

    // 收件展馆号展位号场景：都填 || 都不填
    if (!exhibitionNumber) {
      validationMap.exhibitionSiteNumber = { value: '', rules: [] }
    }

    if (!exhibitionSiteNumber) {
      validationMap.exhibitionNumber = { value: '', rules: [] }
    }

    // 跳转场景，气泡位置往上走10px
    let offset: [number, number] = moduleStyleType.value === 'page' ? [30, 10] : [0, 0]
    if (['exhibitionNumber', 'exhibitionSiteNumber'].includes(field)) {
      offset = [0, -6]
    }
    const { value = '', rules = [], bubbleConfig = {} } = validationMap[field] || {}
    let curRequired = required
    if (['exhibitionNumber', 'exhibitionSiteNumber'].includes(field) && (exhibitionSiteNumber || exhibitionNumber)) {
      curRequired = true
    }
    if (curRequired || value) {
      return localValidateField(`receive.${field}`, value, rules, { offset })
    }

    return {
      key: `receive.${field}`,
      passed: true,
      content: '',
      bubbleConfig,
    }
  }

  const validateCollection = async (): Promise<localCheckResult[]> => {
    // 如果是批量寄/批量寄单条，不需要校验收件信息
    const orderPageType = piniaStore.root.getOrderPageType
    if (orderPageType === OrderPageType.批量寄 || orderPageType === OrderPageType.批量寄单票) {
      return [
        {
          key: 'receive',
          passed: true,
          content: '',
        },
      ]
    }
    if (config.value && visible.value) {
      let addressFields = config.value?.fieldsConfig || []
      //需要调换地址和公司名的校验顺序
      const sortList = ['address', 'companyName']
      try {
        addressFields = sortBy(addressFields, (i) => indexOfLodash(sortList, i?.name))
      } catch (e) {
        console.error(e)
      }
      // 展位和展馆号数据
      const { required } = piniaStore.globalData.dynamicConfig('receiveExtractShow') || {}
      const exhibitionArr = [
        {
          required,
          name: 'exhibitionNumber',
        },
        {
          required,
          name: 'exhibitionSiteNumber',
        },
      ]
      // 展位和展馆号数据 TODO 这里需要验证取值
      // 组装省市区详细地址单个校验内容
      const requiredStatus = addressFields
        .filter((i: Record<string, any>) => i.name === 'address' && i.required)
        .some((a: Record<string, any>) => a.required)
      const requiredFields = [
        ...addressFields,
        ...(requiredStatus
          ? [
              { required: true, name: 'province' },
              { required: true, name: 'city' },
              { required: true, name: 'detailAddress' },
            ]
          : []),
        ...exhibitionArr,
      ]

      const {
        person = '',
        mobile = '',
        telephone = '',
        province = '',
        city = '',
        county = '',
      } = piniaStore.order.moduleFormData(ModuleType['收方信息']) || {}
      const address = `${province || ''}${city || ''}${county || ''}`
      const flag =
        !person &&
        !mobile &&
        !telephone &&
        !address &&
        moduleStyleType.value === 'page' &&
        !getCurrentPageName().includes('receive-page')
      if (flag) {
        return required
          ? [
              await validateField('receive', true),
              await validateField('exhibitionNumber', true),
              await validateField('exhibitionSiteNumber', true),
            ]
          : [await validateField('receive', true)]
      } else {
        const arr = requiredFields.map((field) => validateField(field.name, field.required))
        return Promise.all(arr)
      }
    }

    return []
  }

  return {
    checkValidate,
    manyValidate,
    validateField,
    validateCollection,
  }
}

export default useValidate
