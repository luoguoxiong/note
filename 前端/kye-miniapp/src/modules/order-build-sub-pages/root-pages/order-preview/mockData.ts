/* eslint-disable max-lines */
export const mockData = {
  module: {
    WaybillSpecialEncrypt: {
      required: false,
      config: { label: '运单加密', key: 'waybillSpecialEncrypt', checked: true, extendType: '', extends: [] },
    },
    GoodsTime: { config: '|custom|noGoodsTime|1|' },
    PickupMode: { v: true, required: true, config: '' },
    ProtectPrice: { v: true, config: {} },
    MessageToDriver: { v: true },
    Sender: {
      config: {
        addressVisibleType: 'name',
        functionConfig: '1|1|1|1|1|1',
        fieldsConfig: ['person|1|1|1|', 'mobile|1|1|1|', 'telephone|1|0|1|', 'companyName|1|0|1|', 'address|1|1|1|0'],
      },
    },
    PayMode: {
      config: { fieldsConfig: ['senderPay|1|寄方付||0', 'recipientPay|1|收方付||1', 'thirdPartyPay|1|第三方付||1'] },
    },
    BranchSelfPickUp: { config: { fieldsConfig: ['selfPickupBranch|1|0', 'homeDelivery|1|0'] } },
    AddedService: {
      v: true,
      config: {
        fieldsConfig: [
          'recoveryReceipt|1|签回单',
          'receiptProvider|1|回单提供方',
          'receiptCheckType|1|回单要求',
          'receiptUrgentReturn|1|是否加急返',
          'collectionPayment|1|代收货款',
          'packageService|1|包装服务',
          'dismantlingWoodenFrame|1|拆木架',
          'dispatchNotice|1|等通知派送',
        ],
      },
    },
    Banner: {
      v: true,
      config: {
        urls: [
          {
            url: 'https://api-uat.kyeapi.com/router/download/eam_place_order_config_banner_img_code/place_order_config173675815225098314/n4a264e4aaf51142a1ad27cd1c22f4b40d?params=45215b55de066081fdb3f74c82043acf9dbb38db8978d195fcf49aa82b31f65d',
          },
        ],
      },
    },
    ProductInfo: {
      moduleStyle: 'page',
      config: {
        container: 'page',
        tip: '<p><span style="color: rgb(255, 112, 109);">请如实申报，虚假申报（申报不一致，含违禁品等）责任自担</span></p>',
        fieldsConfig: [
          'cargoName|1|托寄物|1|1',
          'pieceCount|1|件数|1|1',
          'weightCount|1|重量|1|1',
          'goodsVolume|1|体积|1|0',
          'goodsSize|1|尺寸|1|0',
        ],
      },
    },
    Receive: {
      config: {
        name: '收件信息',
        addressVisibleType: 'name',
        recommendByUserLocation: false,
        fieldsConfig: ['person|1|1|1|', 'mobile|1|0|1|', 'telephone|1|0|1|', 'companyName|1|0|1|', 'address|1|1|1|0'],
      },
    },
    OrderSuccessPage: { config: { tipPlainText: '' } },
    OverAreaDelivery: { config: { fieldsConfig: ['selfPickupBranch|1|0', 'homeDelivery|1|0'] } },
    EstimatedCost: { v: true, config: {} },
    DispatchInformation: { v: true, config: {} },
    PickupInformation: {
      v: true,
      config: { fieldsConfig: ['picker|1|0|1', 'pickerMobile|1|0|1', 'pickerPhone|1|0|1', 'pickeData|1|0|1'] },
    },
  },
  config: {
    businessCheckConfig: {
      exitEntry: '20',
      paymentAuth: true,
      unboundCodeTip: true,
      switchCustomerCode: true,
      switchSendRecvInfo: true,
      estimatedShipping: true,
      coupon: true,
    },
    otherConfig: { uploadPickupInfo: true, uploadShippingInfo: true },
  },
  version: '2.0',
}
