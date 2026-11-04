/**
 * 网点查询-热门城市列表 mock（web.order.address.hotCityNameList）
 * 入参：无
 * 出参：[{ id, title, provinceId }]（id 与 provinceId 对应 mapAddressSearch 的市/省 ID 体系）
 */
module.exports = {
  // 改为 false 后请求穿透 devServer 代理，走真实接口；改回 true 恢复本地 mock
  enable: false,
  data: {
    code: 0,
    msg: 'OK',
    success: true,
    data: [
      { id: 'XZ2-1', title: '北京', provinceId: 'XZ1-1' },
      { id: 'XZ2-9', title: '上海', provinceId: 'XZ1-9' },
      { id: 'XZ2-191', title: '广州', provinceId: 'XZ1-19' },
      { id: 'XZ2-197', title: '深圳', provinceId: 'XZ1-19' },
      { id: 'XZ2-111', title: '杭州', provinceId: 'XZ1-11' },
      { id: 'XZ2-231', title: '成都', provinceId: 'XZ1-23' },
      { id: 'XZ2-171', title: '武汉', provinceId: 'XZ1-17' },
      { id: 'XZ2-101', title: '南京', provinceId: 'XZ1-10' },
      { id: 'XZ2-271', title: '西安', provinceId: 'XZ1-27' },
      { id: 'XZ2-22', title: '重庆', provinceId: 'XZ1-22' },
      { id: 'XZ2-2', title: '天津', provinceId: 'XZ1-2' },
      { id: 'XZ2-151', title: '济南', provinceId: 'XZ1-15' },
    ],
  },
}
