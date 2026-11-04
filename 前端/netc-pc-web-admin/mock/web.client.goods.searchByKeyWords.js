/**
 * 违禁品查询-物品关键字搜索 mock
 * 入参：{ goodsKeyWord, type, clientType }
 * 出参：{ goodsInfo, fuzzyGoodsList, buttonFlag }
 * 按 goodsKeyWord 对物品名称做模糊过滤，完全匹配时返回 goodsInfo
 */
const g = (
  goodsName,
  nature,
  transportType,
  transportName,
  transportDesc,
  firstCategory,
  id,
  customerHint = null
) => ({ goodsName, nature, transportType, transportName, transportDesc, packageTypes: null, firstCategory, id, customerHint })

const goodsList = [
  g('托寄物123', '易碎', 1, '可正常托寄', '该货物可正常收寄', '家用电器', 106637, '下单建议：需用纸箱和编织袋进行包装'),
  g('麻花人民币123', '危险品', 3, '陆运违禁品', '该货物为违禁品，无法承运，如有疑问请联系商务', '办公用品', 122279),
  g('充电宝', '易燃易爆', 2, '空运违禁品', '该货物禁止空运，可走陆运', '数码配件', 100861, '下单建议：单个不超过100Wh可走陆运'),
  g('手机', '普通', 1, '可正常托寄', '该货物可正常收寄', '数码配件', 100862),
  g('香水', '易燃液体', 2, '空运违禁品', '该货物禁止空运，可走陆运', '个护美妆', 100863, '下单建议：需做好防漏包装'),
  g('酒精', '危险品', 3, '陆运违禁品', '该货物为违禁品，无法承运，如有疑问请联系商务', '日用品', 100864),
  g('笔记本电脑', '易碎', 1, '可正常托寄', '该货物可正常收寄', '数码配件', 100865, '下单建议：需用纸箱加固包装'),
  g('白酒', '易燃液体', 2, '空运违禁品', '该货物禁止空运，可走陆运', '食品饮料', 100866, '下单建议：53度以上无法收寄'),
  g('电池', '易燃易爆', 2, '空运违禁品', '该货物禁止空运，可走陆运', '数码配件', 100867, '下单建议：需绝缘包装并单独申报'),
  g('电饭煲', '易碎', 1, '可正常托寄', '该货物可正常收寄', '家用电器', 100868),
  g('电动玩具', '普通', 1, '可正常托寄', '该货物可正常收寄', '玩具母婴', 100869, '下单建议：需取出电池分开包装'),
  g('移动电源', '易燃易爆', 2, '空运违禁品', '该货物禁止空运，可走陆运', '数码配件', 100870),
  g('电水壶', '易碎', 1, '可正常托寄', '该货物可正常收寄', '家用电器', 100871),
  g('电动车', '危险品', 3, '陆运违禁品', '该货物为违禁品，无法承运，如有疑问请联系商务', '交通工具', 100872),
  g('电吹风', '普通', 1, '可正常托寄', '该货物可正常收寄', '家用电器', 100873),
  g('打火机', '易燃易爆', 3, '陆运违禁品', '该货物为违禁品，无法承运，如有疑问请联系商务', '日用品', 100874),
  g('手机壳', '普通', 1, '可正常托寄', '该货物可正常收寄', '数码配件', 100875),
  g('米酒', '易燃液体', 2, '空运违禁品', '该货物禁止空运，可走陆运', '食品饮料', 100876),
]

module.exports = {
  enable: true,
  data(body) {
    const keyword = (body && body.goodsKeyWord) || ''
    const kw = keyword.toLowerCase()
    const matched = kw
      ? goodsList.filter((item) => item.goodsName.toLowerCase().includes(kw))
      : goodsList

    return {
      code: 0,
      msg: '成功',
      data: {
        goodsInfo: matched.find((item) => item.goodsName === keyword) || null,
        fuzzyGoodsList: matched,
        buttonFlag: 1,
      },
      success: true,
    }
  },
}
