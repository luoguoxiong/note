import validateRules, { getSendLocationConfig } from './config/validateRules'
import localValidateField from '@order-public-sub-public/validate/localValidateField'
import useEffect from '@order-public-sub-public/validate'
import {
  localCheckResult,
  ChangeKeys,
  FieldKey,
  Delivery,
  OrderInfo,
  CheckResponse,
  popoverConfigType,
} from '@order-public-sub-public/types'

import { filterAllSpace, getQueryObject } from '@order-public-sub-public/utils'
import useInitConfig from './useInitConfig'
import { ModuleType, OrderPageType, ModuleStyle } from '@order-public-sub-public/constants'
// import { remoteBatchCheck } from '@order-public-sub-root-pages/order-batch/hooks/useBatchProcess'
import { senderReceiverCheck } from '@order-public-sub-public/apis/address/index'
import { notEmpty } from '@order-public-sub-public/utils/pattern'
import { useRoute } from '@order-public-sub-public/vue-router'
import { useStore } from '@order-public-sub-public/store'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { getCurrentPageName } from '@order-public-sub-public/validate/utils'
const piniaStore = useStore()

interface ValidationMap {
  [key: string]: {
    value: any
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
  needRemoteCheck = true,
}: {
  required?: boolean
  fieldKey: FieldKey
  value?: string
  originalData?: any
  needRemoteCheck?: boolean
}) => {
  const { effectBubble, remoteCheck, remoteCheckDataHandOut } = useEffect()
  // 兼容批量寄
  try {
    const route = useRoute()
    const fieldValue = filterAllSpace(value)
    const v = await localValidateField(`sender.${fieldKey}`, fieldValue, validateRules[fieldKey])
    const orderPageType = piniaStore.root.getOrderPageType
    // 必填或有值
    if (required || fieldValue) {
      await effectBubble([v])
      if (needRemoteCheck) {
        if (orderPageType === OrderPageType.批量寄) {
          // const { waybillNumber = '', batchType = '' } = getQueryObject()
          // if (batchType === 'modify') {
          //   const batchWaybillInfo = piniaStore.order.batchWaybillInfoList.filter(
          //     (item) => item.waybillNumber === waybillNumber,
          //   )?.[0]?.waybillInfo
          //   await remoteBatchCheck(
          //     `sender.${fieldKey}` as ChangeKeys,
          //     { ...batchWaybillInfo, receive: originalData },
          //     ModuleStyle.跳转,
          //   )
          // } else {
          //   const { data: checkResultList } = await senderReceiverCheck({
          //     elementsChange: [`sender.${fieldKey}` as ChangeKeys],
          //     orderInfo: {
          //       sender: {
          //         ...originalData,
          //         mobile: filterAllSpace(originalData.mobile),
          //         telephone: filterAllSpace(originalData.telephone),
          //       },
          //     } as OrderInfo,
          //   })
          //   await remoteCheckDataHandOut({ checkResultList: checkResultList } as CheckResponse)
          //   await remoteCheck(`sender.${fieldKey}` as ChangeKeys, { sender: originalData })
          // }
        } else {
          if (
            route.name &&
            route.name?.indexOf(
              'modules/order-build-sub-pages/order-public/components/business/address-book/sender/index',
            ) > -1
          ) {
            const { data: checkResultList } = await senderReceiverCheck({
              elementsChange: [`sender.${fieldKey}` as ChangeKeys],
              orderInfo: {
                sender: {
                  ...originalData,
                  mobile: filterAllSpace(originalData.mobile),
                  telephone: filterAllSpace(originalData.telephone),
                },
              } as OrderInfo,
            })

            await remoteCheckDataHandOut({ checkResultList: checkResultList } as CheckResponse)
          } else {
            await remoteCheck(`sender.${fieldKey}` as ChangeKeys, { sender: originalData })
          }
        }
      }
    }

    // 非必填，无值
    if (!required && !fieldValue) {
      if (needRemoteCheck) {
        // if (orderPageType === OrderPageType.批量寄) {
        //   const { waybillNumber = '', batchType = '' } = getQueryObject()
        //   if (batchType === 'modify') {
        //     const batchWaybillInfo = piniaStore.order.batchWaybillInfoList.filter(
        //       (item) => item.waybillNumber === waybillNumber,
        //     )?.[0]?.waybillInfo
        //     await remoteBatchCheck(
        //       `sender.${fieldKey}` as ChangeKeys,
        //       { ...batchWaybillInfo, receive: originalData },
        //       ModuleStyle.跳转,
        //     )
        //   } else {
        //     const { data: checkResultList } = await senderReceiverCheck({
        //       elementsChange: [`sender.${fieldKey}` as ChangeKeys],
        //       orderInfo: {
        //         sender: {
        //           ...originalData,
        //           mobile: filterAllSpace(originalData.mobile),
        //           telephone: filterAllSpace(originalData.telephone),
        //         },
        //       } as OrderInfo,
        //     })
        //     await remoteCheckDataHandOut({ checkResultList: checkResultList } as CheckResponse)

        //     await remoteCheck(`sender.${fieldKey}` as ChangeKeys, { sender: originalData })
        //   }
        // } else {
        if (
          route.name &&
          route.name?.indexOf(
            'modules/order-build-sub-pages/order-public/components/business/address-book/sender/index',
          ) > -1
        ) {
          const { data: checkResultList } = await senderReceiverCheck({
            elementsChange: [`sender.${fieldKey}` as ChangeKeys],
            orderInfo: {
              sender: {
                ...originalData,
                mobile: filterAllSpace(originalData.mobile),
                telephone: filterAllSpace(originalData.telephone),
              },
            } as OrderInfo,
          })
          await remoteCheckDataHandOut({ checkResultList: checkResultList } as CheckResponse)
        } else {
          await remoteCheck(`sender.${fieldKey}` as ChangeKeys, { sender: originalData })
        }
        // }
      }
    }
  } catch (error) {
    console.log('22error22', error)
    return error
  }
}

