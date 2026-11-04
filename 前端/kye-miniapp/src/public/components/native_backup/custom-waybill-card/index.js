Component({
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    baseInfo: { type: Object, value: {} },
    delivery: { type: Object, value: {} },
    pickup: { type: Object, value: {} },
    newExteriorRouteInfo: { type: Object, value: {} },
    functionInfo: { type: Object, value: {} },
    tipsInfo: { type: Object, value: {} },
    isWaybill: { type: Boolean, value: false },

    // 可选性：父层如果要传 slot html 片段（富文本）可用
    headLeftHtml: { type: String, value: '' },
    headRightHtml: { type: String, value: '' },
    cardInfoLeftHtml: { type: String, value: '' },
    cardContentHtml: { type: String, value: '' },
    cardBottomHtml: { type: String, value: '' },

    // 兼容：tags 可以由父层传入 km 简化 ky-tag
    tags: { type: Array, value: [] },
  },
  data: {
    tipsVisible: true,
    STAMP_IMAGE_DIC: {
      // 仅示例，完整放到 constant 中或外部传入
      0: '',
    },
  },
  observers: {
    'newExteriorRouteInfo, baseInfo': function (newExteriorRouteInfo, baseInfo) {
      // 可以在这里计算 transportImage/timeInfo，或用属性由父层提供（推荐）
      // minimal local computed:
      this.setData({
        transportImage: this._computeTransportImage(newExteriorRouteInfo),
        timeInfo: this._computeTimeInfo(baseInfo),
      })
    },
  },
  methods: {
    noop() {},
    copyText() {
      const txt = (this.data.baseInfo && (this.data.baseInfo.waybillNumber || this.data.baseInfo.orderNumber)) || ''
      if (txt) {
        wx.setClipboardData({ data: txt })
      }
    },
    handleTips() {
      if (Number(this.data.tipsInfo?.showWatermarkType) === 1) {
        this.triggerEvent('limitRemind', {})
      }
    },
    labelClick() {
      const label = this.data.functionInfo?.showLabelFlag?.showText || ''
      this.triggerEvent('labelClick', { label })
    },
    applyStatusClick() {
      this.triggerEvent('applyStatusClick', {})
    },
    _computeTransportImage(newExteriorRouteInfo) {
      const routeStep = Number(newExteriorRouteInfo?.routeStep)
      switch (routeStep) {
        case 0:
        case 10:
        case 20:
        case 30:
        case 90:
          return 'https://ic-img.ky-express.com/netc/20221024_24751702280_!!1666594467845_207_21.png'
        case 70:
          return 'https://ic-img.ky-express.com/netc/20221024_26651702265_!!1666594452088_207_21.png'
        case 80:
          return 'https://ic-img.ky-express.com/netc/20221024_6755170220_!!1666594418055_207_21.png'
        default:
          return 'https://ic-img.ky-express.com/netc/20221024_89051702247_!!1666594380930_207_21.png'
      }
    },
    _computeTimeInfo(baseInfo) {
      const waybillStatus = baseInfo?.waybillStatus
      // minimal formatting — 建议父层直接传好格式化后的 timeInfo
      if (waybillStatus === 10 || waybillStatus === 20) return { name: '货好时间：', time: baseInfo?.goodsTime || '' }
      if (waybillStatus === 30) return { name: '寄件时间：', time: baseInfo?.deliveryTime || '' }
      if (waybillStatus === 40) return { name: '签收时间：', time: baseInfo?.receiveTime || '' }
      return { name: '', time: '' }
    },
  },
})
