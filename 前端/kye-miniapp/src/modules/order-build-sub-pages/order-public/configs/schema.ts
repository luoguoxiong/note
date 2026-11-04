/**
 * @descrption 基础schema
 */
import { Schema, SchemaLayout } from '@order-public-sub-public/types'
import dayjs from 'dayjs'
//
import { capitalLize } from '@order-public-sub-public/utils/string'
import { ModuleType } from '@order-public-sub-public/constants'
import { useGlobalDataStore } from '@order-public-sub-public/store/modules/globalData/pinia'
const globalDataStore = useGlobalDataStore()
const today = dayjs()

/**
 * @descrption 调整layout的顺序，将不常用的收起来
 */
export const initLayout = (layoutList: SchemaLayout[]) => {
  if (!Array.isArray(layoutList)) {
    return []
  }
  const unUsedFields = globalDataStore.preConfigProcess?.processCheckResponse?.configDimension?.unUsedFields || []
  const unUsedFieldsModuleList = unUsedFields.filter((i) => i.fold).map((a) => capitalLize(a.module))
  if (unUsedFieldsModuleList.length === 0) {
    return layoutList
  }
  layoutList.forEach((item) => {
    const list: any = item?.c || []
    if (Array.isArray(list)) {
      item.c = list?.filter((module) => {
        return !unUsedFieldsModuleList.includes(module.moduleId)
      })
      if (item.c?.find((a) => a.moduleId === ModuleType.更多功能)) {
        item.v = true
      }
    }
  })
  layoutList.push({
    v: true,
    c: unUsedFieldsModuleList.map((item) => {
      return {
        moduleId: item,
        wrapClass: 'template-nused',
      }
    }),
    type: 'Block',
  })
  // 解决有不常用功能时 最后一个模块没有padding-bottom的问题
  layoutList.push({
    v: true,
    c: [
      {
        moduleId: 'lastChildEmptyTemplate',
        wrapClass: 'block-last-child-empty-template',
      },
    ],
    type: 'Block',
  })
  return layoutList
}

export const layout = [
  {
    v: true,
    c: [
      {
        moduleId: 'Banner',
      },
    ],
    type: 'Block',
  },
  {
    v: true,
    c: [
      {
        moduleId: 'WaybillNumber',
      },
    ],
    type: 'Block',
  },
  {
    v: true,
    c: [
      {
        moduleId: 'OrderCustomer',
      },
    ],
    type: 'Block',
  },
  {
    v: true,
    c: [
      {
        moduleId: 'TemplateList',
        wrapClass: 'block-template-list',
      },
    ],
    type: 'Block',
  },
  {
    v: true,
    c: [
      {
        moduleId: 'ReturnWaybillAddress',
        wrapClass: 'block-sender-receive-list',
      },
      {
        moduleId: 'Sender',
      },
      {
        moduleId: 'Receive',
      },
      {
        moduleId: 'BatchWaybillReceive',
      },
      {
        moduleId: 'AutoSync',
      },
    ],
    type: 'Block',
  },
  {
    v: true,
    c: [
      {
        moduleId: 'PickupMode',
      },
      {
        moduleId: 'GoodsTime',
      },
      {
        moduleId: 'ArrivalTime',
        v: false,
      },

      {
        moduleId: 'PayMode',
      },

      {
        moduleId: 'ProductInfo',
      },

      {
        moduleId: 'OverAreaDelivery',
      },

      {
        moduleId: 'ServiceMode',
      },

      {
        moduleId: 'KaCustomerMap',
      },
    ],
    type: 'Block',
  },
  {
    v: true,
    c: [
      {
        moduleId: 'ReturnWaybill',
      },
    ],
    type: 'Block',
  },
  {
    v: true,
    c: [
      {
        moduleId: 'ProtectPrice',
      },

      {
        moduleId: 'AddedService',
      },

      {
        moduleId: 'Coupon',
      },

      {
        moduleId: 'BranchSelfPickUp',
      },
      {
        moduleId: 'PickupInformation',
      },

      {
        moduleId: 'DispatchInformation',
      },
      {
        v: false,
        moduleId: 'PickupInfo',
      },
      {
        v: false,
        moduleId: 'DeliveryInfo',
      },

      {
        moduleId: 'WaybillRemark',
      },

      {
        moduleId: 'MessageToDriver',
      },

      {
        moduleId: 'SelfSign',
      },

      {
        moduleId: 'WaybillSpecialEncrypt',
      },
    ],
    type: 'Block',
  },
  {
    v: false,
    c: [
      {
        moduleId: 'MoreModule',
        wrapClass: 'block-more-module',
        v: true,
      },
    ],
    type: 'Block',
  },
  {
    v: true,
    c: [
      {
        wrapClass: 'block-estimated-cost',
        moduleId: 'EstimatedCost',
        v: false,
      },
    ],
    type: 'Block',
  },
]

export const data = {
  goodsTime: {
    nightPickupFeeTips: '',
    aiGoodsTimeTips: '',
    strategyId: '',
    goodsTimeVo: {
      crmGoodsTimeConfig: {
        goodsTips: '',
        timeRange: {
          startDate: today.format('YYYY-MM-DD'),
          endDate: today.add(30, 'day').format('YYYY-MM-DD'),
          startTime: '',
          endTime: '',
          minuteStep: undefined,
          hourStep: undefined,
          timeBatch: [],
        },
      },
      erpGoodsTimeConfig: null,
    },
  },
}

