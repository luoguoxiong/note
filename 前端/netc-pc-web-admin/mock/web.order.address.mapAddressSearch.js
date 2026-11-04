/**
 * 网点查询-省市区联想 mock（web.order.address.mapAddressSearch）
 * 入参：{ keyword?, city? }（keyword 按地区名称模糊过滤）
 * 出参：{ keyWord, districtVOList: [{ level, provinceId, province, cityId, city, countyId, county, districtName }] }
 */
const p = (districtID, districtName) => ({ districtID, districtName })

/** 省列表 */
const provinces = [
  p('XZ1-1', '北京市'),
  p('XZ1-2', '天津市'),
  p('XZ1-3', '河北省'),
  p('XZ1-4', '山西省'),
  p('XZ1-5', '内蒙古自治区'),
  p('XZ1-6', '辽宁省'),
  p('XZ1-7', '吉林省'),
  p('XZ1-8', '黑龙江省'),
  p('XZ1-9', '上海市'),
  p('XZ1-10', '江苏省'),
  p('XZ1-11', '浙江省'),
  p('XZ1-12', '安徽省'),
  p('XZ1-13', '福建省'),
  p('XZ1-14', '江西省'),
  p('XZ1-15', '山东省'),
  p('XZ1-16', '河南省'),
  p('XZ1-17', '湖北省'),
  p('XZ1-18', '湖南省'),
  p('XZ1-19', '广东省'),
  p('XZ1-20', '广西壮族自治区'),
  p('XZ1-21', '海南省'),
  p('XZ1-22', '重庆市'),
  p('XZ1-23', '四川省'),
  p('XZ1-24', '贵州省'),
  p('XZ1-25', '云南省'),
  p('XZ1-26', '西藏自治区'),
  p('XZ1-27', '陕西省'),
  p('XZ1-28', '甘肃省'),
  p('XZ1-29', '青海省'),
  p('XZ1-30', '宁夏回族自治区'),
  p('XZ1-31', '新疆维吾尔自治区'),
]

