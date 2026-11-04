import { ModuleType } from '@order-public-sub-public/constants'
import { GlobalConfigMap } from '@order-public-sub-public/types'

/* 导入跨组件函数 */
import { useTrigger as useEstimatedCostTrigger } from '@order-public-sub-public/components/business/estimated-cost/hooks/useTrigger'
// import { useTrigger as useOverAreaDeliveryTrigger } from '@order-public-sub-public/components/business/over-area-delivery/hooks/useTrigger'
import { useTrigger as useProductInfoTrigger } from '@order-public-sub-public/components/business/product-info/hooks/useTrigger'

/* 导入校验函数 */
import useValidSender from '@order-public-sub-public/hooks/address/sender/useValidate'
import useValidReceive from '@order-public-sub-public/hooks/address/receive/useValidate'
import useValidPayMode from '@order-public-sub-public/components/business/pay-mode/hooks/useValidate'
import useValidatePickupInformation from '@order-public-sub-public/components/business/pickup-information/hooks/useValidate'
import useValidateDispatchInformation from '@order-public-sub-public/components/business/dispatch-information/hooks/useValidate'
import useValidateServiceMode from '@order-public-sub-public/components/business/service-model/hooks/useValidate'
import { useValidate as useValidateWaybillRemark } from '@order-public-sub-public/components/business/waybill-remark/hooks/useValidate'
import { useValidate as useValidateGoodsTime } from '@order-public-sub-public/components/business/goods-time/hooks/useValidate'
import useValidatePickupMode from '@order-public-sub-public/components/business/pickup-mode/hooks/useValidate'
import { useValidate as useValidateProductInfo } from '@order-public-sub-public/components/business/product-info/hooks/useValidate'
import { useValidate as useValidateAddedService } from '@order-public-sub-public/components/business/added-service/hooks/useValidate'
import { useValidate as useValidateProtectPrice } from '@order-public-sub-public/components/business/protect-price/hooks/useValidate'
import { useValidate as useValidateOverAreaDelivery } from '@order-public-sub-public/components/business/over-area-delivery/hooks/useValidate'
import { useValidate as useValidateBranchSelfPickup } from '@order-public-sub-public/components/business/branch-self-pickup/hooks/useValidate'
import { useValidate as useValidateEstimatedCost } from '@order-public-sub-public/components/business/estimated-cost/hooks/useValidate'
import { useValidate as useValidateKaCustomerMap } from '@order-public-sub-public/components/business/ka-customer-map/hooks/useValidate'
import { useValidate as useValidateSendInfoStand } from '@order-public-sub-public/components/business/batch/send-info-stand/hooks/useValidate'
import { useValidate as useValidateBatchAddReceive } from '@order-public-sub-public/components/business/batch/batch-add-receive/hooks/useValidate'
import { useValidate as useValidateBatchWaybillList } from '@order-public-sub-public/components/business/batch/batch-waybill-list/hooks/useValidate'
import { useValidate as useValidateReturnWaybill } from '@order-public-sub-public/components/business/return-waybill/hooks/useValidate'
const { validateCollection: validateCollectionSender } = useValidSender()
const { validateCollection: validateCollectionReceive } = useValidReceive()
const { validateCollection: validateCollectionPayMode } = useValidPayMode()
const { validateCollection: validateCollectionProductInfo } = useValidateProductInfo()
const { validateCollection: validateCollectionAddedService } = useValidateAddedService()
const { validateCollection: validateCollectiongoodsTime } = useValidateGoodsTime()
const { validateCollection: validateCollectionPickupMode } = useValidatePickupMode()
const { validateCollection: validateCollectionProtectPrice } = useValidateProtectPrice()
const { validateCollection: validateCollectionOverAreaDelivery } = useValidateOverAreaDelivery()
const { validateCollection: validateCollectionBranchSelfPickup } = useValidateBranchSelfPickup()
const { validateCollection: validateCollectionEstimatedCost } = useValidateEstimatedCost()
const { validateCollection: validatePickupInformation } = useValidatePickupInformation()
const { validateCollection: validateDispatchInformation } = useValidateDispatchInformation()
const { validateCollection: validateServiceMode } = useValidateServiceMode()
const { validateCollection: validateWaybillRemark } = useValidateWaybillRemark()
const { validateCollection: validateKaCustomerMap } = useValidateKaCustomerMap()
const { validateCollection: validateSendInfoStand } = useValidateSendInfoStand()
const { validateCollection: validateBatchAddReceive } = useValidateBatchAddReceive()
const { validateCollection: validateBatchWaybillList } = useValidateBatchWaybillList()
const { validateCollection: validateReturnWaybill } = useValidateReturnWaybill()

