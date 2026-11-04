const mock = {
  enable: true, // 是否启用
  data: {
    code: 0,
    msg: 'OK',
    data: {
      oldUser: 0,
      showLogistics: true,
      showBusiness: true,
      showPayment: true,
      showPayAuth: true,
      showAuth: true,
      showWaybill: true,
      logisticsOverview: {
        logisticsOverviewVO: {
          notifyPickupCount: 3,
          notifyPickupSource: 1,
          notifyPickupUrl: '/admin/waybill/list?tab=notifyPickup',
          pendingItemsCount: 5,
          pendingItemsSource: 1,
          pendingItemsUrl: '/admin/waybill/list?tab=pendingPickup',
          signCount: 2,
          signSource: 1,
          signUrl: '/admin/waybill/list?tab=pendingSign',
          signedCount: 128,
          signedSource: 1,
          signedUrl: '/admin/waybill/list?tab=signed',
        },
        logisticsOverview: {
          pendingReceiveCount: 8,
          pendingReceiveSource: 1,
          pendingReceiveUrl: '/admin/waybill/list?tab=pendingReceive',
          pendingSignCount: 4,
          pendingSignSource: 0,
          pendingSignUrl: '',
        },
      },
      businessOverview: [
        {
          totalVotes: '356',
          totalPieces: '1024',
          detailVotes: [
            { dataTime: '2026-09-01', count: '42' },
            { dataTime: '2026-09-02', count: '51' },
            { dataTime: '2026-09-03', count: '38' },
          ],
          detailPieces: [
            { dataTime: '2026-09-01', count: '130' },
            { dataTime: '2026-09-02', count: '165' },
            { dataTime: '2026-09-03', count: '112' },
          ],
          type: 1,
          locateTo: true,
          viewMoreUrl: '/admin/waybill/statistics?type=1',
        },
        {
          totalVotes: '98',
          totalPieces: '260',
          detailVotes: [
            { dataTime: '2026-09-01', count: '11' },
            { dataTime: '2026-09-02', count: '9' },
          ],
          detailPieces: [
            { dataTime: '2026-09-01', count: '30' },
            { dataTime: '2026-09-02', count: '26' },
          ],
          type: 2,
          locateTo: false,
          viewMoreUrl: '/admin/waybill/statistics?type=2',
        },
      ],
      pendingItems: {
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
        payAuthCount: 232,
        payAuthList: [
          {
            authType: 30,
            id: 3865,
            batchNo: '153539961444865227',
            applyCustomerName: '杭州圣依',
            applyCustomerCode: '057101966677',
            recipientCustomerName: '小易海味',
            payCustomerName: '杭州圣依',
            applyName: '',
            applyMobile: '13299999999',
            isEmpApply: 0,
            applyDate: '2022/05/19',
            payCustomerCode: '057101966677',
            waybillCount: 29,
            authLevel: 10,
            agreeUrl: '/admin/permission-manage?id=3865&operateType=1',
            rejectUrl: '/admin/permission-manage?id=3865&operateType=2',
            detailsUrl: '/admin/permission-manage?id=3865&operateType=3',
          },
          {
            authType: 30,
            id: 3869,
            batchNo: '153539972107872095',
            applyCustomerName: '杭州圣依',
            applyCustomerCode: '057101966677',
            recipientCustomerName: '小易海味',
            payCustomerName: '杭州圣依',
            applyName: '',
            applyMobile: '13299999999',
            isEmpApply: 0,
            applyDate: '2022/05/19',
            payCustomerCode: '057101966677',
            waybillCount: 1,
            authLevel: 10,
            agreeUrl: '/admin/permission-manage?id=3869&operateType=1',
            rejectUrl: '/admin/permission-manage?id=3869&operateType=2',
            detailsUrl: '/admin/permission-manage?id=3869&operateType=3',
          },
          {
            authType: 30,
            id: 6395,
            batchNo: '154009961185025784',
            applyCustomerName: '惠州嘉腾',
            applyCustomerCode: '075211139610',
            recipientCustomerName: '杭州圣依',
            payCustomerName: '杭州圣依',
            applyName: '真的好',
            applyMobile: '15112266012',
            isEmpApply: 0,
            applyDate: '2022/11/05',
            payCustomerCode: '057101966677',
            waybillCount: 1,
            authLevel: 10,
            agreeUrl: '/admin/permission-manage?id=6395&operateType=1',
            rejectUrl: '/admin/permission-manage?id=6395&operateType=2',
            detailsUrl: '/admin/permission-manage?id=6395&operateType=3',
          },
          {
            authType: 30,
            id: 7693,
            batchNo: '154112201103040479',
            applyCustomerName: '惠州嘉腾',
            applyCustomerCode: '075211139610',
            recipientCustomerName: '杭州圣依',
            payCustomerName: '杭州圣依',
            applyName: '快点快点快',
            applyMobile: '13933334444',
            isEmpApply: 0,
            applyDate: '2022/12/12',
            payCustomerCode: '057101966677',
            waybillCount: 2,
            authLevel: 10,
            agreeUrl: '/admin/permission-manage?id=7693&operateType=1',
            rejectUrl: '/admin/permission-manage?id=7693&operateType=2',
            detailsUrl: '/admin/permission-manage?id=7693&operateType=3',
          },
          {
            authType: 30,
            id: 7917,
            batchNo: '154123013847904365',
            applyCustomerName: '自动化测试新增后台助理转外3681958',
            applyCustomerCode: '055632767279',
            recipientCustomerName: '杭州圣依',
            payCustomerName: '杭州圣依',
            applyName: '五七',
            applyMobile: '15112686666',
            isEmpApply: 0,
            applyDate: '2022/12/16',
            payCustomerCode: '057101966677',
            waybillCount: 10,
            authLevel: 10,
            agreeUrl: '/admin/permission-manage?id=7917&operateType=1',
            rejectUrl: '/admin/permission-manage?id=7917&operateType=2',
            detailsUrl: '/admin/permission-manage?id=7917&operateType=3',
          },
          {
            authType: 30,
            id: 7961,
            batchNo: '154130721797984800',
            applyCustomerName: '咕嘟咕嘟',
            applyCustomerCode: '075530112951',
            recipientCustomerName: '杭州圣依',
            payCustomerName: '杭州圣依',
            applyName: '快点快点快',
            applyMobile: '13933334444',
            isEmpApply: 0,
            applyDate: '2022/12/19',
            payCustomerCode: '057101966677',
            waybillCount: 1,
            authLevel: 10,
            agreeUrl: '/admin/permission-manage?id=7961&operateType=1',
            rejectUrl: '/admin/permission-manage?id=7961&operateType=2',
            detailsUrl: '/admin/permission-manage?id=7961&operateType=3',
          },
          {
            authType: 30,
            id: 7975,
            batchNo: '154131313062017246',
            applyCustomerName: '周六002',
            applyCustomerCode: '02023015721',
            recipientCustomerName: '杭州圣依',
            payCustomerName: '杭州圣依',
            applyName: '五七',
            applyMobile: '15112686666',
            isEmpApply: 0,
            applyDate: '2022/12/19',
            payCustomerCode: '057101966677',
            waybillCount: 1,
            authLevel: 10,
            agreeUrl: '/admin/permission-manage?id=7975&operateType=1',
            rejectUrl: '/admin/permission-manage?id=7975&operateType=2',
            detailsUrl: '/admin/permission-manage?id=7975&operateType=3',
          },
          {
            authType: 30,
            id: 7989,
            batchNo: '154131505203457977',
            applyCustomerName: '武汉东亚',
            applyCustomerCode: '02782635525',
            recipientCustomerName: '杭州圣依',
            payCustomerName: '杭州圣依',
            applyName: '图图',
            applyMobile: '15582301502',
            isEmpApply: 0,
            applyDate: '2022/12/19',
            payCustomerCode: '057101966677',
            waybillCount: 1,
            authLevel: 10,
            agreeUrl: '/admin/permission-manage?id=7989&operateType=1',
            rejectUrl: '/admin/permission-manage?id=7989&operateType=2',
            detailsUrl: '/admin/permission-manage?id=7989&operateType=3',
          },
          {
            authType: 30,
            id: 11299,
            batchNo: '154297143935616553',
            applyCustomerName: '惠州嘉腾',
            applyCustomerCode: '075211139610',
            recipientCustomerName: '杭州圣依',
            payCustomerName: '杭州圣依',
            applyName: '真的好',
            applyMobile: '15112266012',
            isEmpApply: 0,
            applyDate: '2022/12/23',
            payCustomerCode: '057101966677',
            waybillCount: 0,
            authLevel: 10,
            agreeUrl: '/admin/permission-manage?id=11299&operateType=1',
            rejectUrl: '/admin/permission-manage?id=11299&operateType=2',
            detailsUrl: '/admin/permission-manage?id=11299&operateType=3',
          },
          {
            authType: 30,
            id: 12785,
            batchNo: '154364384236805347',
            applyCustomerName: '深圳艺博',
            applyCustomerCode: '089829997369',
            recipientCustomerName: '杭州圣依',
            payCustomerName: '杭州圣依测试',
            applyName: '积分恶霸',
            applyMobile: '15112266012',
            isEmpApply: 0,
            applyDate: '2023/03/13',
            payCustomerCode: '057101966677',
            waybillCount: 1,
            authLevel: 10,
            agreeUrl: '/admin/permission-manage?id=12785&operateType=1',
            rejectUrl: '/admin/permission-manage?id=12785&operateType=2',
            detailsUrl: '/admin/permission-manage?id=12785&operateType=3',
          },
          {
            authType: 30,
            id: 12824,
            batchNo: '154368464677701133',
            applyCustomerName: '深圳艺博',
            applyCustomerCode: '089829997369',
            recipientCustomerName: '杭州圣依测试',
            payCustomerName: '杭州圣依测试',
            applyName: '积分恶霸',
            applyMobile: '15112266012',
            isEmpApply: 0,
            applyDate: '2023/03/15',
            payCustomerCode: '057101966677',
            waybillCount: 1,
            authLevel: 10,
            agreeUrl: '/admin/permission-manage?id=12824&operateType=1',
            rejectUrl: '/admin/permission-manage?id=12824&operateType=2',
            detailsUrl: '/admin/permission-manage?id=12824&operateType=3',
          },
        ],
        authApprovalCount: null,
        authApprovalList: null,
        wayBillApprovalCount: 1,
        wayBillApprovalList: [
          {
            id: 18511,
            waybillNumber: 'KY5000286045838',
            sendCity: '北京市',
            receiveCity: '杭州市',
            sendName: '杨梓桐',
            receiveName: '毛毛虫',
            sendCustomer: '上海思纬生物科技有限公司',
            receiveCustomer: '深圳美女仙女',
            serviceMode: '省内次日',
            goodTime: '1716430500000',
            forecastCost: null,
            disPlayForecastCost: true,
            placeOrderName: null,
            placeOrderPhone: '17792803216',
            viewMoreUrl: '/admin/permission-manage?activeTab=20',
            agreeUrl: '/admin/permission-manage?activeTab=20&id=18511&operateType=1',
            rejectUrl: '/admin/permission-manage?activeTab=20&id=18511&operateType=2',
            detailsUrl: '/admin/permission-manage?activeTab=20&id=18511&operateType=3',
          },
        ],
        locateTo: 'PAYMENT',
      },
      applyInfo: {
        resourceFlag: '20',
        activityList: [
          {
            id: 5001,
            code: 'ACT_NEW_2026Q3',
            realPushStart: 1756656000000,
            realPushEnd: 1759324800000,
            status: 1,
            couponInfoList: [
              {
                activityId: 5001,
                type: 1,
                reliefForm: 1,
                code: 'CP20260907001',
                amount: 20,
                reliefLimit: 100,
                discountRate: 0,
                ticketNumber: 2,
                couponDesc: '新客首单立减20元，最高减免100元',
              },
            ],
          },
        ],
      },
      activityList: [
        {
          id: 1,
          code: 'MOCK_TWO_COUPON_PACKAGE',
          couponInfoList: [
            {
              /**活动ID */
              activityId: 1,
              /**优惠券类型;CRM营销中台-优惠券类型（crm_marketing_coupon_info_type） 10-账单券 20-下单券 30-代金券 */
              type: 20,
              /**优惠券编码；，格式：YHQ+年月日（系统当前日期）+4位数（默认0001开始递增），如：YHQ20211011-0001 */
              code: 'MOCK_DISCOUNT_66',
              /**券面金额;建议直接以厘为单位保存 */
              amount: 0,
              /**奖券数量 */
              ticketNumber: 2,
              /**优惠券描述 */
              couponDesc: '最高抵66元',
              /**优惠金额 */
              discountAmount: 66,
              discountRate: 6.6,
              reliefForm: 20,
            },
            {
              /**活动ID */
              activityId: 1,
              /**优惠券类型;CRM营销中台-优惠券类型（crm_marketing_coupon_info_type） 10-账单券 20-下单券 30-代金券 */
              type: 30,
              /**优惠券编码；，格式：YHQ+年月日（系统当前日期）+4位数（默认0001开始递增），如：YHQ20211011-0001 */
              code: 'MOCK_DIRECT_20',
              /**券面金额;建议直接以厘为单位保存 */
              amount: 20,
              /**奖券数量 */
              ticketNumber: 3,
              /**优惠券描述 */
              couponDesc: '无门槛直减20元',
              /**优惠金额 */
              discountAmount: 20,
              discountRate: 0,
              reliefForm: 30,
            },
          ],
          isGet: false,
        },
        {
          id: 2,
          code: 'MOCK_MULTI_COUPON_PACKAGE',
          couponInfoList: [
            {
              /**活动ID */
              activityId: 2,
              /**优惠券类型;CRM营销中台-优惠券类型（crm_marketing_coupon_info_type） 10-账单券 20-下单券 30-代金券 */
              type: 20,
              /**优惠券编码；，格式：YHQ+年月日（系统当前日期）+4位数（默认0001开始递增），如：YHQ20211011-0001 */
              code: 'MOCK_DISCOUNT_75',
              /**券面金额;建议直接以厘为单位保存 */
              amount: 0,
              /**奖券数量 */
              ticketNumber: 2,
              /**优惠券描述 */
              couponDesc: '最高抵50元',
              /**优惠金额 */
              discountAmount: 50,
              discountRate: 7.5,
              reliefForm: 20,
            },
            {
              /**活动ID */
              activityId: 2,
              /**优惠券类型;CRM营销中台-优惠券类型（crm_marketing_coupon_info_type） 10-账单券 20-下单券 30-代金券 */
              type: 30,
              /**优惠券编码；，格式：YHQ+年月日（系统当前日期）+4位数（默认0001开始递增），如：YHQ20211011-0001 */
              code: 'MOCK_DIRECT_10',
              /**券面金额;建议直接以厘为单位保存 */
              amount: 10,
              /**奖券数量 */
              ticketNumber: 3,
              /**优惠券描述 */
              couponDesc: '无门槛直减10元',
              /**优惠金额 */
              discountAmount: 10,
              discountRate: 0,
              reliefForm: 30,
            },
            {
              /**活动ID */
              activityId: 2,
              /**优惠券类型;CRM营销中台-优惠券类型（crm_marketing_coupon_info_type） 10-账单券 20-下单券 30-代金券 */
              type: 10,
              /**优惠券编码；，格式：YHQ+年月日（系统当前日期）+4位数（默认0001开始递增），如：YHQ20211011-0001 */
              code: 'MOCK_FULL_REDUCTION_20',
              /**券面金额;建议直接以厘为单位保存 */
              amount: 20,
              /**奖券数量 */
              ticketNumber: 1,
              /**优惠券描述 */
              couponDesc: '每满100元减20元',
              /**优惠金额 */
              discountAmount: 20,
              discountRate: 0,
              reliefForm: 10,
            },
          ],
          isGet: false,
        },
        {
          id: 3,
          code: 'MOCK_MERGED_SINGLE_COUPON',
          couponInfoList: [
            {
              /**活动ID */
              activityId: 3,
              /**优惠券类型;CRM营销中台-优惠券类型（crm_marketing_coupon_info_type） 10-账单券 20-下单券 30-代金券 */
              type: 30,
              /**优惠券编码；，格式：YHQ+年月日（系统当前日期）+4位数（默认0001开始递增），如：YHQ20211011-0001 */
              code: 'MOCK_DIRECT_20_A',
              /**券面金额;建议直接以厘为单位保存 */
              amount: 20,
              /**奖券数量 */
              ticketNumber: 2,
              /**优惠券描述 */
              couponDesc: '无门槛直减20元',
              /**优惠金额 */
              discountAmount: 20,
              discountRate: 0,
              reliefForm: 30,
            },
            {
              /**活动ID */
              activityId: 3,
              /**优惠券类型;CRM营销中台-优惠券类型（crm_marketing_coupon_info_type） 10-账单券 20-下单券 30-代金券 */
              type: 30,
              /**优惠券编码；，格式：YHQ+年月日（系统当前日期）+4位数（默认0001开始递增），如：YHQ20211011-0001 */
              code: 'MOCK_DIRECT_20_B',
              /**券面金额;建议直接以厘为单位保存 */
              amount: 20,
              /**奖券数量 */
              ticketNumber: 3,
              /**优惠券描述 */
              couponDesc: '无门槛直减20元',
              /**优惠金额 */
              discountAmount: 20,
              discountRate: 0,
              reliefForm: 30,
            },
          ],
          isGet: false,
        },
        {
          id: 4,
          code: 'MOCK_RECEIVED_COUPON',
          couponInfoList: [
            {
              /**活动ID */
              activityId: 4,
              /**优惠券类型;CRM营销中台-优惠券类型（crm_marketing_coupon_info_type） 10-账单券 20-下单券 30-代金券 */
              type: 20,
              /**优惠券编码；，格式：YHQ+年月日（系统当前日期）+4位数（默认0001开始递增），如：YHQ20211011-0001 */
              code: 'MOCK_RECEIVED_DISCOUNT_85',
              /**券面金额;建议直接以厘为单位保存 */
              amount: 0,
              /**奖券数量 */
              ticketNumber: 1,
              /**优惠券描述 */
              couponDesc: '满100元可用',
              /**优惠金额 */
              discountAmount: 0,
              discountRate: 8.5,
              reliefForm: 20,
            },
          ],
          isGet: true,
        },
      ],
    },
    traceId: 'mock-trace-id',
    success: true,
  },
}

