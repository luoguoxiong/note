import { computed } from 'vue'

import {
  AddedServiceDimension,
  localCheckResult,
  ChangeKeys,
  AddedService,
  AddedServiceConfig,
  ProtectPriceDimension,
  AreaAttributeDimension,
} from '@order-public-sub-public/types'
import {
  ModuleType,
  ReceiptType,
  ReceiptProviderType,
  ModuleStyle,
  OrderPageType,
  MaterialTypes,
  fileBizCode,
  AreaAttributeType,
} from '@order-public-sub-public/constants'
import useEffect from '@order-public-sub-public/validate'
import {
  receiptProvider,
  receiptFlag,
  receiptCount,
  collectionAmount,
  woodenFrame,
  goodsControl,
  aiValidate,
  dismantlingWoodenFrame,
  receiptCheckType,
  receiptUrgentReturn,
  otherWoodFrameList,
} from './state'
import { popupVisible, unfoldPackageVisible, unfoldReceiptVisible } from './useVisible'
import { useAiValidate, useIsReadAiTips } from './useState'
import { tmpCacheKey } from '@public/hooks/useTmpCacheKey'
import { getFileByMultiBizCodeAndBizId } from '@order-public-sub-public/apis/pickup/index'
import { UploadStatusEnum, UploadFile } from '@order-public-sub-public/components/business/added-service/types'
import { useInitMulitFielConfigChild } from '@order-public-sub-public/hooks/useInitFile'
import { orderPageType } from '../../auto-sync/hooks/state'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const { getData } = useInitMulitFielConfigChild()
type FieldKey =
  | 'receiptFlag'
  | 'receiptProvider'
  | 'receiptCount'
  | 'collectionAmount'
  | 'woodenFrame'
  | 'addedService'
  | 'dismantlingWoodenFrame'
  | 'goodsControl'
  | 'receiptUrgentReturn'
  | string

type Config = AddedServiceConfig & {
  active: boolean
  container: string
}

const bizId = computed(() => piniaStore.order.waybillNumber)

