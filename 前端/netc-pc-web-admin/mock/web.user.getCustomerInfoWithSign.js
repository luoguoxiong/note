/**
 * 客户信息查询 mock（web.user.getCustomerInfoWithSign）
 * 下单链路第一层「报废/拉黑」拦截的数据源（allowToOrderFlag/allowToOrderTip）
 */
module.exports = {
  enable: true,
  data: {
    code: 0,
    msg: '',
    data: {
      id: '10001',
      customerName: '小艺哥牛杂粉二',
      customerShortName: '小艺哥',
      customerType: '1',
      customerStatus: '20',
      // '10' 允许下单（继续走 getOrderTips 下单权限弹窗）
      // 测「报废/拉黑」拦截：改为 '20' → 弹 allowToOrderTip 文案（单按钮「我知道了」）
      allowToOrderFlag: '10',
      allowToOrderTip: '下单提示：您的账号已被拉黑，不允许下单，请联系商务',
      address: '',
      province: '',
      city: '',
      district: '',
      street: '',
      village: '',
      companyType: '',
      belongIndustry: '',
      marketName: '',
      assistantName: '',
      mainProduct: '',
      businessBrand: '',
      payMode: '',
      doorNumber: '',
    },
  },
}