// 多个校验（本地）
/* eslint-disable */
const manyValidate = async ({
  data,
  remoteCheckKey = 'sender',
  originalData,
  needRemoteCheck = false,
}: {
  data: any
  remoteCheckKey?: string
  originalData: any
  needRemoteCheck?: boolean
}): Promise<boolean> => {
  console.log('data===>', data)
  const route = useRoute()
  const { effectBubble, remoteCheck, remoteCheckDataHandOut } = useEffect()
  const { addressProps } = useInitConfig({})
  const newArr = []

  for (const item of data || []) {
    if (typeof item.value === 'string') {
      // 固定电话未填，分机号已填，需要气泡提示用户输入固定电话
      if (originalData.extension && !originalData.telephone) {
        newArr.push(
          localValidateField(`sender.telephone`, filterAllSpace(originalData.telephone), validateRules['telephone']),
        )
      } else {
        const ruleMsg = validateRules[item.fieldKey]
        if (item.fieldKey === 'mobile' && !item.required) {
          // 移除必填校验
          ruleMsg.shift()
        }
        newArr.push(localValidateField(`sender.${item.fieldKey}`, filterAllSpace(item.value), ruleMsg))
      }
    } else if (Array.isArray(item.value)) {
      // 处理省市区单个气泡提示
      const [province, city, county] = item.value

      if (!addressProps.value.addressEdit) {
        // 省市区场景
        if (!province && !city && !county) {
          newArr.push(localValidateField(`sender.${item.fieldKey}`, '', validateRules['address']))
        } else {
          if (!province) {
            newArr.push(localValidateField(`sender.${item.fieldKey}`, '', validateRules['province']))
          }

          if (!city && !county) {
            newArr.push(localValidateField(`sender.${item.fieldKey}`, '', validateRules['cityCounty']))
          }

          if (!city) {
            newArr.push(localValidateField(`sender.${item.fieldKey}`, '', validateRules['city']))
          }
          // bug#454433 不单独对区县进行校验
          // if (!county) {
          //   newArr.push(localValidateField(`sender.${item.fieldKey}`, '', validateRules['county']))
          // }
        }
      } else {
        // 指定地址场景
        if (!province && !city) {
          // 分字段维护
          if (addressProps.value.fieldsConfigType) {
            newArr.push(localValidateField(`sender.address`, '', validateRules['fieldSpecifyAddress']))
          } else {
            // 组合维护
            newArr.push(localValidateField(`sender.address`, '', validateRules['specifyAddress']))
          }
        }
      }
    }
  }

  try {
    const res = await Promise.all(newArr)

    // 兼容批量寄
    await effectBubble(res)
    // 需要远程管控
    if (needRemoteCheck) {
      // 地址簿编辑页走专用校验接口 senderReceiverCheck，其余场景走过程中 remoteCheck（singleProcess）
      if (
        route.name &&
        route.name?.indexOf(
          'modules/order-build-sub-pages/order-public/components/business/address-book/sender/index',
        ) > -1
      ) {
        const { data: checkResultList } = await senderReceiverCheck({
          elementsChange: [remoteCheckKey as ChangeKeys],
          orderInfo: {
            sender: {
              ...originalData,
              mobile: filterAllSpace(originalData.mobile),
              telephone: filterAllSpace(originalData.telephone),
            },
          } as OrderInfo,
        })

        await remoteCheckDataHandOut({ checkResultList: checkResultList } as CheckResponse)
      } else {
        await remoteCheck(remoteCheckKey as ChangeKeys, { sender: originalData })
      }
      // }
    }
    return res.every((i) => i.passed)
  } catch (error: any) {
    console.log('error', error)
    umpOtherReport(
      'CLK',
      { eventCode: 'clk_express_sender_control_v1' },
      { button_name: '确定', request_result: '失败', failure_reason: error && error.content },
    )
    umpOtherReport(
      'OTHER',
      { eventCode: 'exp_other_express_single_sender_address_v1' },
      { request_result: '失败', failure_reason: error && error.content },
    )
    return false
  }
}