// eslint-disable-next-line max-lines-per-function
export const useValidate = () => {
  const { effectBubble, remoteCheck, priceCheck } = useEffect()

  const config = computed(() => piniaStore.schema.moduleConfigData(ModuleType['增值服务']) as Config)

  const moduleDimensionData = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['增值服务']))

  const useReceiptProviderValidate = async (): Promise<localCheckResult> => {
    const { setAiValidate } = useAiValidate()

    let result: localCheckResult = { key: 'addedService.receiptProvider', passed: true, content: '' }

    const visible = config.value?.fieldsConfig?.filter((item) => item.name === 'recoveryReceipt')?.[0]?.visible

    const validateElement = document.getElementById(`added-service-bottom-${config.value?.container}`)?.children?.[1]

    if (visible) {
      moduleDimensionData.value?.receiptServiceList?.forEach((item) => {
        if (item.type === receiptFlag.value) {
          if (
            item.receiptProviderList &&
            item.receiptProviderList.length > 0 &&
            !receiptProvider.value &&
            receiptProvider.value !== ReceiptProviderType['KYEPINCHHIT']
          ) {
            result = {
              key: 'addedService.receiptProvider',
              passed: false,
              content: '请选择回单提供方',
              bubbleConfig: { placement: 'top-start', appendTo: validateElement, offset: [0, 16] },
            }
            // 隐藏ai提示
            setAiValidate(true)
          }
        }
      })
    }

    return result
  }

  const useReceiptCountValidate = async (): Promise<localCheckResult> => {
    const validateElement = document.getElementById(`added-service-bottom-${config.value?.container}`)?.children?.[1]
    let result: localCheckResult = { key: 'addedService.receiptCount', passed: true, content: '' }
    if (
      Number(receiptCount.value) <= 0 &&
      receiptFlag.value &&
      receiptFlag.value !== ReceiptType['NONE'] &&
      receiptFlag.value !== ReceiptType['ELECTRON'] &&
      receiptProvider.value !== ReceiptProviderType['KYEPINCHHIT']
    ) {
      result = {
        key: 'addedService.receiptCount',
        passed: false,
        content: '请输入回单张数',
        bubbleConfig: { appendTo: validateElement, placement: 'top', offset: [0, 16] },
      }
    }
    return result
  }

  const getUploadList = async () => {
    let uploadList: UploadFile[] = []
    const { configData, getBizCode } = await getData()
    const listParams = [
      {
        // bizId: tmpCacheKey.value || configData?.value?.bizId || bizId.value,
        bizId: configData?.value?.bizId || tmpCacheKey.value || bizId.value,
        bizCode: getBizCode(MaterialTypes.电子回单) || fileBizCode.电子回单临时,
      },
    ]
    const { data } = await getFileByMultiBizCodeAndBizId({
      list: listParams,
    })
    if (data && data.length > 0) {
      const resultList = data.map((item) => {
        const suffix = item.originalName?.split('.')?.pop()?.toLowerCase() as string
        const img = ['jpg', 'png', 'jpeg'].includes(suffix?.toLowerCase())
        const type = img ? 'img' : suffix
        return {
          ...item,
          size: item?.size ? item?.size / 1024 : 0,
          type,
          suffix,
          status: UploadStatusEnum['SUCCESS'],
        }
      }) as unknown as UploadFile[]
      uploadList = resultList
    }
    return uploadList
  }

  const useReceiptFileValidatePassed = async (): Promise<localCheckResult> => {
    const fieldsConfig = piniaStore.schema.moduleConfigData(ModuleType['增值服务'])?.fieldsConfig || []
    const isReceiptFile = fieldsConfig.filter((item) => item.name === 'receiptFile' && item.visible).length > 0

    const validateElement = document.getElementById(`added-service-bottom-${config.value?.container}`)?.children?.[1]
    let result: localCheckResult = { key: 'addedService.receiptFile', passed: true, content: '' }

    const defaultModuleDimensionData = piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])
    if (receiptFlag.value === ReceiptType['ELECTRON'] && isReceiptFile) {
      const uploadList = await getUploadList()
      if (uploadList.length <= 0) {
        result = {
          key: 'addedService.receiptFile',
          passed: false,
          content: '请上传电子回单资料',
          bubbleConfig: { appendTo: validateElement, placement: 'top-end' },
        }
      }
    }
    return result
  }

  const useCollectionAmountValidatePassed = async (
    collectionAmountValue = collectionAmount.value,
  ): Promise<localCheckResult> => {
    let result = {
      key: 'addedService.collectionAmount',
      passed: true,
      content: '',
    }
    console.log('collectionAmountValue', collectionAmountValue)
    const defaultModuleDimensionData = piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])
    let disabled = false
    // 组件数据新增禁用标识,兼容新老数据才有此判断
    if (
      defaultModuleDimensionData?.collectionAmount &&
      defaultModuleDimensionData?.collectionAmount?.disabled !== undefined
    ) {
      disabled = defaultModuleDimensionData?.collectionAmount?.disabled
    }
    const areaAttribute = piniaStore.schema.moduleDimensionData(ModuleType.区域属性)?.feature
    const hotZoneStore = () => {
      if (orderPageType.value === OrderPageType.批量寄单票) {
        return { [ModuleType['收方信息']]: true }
      } else {
        return piniaStore.extend.hotZoneStore
      }
    }
    if (areaAttribute !== AreaAttributeType['自营区'] && hotZoneStore()[ModuleType['收方信息']]) {
      disabled = true
    }
    if (collectionAmountValue === '0' && !disabled) {
      result = {
        key: 'addedService.collectionAmount',
        passed: false,
        content: '代收货款需大于0',
      }
    }
    return result
  }

  const useAiValidatePassed = async (): Promise<localCheckResult> => {
    const { setIsReadAiTips } = useIsReadAiTips()

    // 隐藏自定义气泡 使用全局校验气泡
    setIsReadAiTips(true)

    const defaultModuleDimensionData = piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])

    const result: localCheckResult = {
      key: 'addedService.addedService',
      passed: aiValidate.value,
      content: defaultModuleDimensionData?.aiTips,
      bubbleConfig: { placement: 'top-end' },
    }

    return result
  }

  const validateCollection = async (status = true): Promise<localCheckResult[]> => {
    const orderPageType = piniaStore.root.getOrderPageType
    if (orderPageType !== OrderPageType.批量寄) {
      const validatePromises = [useReceiptProviderValidate(), useReceiptCountValidate(), useReceiptFileValidatePassed()]
      if (config.value?.container !== ModuleStyle.平铺) {
        validatePromises.push(useCollectionAmountValidatePassed())
      }
      let validateResult: Promise<localCheckResult>[] = validatePromises
      if (config.value?.container === 'unfold' && !unfoldPackageVisible.value && !unfoldReceiptVisible.value) {
        validateResult = (await Promise.all(validatePromises)).map((item) => {
          return new Promise((reslove) => {
            reslove({ ...item, key: 'addedService.addedService', bubbleConfig: { placement: 'top-end' } })
          })
        })
      }

      // 弹框关闭的时候要挂在触发的组件上面
      if (config.value?.container === 'popup' && !popupVisible.value) {
        validateResult = (await Promise.all(validatePromises)).map((item) => {
          return new Promise((reslove) => {
            reslove({
              ...item,
              key: 'addedService.addedService',
              bubbleConfig: { placement: 'top-end' },
            })
          })
        })
      }

      // 弹框打开时候要挂载到弹框的组件上面
      if (config.value?.container === 'popup' && popupVisible.value) {
        validateResult = (await Promise.all(validatePromises)).map((item) => {
          return new Promise((reslove) => {
            reslove({ ...item, key: item.key, bubbleConfig: { placement: 'top-start', offset: [0, 16] } })
          })
        })
      }
      let result = validateResult

      if (status) {
        result = [...result, useAiValidatePassed()]
      }
      return Promise.all(result)
    } else {
      return Promise.all([])
    }
  }

  // eslint-disable-next-line max-lines-per-function
  /* eslint-disable */
  const useAddedServiceValidate = async (params: {
    field: FieldKey
    cancelProcess?: boolean
    isOnline?: boolean
    moduleStyleParmas?: ModuleStyle
    cb?: () => void
  }) => {
    const { field, cancelProcess = false, isOnline, moduleStyleParmas, cb } = params
    let validateResult: localCheckResult[] = [{ passed: true, key: '', content: '' }]
    let fieldKey: ChangeKeys = ''
    let emitNameAndData: Partial<AddedService> = {}
    let moduleStyle: ModuleStyle = config.value?.container as ModuleStyle

    if (field === 'receiptFlag') {
      fieldKey = 'addedService.receiptFlag'
      emitNameAndData = { receiptFlag: receiptFlag.value as ReceiptType }
      moduleStyle = ModuleStyle['弹窗']
    }

    if (field === 'receiptProvider') {
      validateResult = [await useReceiptProviderValidate()]
      fieldKey = 'addedService.receiptProvider'
      emitNameAndData = { receiptProvider: receiptProvider.value }
      moduleStyle = ModuleStyle['弹窗']
    }

    if (field === 'receiptUrgentReturn') {
      fieldKey = 'addedService.receiptUrgentReturn'
      emitNameAndData = { receiptUrgentReturn: receiptUrgentReturn.value }
      moduleStyle = ModuleStyle['弹窗']
    }

    if (field === 'receiptCount') {
      validateResult = [await useReceiptCountValidate()]
      fieldKey = 'addedService.receiptCount'
      emitNameAndData = { receiptCount: receiptCount.value }
      moduleStyle = ModuleStyle['弹窗']
    }

    if (field.includes('addedService.warehouse')) {
      validateResult = [await useReceiptCountValidate()]
      fieldKey = field as ChangeKeys
      emitNameAndData = {}
      moduleStyle = ModuleStyle['弹窗']
    }

    if (field === 'collectionAmount') {
      fieldKey = 'addedService.collectionAmount'
      emitNameAndData = { collectionAmount: collectionAmount.value }
      if (moduleStyleParmas) {
        moduleStyle = moduleStyleParmas
      }
      if (isOnline) {
        const moduleDimensionData = piniaStore.schema.moduleDimensionData(ModuleType['物品保价'])
        await priceCheck({
          premiumType: moduleDimensionData?.premiumType || '',
          temporaryData: {
            addedService: {
              receiptFlag: receiptFlag.value,
              receiptProvider: receiptProvider.value,
              receiptCheckType: receiptCheckType.value,
              receiptUrgentReturn: receiptUrgentReturn.value,
              receiptCount: receiptCount.value,
              collectionAmount: collectionAmount.value,
              woodenFrame: woodenFrame.value,
              otherWoodFrameList: otherWoodFrameList.value,
              goodsControl: goodsControl.value,
              dismantlingWoodenFrame: dismantlingWoodenFrame.value,
              ...emitNameAndData,
            },
          },
          extraRemoteCheckParams: {
            typeList: ['addedService.collectionAmount'],
          },
        })
        return
      }
    }

    if (field === 'dismantlingWoodenFrame') {
      fieldKey = 'addedService.dismantlingWoodenFrame'
      emitNameAndData = { dismantlingWoodenFrame: dismantlingWoodenFrame.value }
    }

    if (field === 'woodenFrame') {
      fieldKey = 'addedService.woodenFrame'
      emitNameAndData = {
        woodenFrame: woodenFrame.value as string,
        otherWoodFrameList: otherWoodFrameList.value,
      }
      moduleStyle = ModuleStyle['弹窗']
    }
    if (field === 'goodsControl') {
      fieldKey = 'addedService.goodsControl'
      emitNameAndData = { goodsControl: goodsControl.value }
    }

    if (field === 'addedService') {
      validateResult = await validateCollection(false)
      fieldKey = 'addedService'
    }
    // 触发副作用
    await effectBubble(validateResult)
    cb && (await cb())
    if (!cancelProcess) {
      // 远程校验
      await remoteCheck(
        fieldKey,
        {
          addedService: {
            receiptFlag: receiptFlag.value,
            receiptProvider: receiptProvider.value,
            receiptCheckType: receiptCheckType.value,
            receiptUrgentReturn: receiptUrgentReturn.value,
            receiptCount: receiptCount.value,
            collectionAmount: collectionAmount.value,
            woodenFrame: woodenFrame.value,
            otherWoodFrameList: otherWoodFrameList.value,
            goodsControl: goodsControl.value,
            dismantlingWoodenFrame: dismantlingWoodenFrame.value,
            ...emitNameAndData,
          },
        },
        moduleStyle,
      )
    }
  }

  // 获取回单费用
  const getReceiptFee = () => {
    try {
      if (!receiptFlag.value || receiptFlag.value === '20') return
      setTimeout(() => {
        priceCheck({
          temporaryData: {
            addedService: {
              receiptFlag: receiptFlag.value,
              receiptProvider: receiptProvider.value,
              receiptCheckType: receiptCheckType.value,
              receiptUrgentReturn: receiptUrgentReturn.value,
              receiptCount: receiptCount.value,
              collectionAmount: collectionAmount.value,
              woodenFrame: woodenFrame.value,
              otherWoodFrameList: otherWoodFrameList.value,
              goodsControl: goodsControl.value,
              dismantlingWoodenFrame: dismantlingWoodenFrame.value,
            },
          },
          extraRemoteCheckParams: {
            typeList: ['addedService.receiptFee'], // addedService.receiptFee: 回单服务费
          },
        })
      }, 500)
    } catch (error) {
      console.error(error)
    }
  }

  return {
    useReceiptProviderValidate,
    useReceiptCountValidate,
    validateCollection,
    useAddedServiceValidate,
    useReceiptFileValidatePassed,
    useCollectionAmountValidatePassed,
    getReceiptFee,
  }
}
