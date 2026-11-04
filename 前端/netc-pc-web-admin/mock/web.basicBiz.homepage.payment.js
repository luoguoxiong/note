module.exports = {
  enable: true, // 是否启用
  data: {
    code: 0,
    msg: 'OK',
    data: {
      paymentVO: {
        waybillNumber: 'KY5000286069203',
        serviceMethod: '次日达',
        orgInMonth: '2024-05',
        deliveryTime: '1715832060000',
        deliveryCity: '东莞市',
        sender: '钟袁',
        pickupCity: '成都市',
        receiver: '扎人',
        unPaidAmt: '255.0',
        netReceiptsAmt: '255.0',
        billType: 1,
        payMode: '现结',
        waybillCount: null,
        directUrl:
          'https://invoice-manager-dev.ky-express.com/pc-fms-online-settlement-h5/?queryNumber=KY5000286069203',
        moreDirectUrl: 'https://invoice-manager-dev.ky-express.com/pc-fms-online-settlement-h5/?',
      },
      payAuthCount: null,
      payAuthList: null,
      authApprovalCount: null,
      authApprovalList: null,
      wayBillApprovalCount: null,
      wayBillApprovalList: null,
      locateTo: 'PAYMENT',
    },
    traceId: '1a4810d212a128211b3aaf20b088f1a9',
    success: true,
  },
}
