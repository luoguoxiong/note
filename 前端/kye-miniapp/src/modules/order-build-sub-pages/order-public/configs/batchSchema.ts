import { SchemaLayout } from '@order-public-sub-public/types'

export const batchSchemaLayout: SchemaLayout[] = [
  {
    type: 'Block',
    v: true,
    c: [
      {
        moduleId: 'BatchOrderCustomer',
        type: 'BatchOrderCustomer',
      },
    ],
  },
  {
    type: 'Block',
    v: true,
    c: [
      {
        moduleId: 'BatchSection',
        type: 'BatchSection',
      },
    ],
  },
  {
    type: 'Block',
    v: true,
    c: [
      {
        moduleId: 'SendInfoStand',
        type: 'SendInfoStand',
      },
    ],
  },
  {
    type: 'Block',
    v: true,
    c: [
      {
        moduleId: 'BatchWaybillList',
        type: 'BatchWaybillList',
      },
    ],
  },
  {
    type: 'Block',
    v: true,
    c: [
      {
        moduleId: 'BatchAddReceive',
        type: 'BatchAddReceive',
      },
    ],
  },
]

export const batchSchemaModule = {
  OrderCustomer: {
    v: true,
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
  PayMode: {
    v: true,
    required: true,
    config: {},
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
  PickupInformation: {
    v: false,
    config: {
      fieldsConfig: ['picker|1|0', 'pickerMobile|1|0', 'pickerPhone|1|0', 'pickeData|1|0'],
    },
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
  BatchOrderCustomer: {
    v: true,
    required: true,
    config: {},
  },
  BatchSection: {
    v: true,
    required: true,
    config: {},
  },
  SendInfoStand: {
    v: true,
    required: true,
    config: {},
  },
  BatchWaybillList: {
    v: true,
    required: true,
    config: {},
  },
  BatchAddReceive: {
    v: true,
    required: true,
    config: {},
  },
  BatchWaybillReceive: {
    v: false,
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
}

export const batchSchema = {
  layout: batchSchemaLayout,
  module: batchSchemaModule,
  data: {},
  config: {},
}
