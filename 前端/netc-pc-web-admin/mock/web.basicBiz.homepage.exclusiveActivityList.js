module.exports = {
  enable: true, // 是否启用
  data: {
    code: 0,
    msg: 'OK',
    data: [
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
    traceId: '0a3faaedb8daa65356a75c5ac908798c',
    success: true,
  },
}