export const module = {
  WaybillRemark: {
    v: false,
    required: false,
    config: {},
  },
  Coupon: {
    v: true,
    config: {},
  },
  GoodsTime: {
    v: true,
    config: '|online|currentTime|1|',
    required: true,
  },
  PickupMode: {
    v: false,
    config: '|',
    required: false,
  },
  KaCustomerMap: {
    v: true,
    required: false,
    config: {},
  },
  ProtectPrice: {
    v: false,
    required: false,
    config: {
      fieldsConfig: ['1|0'],
    },
  },
  MessageToDriver: {
    v: false,
    required: false,
    config: {},
  },
  Sender: {
    v: true,
    moduleStyle: 'page',
    config: {
      container: 'page',
      fieldsConfigType: 'fields',
      addressVisibleType: 'all',
      functionConfig: '1|1|1|1|1',
      exhibitionVisible: true,
      recommendByUserLocation: true,
      fieldsConfig: ['person|1|1|1', 'mobile|1|1|1', 'telephone|1|1|1', 'companyName|1|0|1', 'address|1|0|1|0'],
    },
    required: true,
  },
  PayMode: {
    v: true,
    required: true,
    config: {},
  },
  BranchSelfPickUp: {
    v: true,
    config: {},
    required: false,
  },
  AddedService: {
    v: false,
    moduleStyle: 'popup',
    config: {
      container: 'popup',
      fieldsConfig: ['recoveryReceipt|1|签回单', 'collectionPayment|1|代收货款', 'packageService|1|包装服务'],
    },
    required: false,
  },
  SelfSign: {
    v: true,
    config: {},
  },
  Banner: {
    v: false,
    config: {
      urls: [
        {
          url: '',
        },
      ],
    },
  },
  ProductInfo: {
    v: true,
    moduleStyle: 'popup',
    config: {
      container: 'popup',
      fieldsConfigType: 'fields',
      tip: '',
      fieldsConfig: [
        'cargoName|1|1|1|1',
        'pieceCount|1|1|1|1',
        'weightCount|1|1|1|1',
        'goodsVolume|1|1|1|0',
        'goodsSize|1|1|1|0',
      ],
    },
    required: true,
  },
  Receive: {
    v: true,
    moduleStyle: 'page',
    type: 'Receive',
    config: {
      container: 'page',
      fieldsConfigType: 'fields',
      addressVisibleType: 'all',
      functionConfig: '1|1|1|1|0',
      recommendByUserLocation: true,
      exhibitionVisible: true,
      fieldsConfig: ['person|1|1|1', 'mobile|1|1|1', 'telephone|1|1|1', 'companyName|1|1|1', 'address|1|1|1|0'],
    },
    required: true,
  },
  OrderSuccessPage: {
    v: true,
    config: {
      needShare: true,
      showBarcode: true,
      tipText: '',
    },
  },
  OverAreaDelivery: {
    v: true,
    config: {},
    required: false,
  },
  EstimatedCost: {
    v: false,
    config: {
      noNeedRead: false,
    },
    required: false,
  },
  OrderCustomer: {
    v: true,
    required: false,
    config: {},
  },
  ReturnWaybillAddress: {
    v: true,
    required: false,
    config: {},
  },
  AutoSync: {
    v: true,
    required: false,
    config: {},
  },
  ServiceMode: {
    v: true,
    config: {
      arrivalTimeVisible: false,
    },
    required: true,
  },
  ArrivalTime: {
    v: true,
  },
  DispatchInformation: {
    v: false,
    config: {
      fieldsConfig: ['deliveryData|1|0'],
    },
    required: false,
  },
  PickupInformation: {
    v: false,
    config: {
      fieldsConfig: ['picker|1|0', 'pickerMobile|1|0', 'pickerPhone|1|0', 'pickeData|1|0'],
    },
    required: false,
  },
  ReturnWaybill: {
    v: false,
    required: false,
    config: {},
  },
  WaybillNumber: {
    v: true,
    required: false,
    config: {},
  },
  BatchWaybillReceive: {
    v: false,
    required: false,
    config: {},
  },
  WaybillSpecialEncrypt: {
    v: true,
    config: {},
  },
  TemplateList: {
    v: true,
  },
  MoreModule: {
    v: true,
  },
}

export const config = {
  businessCheckConfig: {
    exitEntry: '10',
    paymentAuth: true,
    unboundCodeTip: true,
    switchCustomerCode: true,
  },
}

export const PAY_MODE = {
  visible: true,
  moduleStyle: '',
  type: 'PayMode',
  config: {
    active: true,
    fieldsConfig: [
      {
        visible: true,
        defaultValue: '',
        name: 'senderPay',
        label: '寄方付',
        useDefault: true,
        editable: false,
      },
      {
        visible: true,
        defaultValue: '',
        name: 'recipientPay',
        label: '收方付',
        useDefault: false,
        editable: true,
      },
      {
        visible: true,
        defaultValue: '',
        name: 'thirdPartyPay',
        label: '第三方付',
        useDefault: false,
        editable: true,
      },
    ],
  },
  required: true,
}

export const schema: Schema = {
  layout,
  data,
  module,
  config,
}