// 单个本地校验有返回值
const checkValidateReturn = async ({ fieldKey, value = '' }: { fieldKey: FieldKey; value?: string }) => {
  try {
    const fieldValue = filterAllSpace(value)
    const v = await localValidateField(`sender.${fieldKey}`, fieldValue, validateRules[fieldKey])
    return v
  } catch (error) {
    console.log('error', error)
  }
}

/* eslint-disable */
const useValidate = () => {
  const { addressProps, moduleStyleType, config, visible } = useInitConfig({})

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
      extend: { projectArea = '', projectNumber = '' } = {},
    } = piniaStore.order.moduleFormData(ModuleType['寄方信息']) || {}
    const { projectAreaRuls = [], housePlaceholderRuls = [] } = getSendLocationConfig(field)
    const validationMap: ValidationMap = {
      person: { value: person || '', rules: validateRules.person },
      mobile: { value: filterAllSpace(mobile) || '', rules: validateRules.mobile },
      companyName: { value: companyName || '', rules: validateRules.companyName },
      detailAddress: { value: detailAddress || '', rules: validateRules.detailAddress },
      sender: { value: [province, city].join('') || '', rules: validateRules.sender },
      exhibitionNumber: {
        value: exhibitionNumber || '',
        rules: validateRules.exhibitionNumber,
        bubbleConfig: { placement: 'top-start', offset: [0, -10] },
      },
      exhibitionSiteNumber: { value: exhibitionSiteNumber || '', rules: validateRules.exhibitionSiteNumber },
      projectArea: { value: projectArea, rules: projectAreaRuls },
      projectNumber: { value: projectNumber, rules: housePlaceholderRuls },
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

    // 跳转场景，气泡位置往上走10px
    let offset: [number, number] = moduleStyleType.value === 'page' ? [0, -2] : [0, 0]

    // 特写判断没有下单公司气泡的位置
    const orderCustomerDom = document.getElementById('OrderCustomer')
    if (!orderCustomerDom) {
      offset = [0, -10]
    }

    const { value = '', rules = [] } = validationMap[field] || {}
    let curRequired = required
    if (['exhibitionNumber', 'exhibitionSiteNumber'].includes(field) && (exhibitionSiteNumber || exhibitionNumber)) {
      curRequired = true
    }
    // 这里增加 手机/固化二选一的逻辑
    if ('mobile' === field && !curRequired && !filterAllSpace(telephone)) {
      return localValidateField('sender.mobile', value, [
        {
          rule: notEmpty,
          errorMessage: '手机号码或固定电话至少填写一项',
        },
      ])
    }
    if (curRequired || value) {
      return localValidateField(
        `sender.${field}`,
        value,
        rules,
        ['exhibitionNumber', 'projectNumber', 'projectArea'].includes(field)
          ? { placement: 'top-start', appendTo: document.querySelector('body') }
          : { offset, maxWidth: 280 },
      )
    }

    return {
      key: `sender.${field}`,
      passed: true,
      content: '',
    }
  }

  const validateCollection = async (): Promise<localCheckResult[]> => {
    if (config.value && visible.value) {
      // 基础表单数据
      const addressFields = config.value?.fieldsConfig
      // 展位和展馆号数据
      const { required } = piniaStore.globalData.dynamicConfig('extractShow') || {}
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

      // 华强北
      let sendLocationArr: { required: boolean; name: string }[] = []
      const sendLocationDynamicConfig = piniaStore.globalData.dynamicConfig('senderProjectLocation') || {}
      if (sendLocationDynamicConfig.visible) {
        sendLocationArr = [
          {
            required: sendLocationDynamicConfig?.locationInfo?.required || false,
            name: 'projectArea',
          },
          {
            required: sendLocationDynamicConfig?.shopInfo?.required || false,
            name: 'projectNumber',
          },
        ]
      }

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
        ...sendLocationArr,
      ]
      const {
        person = '',
        mobile = '',
        telephone = '',
        province = '',
        city = '',
        county = '',
      } = piniaStore.order.moduleFormData(ModuleType['寄方信息']) || {}
      const address = `${province || ''}${city || ''}${county || ''}`
      const pageName = getCurrentPageName()
      const flag =
        !person &&
        !mobile &&
        !telephone &&
        !address &&
        moduleStyleType.value === 'page' &&
        !pageName.includes('sender-page')
      //需求547026如果不是填单信息页面，走所有的校验，用于远程校验的返回值，否则匹配不上会没有气泡
      if (flag && !pageName?.includes('address-book/sender/index')) {
        return [await validateField('sender', true)]
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
    checkValidateReturn,
    validateField,
    validateCollection,
  }
}

export default useValidate
