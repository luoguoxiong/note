/**
 * 违禁品查询-最近搜索记录 mock
 * 接口：web.client.forbidden.latestRecord
 * 出参：最近查询的关键词列表，按查询时间倒序（新的在前），最多 20 条
 */
const latestKeywords = [
  '大闸蟹',
  '电池',
  '大疆无人机',
  '水产',
  '水果',
  '文件',
  '铅笔',
  '本子',
  '充电宝',
  '白酒',
  '香水',
  '打火机',
  '酒精',
  '电动车',
  '笔记本电脑',
  '手机',
  '移动电源',
  '电水壶',
  '电吹风',
  '米酒',
]

module.exports = {
  enable: true,
  data() {
    return {
      code: 0,
      msg: '成功',
      data: latestKeywords.slice(0, 20),
      success: true,
    }
  },
}
