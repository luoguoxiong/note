/**
 * @todo 维护常规下单配置
 * @description 兜底配置和表单
 */

import { OrderInfo } from '@order-public-sub-public/types'
import { schema } from './schema'
import { InitResponse } from '@order-public-sub-public/apis/types'
import { getWaybillSource } from '@order-public-sub-public/utils'

export { schema } from './schema'

// 默认表单
export const waybillInfo: OrderInfo = {
  id: '',
  waybillNumber: '',
  orderNo: '',
  qrCodeWaybillMask: '',
  waybillSource: '',
  waybillType: '',
  recorderName: '',
  travelerId: undefined,
  sliceAreaId: undefined,
  behaviorOption: undefined,
  approvalDescribe: '',
  auditState: undefined,
  authPersonName: '',
  auditId: '',
  authPersonPhone: '',
  waybillState: undefined,
  showLinkButton: false,
  orderPickupInfo: {
    person: '',
    phone: '',
    mobile: '',
    extension: '',
    orderRemark: '',
    bigGoodsFlag: undefined,
    bulkCargoFlag: '',
    roughlyCount: undefined,
    roughlyWeight: undefined,
    bulkCargoInfos: [],
    fileBizId: '',
    telephone: '',
    uploadNum: 0,
  },
  sender: {
    person: '',
    telephone: '',
    mobile: '',
    extension: '',
    province: '',
    city: '',
    county: '',
    fullAddress: '',
    detailAddress: '',
    supplierId: '',
    dayText: '',
    hourBetween: '',
    section: '',
    floor: '',
    roomNumber: '',
    uploadDeliveryCustomer: '',
    exhibitionCode: '',
    exhibitionNumber: '',
    exhibitionSiteNumber: '',
    delayTime: undefined,
    locationId: '',
    saveAddressFlag: '',
    locationName: '',
  },
  receive: {
    customerCode: '',
    companyName: '',
    person: '',
    telephone: '',
    mobile: '',
    extension: '',
    province: '',
    city: '',
    county: '',
    fullAddress: '',
    detailAddress: '',
    deliveryMode: undefined,
    locationName: '',
    locationId: '',
  },
  pickupMode: {
    pickupMode: undefined,
  },
  goodsTime: {
    goodsTime: '',
    goodsTimeFlag: undefined,
    urgentGoods: undefined,
  },
  payMode: {
    payMode: null,
    paymentAccount: '',
    payCustomerPass: '',
    paymentCustomerName: '',
    paymentCustomerCode: '',
    // authorizeStatus: 0,
    // noPayCustomerFlag: undefined,
  },
  productInfo: {
    productCode: '',
    goodsType: '',
    count: 0,
    actualWeight: undefined,
    volumeSize: undefined,
    preWaybillGoodsSizeList: [],
    matchList: [],
  },
  serviceMode: {
    serviceMode: null,
    serviceModeShowLimit: null,
  },
  kaCustomerMap: [],
  overAreaDelivery: {
    deliveryMode: undefined,
    superZoneFlag: undefined,
    selfPickupMobile: '',
    selfPickBranchId: '',
    selfPickBranchName: '',
  },
  branchSelfPickUp: {
    selfPickBranchId: '',
    selfPickBranchName: '',
    selfPickupMobile: '',
  },
  pickupInformation: {
    fileBizId: '',
  },
  dispatchInformation: {},
  protectPrice: {
    insuranceValueSource: undefined,
    declarativeValue: '',
  },
  addedService: {
    receiptFlag: undefined,
    receiptProvider: undefined,
    receiptCount: undefined,
    declarativeValue: undefined,
    collectionAmount: undefined,
    woodenFrame: undefined,
    goodsControl: undefined,
    dismantlingWoodenFrame: undefined,
  },
  coupon: {
    couponCode: '',
    oldCouponCode: '',
    afterDiscountAmount: undefined,
  },
  waybillRemark: {
    waybillRemark: '',
  },
  selfSign: {
    selfSignFlag: undefined,
  },
  version: '',
  messageToDriver: {
    orderRemark: '',
  },
  waybillId: '0',
  waybillSpecialEncrypt: {
    waybillSpecialEncryptType: false,
    waybillSpecialEncryptRules: [],
  },
}

export const defaultInitConfig: InitResponse = {
  batchId: '',
  userInfo: {
    name: '',
    nickName: '',
    phone: '',
  },
  bindCustomerCodeFlag: true,
  bindCustomerCodeBar: false,
  needBindCustomerCode: false,
  configDimension: {
    staticConfig: {
      configId: '',
      versionId: '',
      url: '',
      schema: schema,
      themeName: '常规兜底配置',
    },
    dynamicConfig: {
      sender: {
        visible: false,
        required: false,
        disabledInfos: [],
      },
      receive: {
        visible: false,
        required: false,
        disabledInfos: [],
      },
      behaviorOption: {
        visible: false,
        required: false,
        disabledInfos: [],
      },
      payMode: {
        visible: false,
        required: false,
        disabledInfos: [],
      },
      serviceMode: {
        visible: false,
        required: false,
        disabledInfos: [],
      },
      addedService: {
        visible: false,
        required: false,
        disabledInfos: [],
      },
      goodsTime: {
        visible: true,
        disabledInfos: [],
        required: true,
      },
      kaCustomerMap: {
        visible: false,
        required: false,
      },
      overAreaDelivery: {
        visible: false,
        required: false,
      },
      branchSelfPickUp: {
        visible: false,
        required: false,
      },
      selfSign: {
        visible: false,
        required: false,
      },
      estimatedCost: {
        visible: false,
        required: false,
      },
      coupon: {
        visible: false,
        required: false,
      },
      extractShow: {
        visible: false,
        required: false,
      },
      senderProjectLocation: {
        visible: false,
        required: false,
      },
      receiveExtractShow: {
        visible: false,
        required: false,
      },
      vipData: {
        visible: false,
        required: false,
      },
      sendInfoVo: {
        modifyShipperFlag: false,
        visible: false,
        required: false,
      },
      returnWaybill: {
        visible: false,
        disabledInfos: [],
        required: false,
      },
      receiveExtraInfo: {
        visible: false,
        disabledInfos: [],
        required: false,
      },
      senderExtraInfo: {
        visible: false,
        disabledInfos: [],
        required: false,
      },
      payModeExtraInfo: {
        visible: false,
        disabledInfos: [],
        required: false,
      },
      addedServiceExtraInfo: {
        visible: false,
        disabledInfos: [],
        required: false,
      },
      pickupModeExtraInfo: {
        visible: false,
        disabledInfos: [],
        required: false,
      },
      switchSendRecvInfoShowVo: {
        visible: false,
        disabledInfos: [],
        required: false,
      },
      waybillSpecialEncrypt: {
        visible: false,
        disabledInfos: [],
        required: false,
      },
      unifiedInfoSwitcher: {
        visible: false,
        required: false,
      },
      otherWoodFrameShowVo: {
        visible: false,
        required: false,
        disabled: true,
        otherWoodFrameList: [],
      },
    },
    unUsedFields: [],
  },
}