// searchType 只返回对应场景，便于验证局部刷新不会清空其他模块。
module.exports = {
  enable: mock.enable,
  data: ({ searchType } = {}) => {
    const fullData = mock.data.data
    const pending = fullData.pendingItems || {}
    let data
    switch (searchType) {
      case '10':
        data = {
          showLogistics: fullData.showLogistics,
          showBusiness: fullData.showBusiness,
          logisticsOverview: fullData.logisticsOverview,
          businessOverview: fullData.businessOverview,
        }
        break
      case '20':
        data = { showPayment: fullData.showPayment, pendingItems: { paymentVO: pending.paymentVO } }
        break
      case '30':
        data = {
          showPayAuth: fullData.showPayAuth,
          pendingItems: { payAuthList: pending.payAuthList, payAuthCount: pending.payAuthCount },
        }
        break
      case '40':
        data = {
          showAuth: fullData.showAuth,
          pendingItems: { authApprovalList: pending.authApprovalList, authApprovalCount: pending.authApprovalCount },
        }
        break
      case '50':
        data = {
          showWaybill: fullData.showWaybill,
          pendingItems: {
            wayBillApprovalList: pending.wayBillApprovalList,
            wayBillApprovalCount: pending.wayBillApprovalCount,
          },
        }
        break
      default:
        data = fullData
    }
    return { ...mock.data, data }
  },
}