/**
 * @description 全局关系表，key为组件枚举值
 * relation配置跨组件依赖关系，支持配置changeKeys，如果触发更新的value对象不包含changedkeys
 * validation配置校验函数
 */
export const GLOBAL_CONFIG_MAP: GlobalConfigMap = {
  [ModuleType['寄方信息']]: {
    relation: {
      changeKeys: ['person', 'mobile', 'detailAddress'],
      triggerFunction: [useProductInfoTrigger().onTriggerByProductInfo],
    },
    validation: validateCollectionSender,
  },
  [ModuleType['收方信息']]: {
    relation: {
      changeKeys: ['person', 'mobile', 'detailAddress'],
      triggerFunction: [
        // useOverAreaDeliveryTrigger().onTriggerBySender,
        // useAddedServiceTrigger().onTriggerByAddedService,
        useProductInfoTrigger().onTriggerByProductInfo,
      ],
    },
    validation: validateCollectionReceive,
  },
  [ModuleType['付款方式']]: {
    relation: {
      changeKeys: ['payMode'],
      triggerFunction: [useProductInfoTrigger().onTriggerByProductInfo],
    },
    validation: validateCollectionPayMode,
  },
  [ModuleType['货物信息']]: {
    relation: {
      changeKeys: [],
      triggerFunction: [],
    },
    validation: validateCollectionProductInfo,
  },
  [ModuleType['增值服务']]: {
    relation: {
      changeKeys: ['receiptFlag', 'collectionAmount', 'woodenFrame', 'estimateFeeTaskId'],
      triggerFunction: [],
    },
    validation: validateCollectionAddedService,
  },
  [ModuleType['寄件方式']]: {
    relation: {
      changeKeys: [],
      triggerFunction: [],
    },
    validation: validateCollectionPickupMode,
  },
  [ModuleType['货好时间']]: {
    relation: {
      changeKeys: ['goodsTime', 'goodsTimeFlag'],
      triggerFunction: [],
    },
    validation: validateCollectiongoodsTime,
  },
  [ModuleType['物品保价']]: {
    relation: {
      changeKeys: [],
      triggerFunction: [],
    },
    validation: validateCollectionProtectPrice,
  },
  [ModuleType['超区派送']]: {
    relation: {
      changeKeys: ['deliveryMode'],
      triggerFunction: [],
    },
    validation: validateCollectionOverAreaDelivery,
  },
  [ModuleType['网点自提']]: {
    relation: {
      changeKeys: ['deliveryMode'],
      triggerFunction: [],
    },
    validation: validateCollectionBranchSelfPickup,
  },
  [ModuleType['预估运费']]: {
    relation: {
      changeKeys: ['deliveryMode', 'estimateFeeTaskId'],
      triggerFunction: [useEstimatedCostTrigger().onTriggerByEstimatedCost],
    },
    validation: validateCollectionEstimatedCost,
  },
  [ModuleType['取货资料']]: {
    relation: {
      changeKeys: [],
      triggerFunction: [],
    },
    validation: validatePickupInformation,
  },
  [ModuleType['派货资料']]: {
    relation: {
      changeKeys: [],
      triggerFunction: [],
    },
    validation: validateDispatchInformation,
  },
  [ModuleType['服务方式']]: {
    relation: {
      changeKeys: ['serviceMode'],
      triggerFunction: [useProductInfoTrigger().onTriggerByProductInfo],
    },
    validation: validateServiceMode,
  },
  [ModuleType['运单备注']]: {
    relation: {
      changeKeys: [],
      triggerFunction: [],
    },
    validation: validateWaybillRemark,
  },
  [ModuleType['自定义编码']]: {
    relation: {
      changeKeys: [],
      triggerFunction: [],
    },
    validation: validateKaCustomerMap,
  },
  [ModuleType['需返程']]: {
    relation: {
      changeKeys: [],
      triggerFunction: [],
    },
    validation: validateReturnWaybill,
  },
  [ModuleType['本次寄件信息统一']]: {
    relation: {
      changeKeys: [],
      triggerFunction: [],
    },
    validation: validateSendInfoStand,
  },
  [ModuleType['批量新增收件人']]: {
    relation: {
      changeKeys: [],
      triggerFunction: [],
    },
    validation: validateBatchAddReceive,
  },
  [ModuleType['批量寄子运单列表']]: {
    relation: {
      changeKeys: [],
      triggerFunction: [],
    },
    validation: validateBatchWaybillList,
  },
}