/** 市/区列表（key: 父级 districtID） */
const subListMap = {
  // 直辖市
  'XZ1-1': [p('XZ2-1', '北京市')],
  'XZ1-2': [p('XZ2-2', '天津市')],
  'XZ1-9': [p('XZ2-9', '上海市')],
  'XZ1-22': [p('XZ2-22', '重庆市')],
  // 华北/东北
  'XZ1-3': [p('XZ2-31', '石家庄市'), p('XZ2-32', '唐山市')],
  'XZ1-4': [p('XZ2-41', '太原市'), p('XZ2-42', '大同市')],
  'XZ1-5': [p('XZ2-51', '呼和浩特市'), p('XZ2-52', '包头市')],
  'XZ1-6': [p('XZ2-61', '沈阳市'), p('XZ2-62', '大连市')],
  'XZ1-7': [p('XZ2-71', '长春市'), p('XZ2-72', '吉林市')],
  'XZ1-8': [p('XZ2-81', '哈尔滨市')],
  // 华东
  'XZ1-10': [p('XZ2-101', '南京市'), p('XZ2-102', '苏州市'), p('XZ2-103', '无锡市'), p('XZ2-104', '常州市')],
  'XZ1-11': [p('XZ2-111', '杭州市'), p('XZ2-112', '宁波市'), p('XZ2-113', '温州市')],
  'XZ1-12': [p('XZ2-121', '合肥市'), p('XZ2-122', '芜湖市'), p('XZ2-123', '蚌埠市')],
  'XZ1-13': [p('XZ2-131', '福州市'), p('XZ2-132', '厦门市')],
  'XZ1-14': [p('XZ2-141', '南昌市')],
  'XZ1-15': [p('XZ2-151', '济南市'), p('XZ2-152', '青岛市'), p('XZ2-153', '烟台市')],
  // 华中/华南
  'XZ1-16': [p('XZ2-161', '郑州市'), p('XZ2-162', '洛阳市')],
  'XZ1-17': [p('XZ2-171', '武汉市'), p('XZ2-172', '宜昌市')],
  'XZ1-18': [p('XZ2-181', '长沙市')],
  'XZ1-19': [
    p('XZ2-191', '广州市'),
    p('XZ2-197', '深圳市'),
    p('XZ2-192', '珠海市'),
    p('XZ2-193', '佛山市'),
    p('XZ2-194', '东莞市'),
    p('XZ2-195', '惠州市'),
    p('XZ2-196', '中山市'),
  ],
  'XZ1-20': [p('XZ2-201', '南宁市')],
  'XZ1-21': [p('XZ2-211', '海口市'), p('XZ2-212', '三亚市')],
  // 西南/西北
  'XZ1-23': [p('XZ2-231', '成都市'), p('XZ2-232', '绵阳市')],
  'XZ1-24': [p('XZ2-241', '贵阳市')],
  'XZ1-25': [p('XZ2-251', '昆明市')],
  'XZ1-26': [p('XZ2-261', '拉萨市')],
  'XZ1-27': [p('XZ2-271', '西安市'), p('XZ2-272', '宝鸡市')],
  'XZ1-28': [p('XZ2-281', '兰州市')],
  'XZ1-29': [p('XZ2-291', '西宁市')],
  'XZ1-30': [p('XZ2-301', '银川市')],
  'XZ1-31': [p('XZ2-311', '乌鲁木齐市')],
  // 区县（热门/主要城市）
  'XZ2-1': [p('XZ3-11', '东城区'), p('XZ3-12', '西城区'), p('XZ3-13', '朝阳区'), p('XZ3-14', '海淀区'), p('XZ3-15', '丰台区')],
  'XZ2-2': [p('XZ3-21', '和平区'), p('XZ3-22', '河西区'), p('XZ3-23', '南开区')],
  'XZ2-9': [p('XZ3-91', '黄浦区'), p('XZ3-92', '徐汇区'), p('XZ3-93', '静安区'), p('XZ3-94', '浦东新区')],
  'XZ2-22': [p('XZ3-221', '渝中区'), p('XZ3-222', '江北区'), p('XZ3-223', '南岸区')],
  'XZ2-101': [p('XZ3-1011', '玄武区'), p('XZ3-1012', '秦淮区'), p('XZ3-1013', '建邺区'), p('XZ3-1014', '鼓楼区')],
  'XZ2-111': [p('XZ3-1111', '上城区'), p('XZ3-1112', '拱墅区'), p('XZ3-1113', '西湖区'), p('XZ3-1114', '滨江区')],
  'XZ2-121': [p('XZ3-1211', '蜀山区'), p('XZ3-1212', '庐阳区'), p('XZ3-1213', '包河区')],
  'XZ2-151': [p('XZ3-1511', '历下区'), p('XZ3-1512', '市中区'), p('XZ3-1513', '天桥区')],
  'XZ2-171': [p('XZ3-1711', '江岸区'), p('XZ3-1712', '江汉区'), p('XZ3-1713', '武昌区'), p('XZ3-1714', '洪山区')],
  'XZ2-191': [p('XZ3-1911', '天河区'), p('XZ3-1912', '越秀区'), p('XZ3-1913', '海珠区'), p('XZ3-1914', '白云区'), p('XZ3-1915', '番禺区')],
  'XZ2-197': [p('XZ3-1971', '罗湖区'), p('XZ3-1972', '福田区'), p('XZ3-1973', '南山区'), p('XZ3-1974', '宝安区'), p('XZ3-1975', '龙岗区'), p('XZ3-1976', '龙华区'), p('XZ3-1977', '坪山区')],
  'XZ2-231': [p('XZ3-2311', '锦江区'), p('XZ3-2312', '青羊区'), p('XZ3-2313', '金牛区'), p('XZ3-2314', '武侯区')],
  'XZ2-271': [p('XZ3-2711', '新城区'), p('XZ3-2712', '碑林区'), p('XZ3-2713', '莲湖区'), p('XZ3-2714', '雁塔区')],
}

const provinceById = new Map(provinces.map(({ districtID, districtName }) => [districtID, districtName]))

/** 展开为平铺的省市区节点列表 */
const buildDistrictVOList = () => {
  const list = []
  for (const { districtID: provinceId, districtName: province } of provinces) {
    list.push({ level: 'province', provinceId, province, districtName: province })
    for (const { districtID: cityId, districtName: city } of subListMap[provinceId] || []) {
      list.push({
        level: 'city',
        provinceId,
        province,
        cityId,
        city,
        districtName: `${province}/${city}`,
      })
      for (const { districtID: countyId, districtName: county } of subListMap[cityId] || []) {
        list.push({
          level: 'county',
          provinceId,
          province,
          cityId,
          city,
          countyId,
          county,
          districtName: `${province}/${city}/${county}`,
        })
      }
    }
  }
  return list
}

module.exports = {
  // 改为 false 后请求穿透 devServer 代理，走真实接口；改回 true 恢复本地 mock
  enable: false,
  data(body) {
    const keyword = (body && body.keyword ? String(body.keyword) : '').trim()
    let districtVOList = buildDistrictVOList()
    if (keyword) {
      districtVOList = districtVOList.filter(
        (item) =>
          item.districtName.includes(keyword) ||
          item.province.includes(keyword) ||
          (item.city || '').includes(keyword) ||
          (item.county || '').includes(keyword)
      )
    }
    return {
      code: 0,
      msg: 'OK',
      data: { keyWord: keyword, districtVOList },
      success: true,
    }
  },
}
