/**
 * 网点查询-关键词联想地址信息 mock（web.order.address.findSuggest）
 * 入参：{ keyword?, city? }
 * 出参：{ count, message, request_id, status, data: [{ id, title, address, province, provinceId, adcode, city, cityId, location, category, district, county, countyId }] }
 */
const buildPoi = (province, city, district, name, detail) => ({
  id: `POI-${city}-${name}`,
  title: name,
  address: `${province}${city}${district}${detail}`,
  province,
  provinceId: `P-${province}`,
  adcode: 440305,
  city,
  cityId: `C-${city}`,
  location: { lng: 113.93041, lat: 22.53332 },
  category: '交通设施',
  district,
  county: district,
  countyId: `D-${district}`,
})

const poiList = [
  buildPoi('广东省', '深圳市', '南山区', '深圳湾公园', '滨海大道'),
  buildPoi('广东省', '深圳市', '南山区', '科技园', '科苑南路'),
  buildPoi('广东省', '深圳市', '南山区', '深圳大学', '南海大道'),
  buildPoi('广东省', '深圳市', '福田区', '市民中心', '福中三路'),
  buildPoi('广东省', '深圳市', '福田区', '莲花山公园', '红荔路'),
  buildPoi('广东省', '深圳市', '罗湖区', '东门步行街', '东门中路'),
  buildPoi('广东省', '广州市', '天河区', '正佳广场', '天河路'),
  buildPoi('广东省', '广州市', '天河区', '广州塔', '阅江西路'),
  buildPoi('浙江省', '杭州市', '西湖区', '黄龙体育中心', '黄龙路'),
  buildPoi('北京市', '北京市', '朝阳区', '朝阳公园', '朝阳公园南路'),
]

module.exports = {
  // 改为 false 后请求穿透 devServer 代理，走真实接口；改回 true 恢复本地 mock
  enable: false,
  // 函数形式：按入参 keyword/city 过滤
  data(body) {
    const keyword = (body && body.keyword ? String(body.keyword) : '').trim()
    const city = (body && body.city ? String(body.city) : '').trim()
    let list = poiList
    if (city) {
      list = list.filter((item) => item.city.includes(city))
    }
    if (keyword) {
      list = list.filter((item) => item.title.includes(keyword) || item.address.includes(keyword))
    }
    return {
      code: 0,
      msg: 'OK',
      success: true,
      data: { count: list.length, message: 'ok', request_id: 'mock', status: 0, data: list },
    }
  },
}
