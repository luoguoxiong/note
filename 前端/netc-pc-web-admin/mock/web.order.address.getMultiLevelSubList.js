/**
 * 网点查询-行政区划多级联动 mock（web.order.address.getMultiLevelSubList）
 * 入参：
 *  - { districtLevel: 'province' }：返回省列表（含 initials，省份按字母分组依赖）
 *  - { commonDistrID: 省ID }：返回该省的市列表
 *  - { commonDistrID: 市ID }：返回该市的区列表
 * 出参：{ districtLevel, districtList: [{ districtID, districtName, adminCode, initials }] }
 */
const provinceById = {
  'XZ1-1': { districtLevel: 'province', initials: 'B' },
  'XZ1-2': { districtLevel: 'province', initials: 'T' },
  'XZ1-3': { districtLevel: 'province', initials: 'H' },
  'XZ1-4': { districtLevel: 'province', initials: 'S' },
  'XZ1-5': { districtLevel: 'province', initials: 'N' },
  'XZ1-6': { districtLevel: 'province', initials: 'L' },
  'XZ1-7': { districtLevel: 'province', initials: 'J' },
  'XZ1-8': { districtLevel: 'province', initials: 'H' },
  'XZ1-9': { districtLevel: 'province', initials: 'S' },
  'XZ1-10': { districtLevel: 'province', initials: 'J' },
  'XZ1-11': { districtLevel: 'province', initials: 'Z' },
  'XZ1-12': { districtLevel: 'province', initials: 'A' },
  'XZ1-13': { districtLevel: 'province', initials: 'F' },
  'XZ1-14': { districtLevel: 'province', initials: 'J' },
  'XZ1-15': { districtLevel: 'province', initials: 'S' },
  'XZ1-16': { districtLevel: 'province', initials: 'H' },
  'XZ1-17': { districtLevel: 'province', initials: 'H' },
  'XZ1-18': { districtLevel: 'province', initials: 'H' },
  'XZ1-19': { districtLevel: 'province', initials: 'G' },
  'XZ1-20': { districtLevel: 'province', initials: 'G' },
  'XZ1-21': { districtLevel: 'province', initials: 'H' },
  'XZ1-22': { districtLevel: 'province', initials: 'C' },
  'XZ1-23': { districtLevel: 'province', initials: 'S' },
  'XZ1-24': { districtLevel: 'province', initials: 'G' },
  'XZ1-25': { districtLevel: 'province', initials: 'Y' },
  'XZ1-26': { districtLevel: 'province', initials: 'X' },
  'XZ1-27': { districtLevel: 'province', initials: 'S' },
  'XZ1-28': { districtLevel: 'province', initials: 'G' },
  'XZ1-29': { districtLevel: 'province', initials: 'Q' },
  'XZ1-30': { districtLevel: 'province', initials: 'N' },
  'XZ1-31': { districtLevel: 'province', initials: 'X' },
}

/** 省列表（与 mapAddressSearch mock 同一 ID 体系） */
const provinces = [
  ['XZ1-1', '北京市'],
  ['XZ1-2', '天津市'],
  ['XZ1-3', '河北省'],
  ['XZ1-4', '山西省'],
  ['XZ1-5', '内蒙古自治区'],
  ['XZ1-6', '辽宁省'],
  ['XZ1-7', '吉林省'],
  ['XZ1-8', '黑龙江省'],
  ['XZ1-9', '上海市'],
  ['XZ1-10', '江苏省'],
  ['XZ1-11', '浙江省'],
  ['XZ1-12', '安徽省'],
  ['XZ1-13', '福建省'],
  ['XZ1-14', '江西省'],
  ['XZ1-15', '山东省'],
  ['XZ1-16', '河南省'],
  ['XZ1-17', '湖北省'],
  ['XZ1-18', '湖南省'],
  ['XZ1-19', '广东省'],
  ['XZ1-20', '广西壮族自治区'],
  ['XZ1-21', '海南省'],
  ['XZ1-22', '重庆市'],
  ['XZ1-23', '四川省'],
  ['XZ1-24', '贵州省'],
  ['XZ1-25', '云南省'],
  ['XZ1-26', '西藏自治区'],
  ['XZ1-27', '陕西省'],
  ['XZ1-28', '甘肃省'],
  ['XZ1-29', '青海省'],
  ['XZ1-30', '宁夏回族自治区'],
  ['XZ1-31', '新疆维吾尔自治区'],
]

/** 市/区列表（key: 父级 districtID） */
const subListMap = {
  'XZ1-1': [['XZ2-1', '北京市']],
  'XZ1-2': [['XZ2-2', '天津市']],
  'XZ1-9': [['XZ2-9', '上海市']],
  'XZ1-22': [['XZ2-22', '重庆市']],
  'XZ1-3': [['XZ2-31', '石家庄市'], ['XZ2-32', '唐山市']],
  'XZ1-4': [['XZ2-41', '太原市'], ['XZ2-42', '大同市']],
  'XZ1-5': [['XZ2-51', '呼和浩特市'], ['XZ2-52', '包头市']],
  'XZ1-6': [['XZ2-61', '沈阳市'], ['XZ2-62', '大连市']],
  'XZ1-7': [['XZ2-71', '长春市'], ['XZ2-72', '吉林市']],
  'XZ1-8': [['XZ2-81', '哈尔滨市']],
  'XZ1-10': [['XZ2-101', '南京市'], ['XZ2-102', '苏州市'], ['XZ2-103', '无锡市'], ['XZ2-104', '常州市']],
  'XZ1-11': [['XZ2-111', '杭州市'], ['XZ2-112', '宁波市'], ['XZ2-113', '温州市']],
  'XZ1-12': [['XZ2-121', '合肥市'], ['XZ2-122', '芜湖市'], ['XZ2-123', '蚌埠市']],
  'XZ1-13': [['XZ2-131', '福州市'], ['XZ2-132', '厦门市']],
  'XZ1-14': [['XZ2-141', '南昌市']],
  'XZ1-15': [['XZ2-151', '济南市'], ['XZ2-152', '青岛市'], ['XZ2-153', '烟台市']],
  'XZ1-16': [['XZ2-161', '郑州市'], ['XZ2-162', '洛阳市']],
  'XZ1-17': [['XZ2-171', '武汉市'], ['XZ2-172', '宜昌市']],
  'XZ1-18': [['XZ2-181', '长沙市']],
  'XZ1-19': [
    ['XZ2-191', '广州市'],
    ['XZ2-197', '深圳市'],
    ['XZ2-192', '珠海市'],
    ['XZ2-193', '佛山市'],
    ['XZ2-194', '东莞市'],
    ['XZ2-195', '惠州市'],
    ['XZ2-196', '中山市'],
  ],
  'XZ1-20': [['XZ2-201', '南宁市']],
  'XZ1-21': [['XZ2-211', '海口市'], ['XZ2-212', '三亚市']],
  'XZ1-23': [['XZ2-231', '成都市'], ['XZ2-232', '绵阳市']],
  'XZ1-24': [['XZ2-241', '贵阳市']],
  'XZ1-25': [['XZ2-251', '昆明市']],
  'XZ1-26': [['XZ2-261', '拉萨市']],
  'XZ1-27': [['XZ2-271', '西安市'], ['XZ2-272', '宝鸡市']],
  'XZ1-28': [['XZ2-281', '兰州市']],
  'XZ1-29': [['XZ2-291', '西宁市']],
  'XZ1-30': [['XZ2-301', '银川市']],
  'XZ1-31': [['XZ2-311', '乌鲁木齐市']],
  'XZ2-1': [['XZ3-11', '东城区'], ['XZ3-12', '西城区'], ['XZ3-13', '朝阳区'], ['XZ3-14', '海淀区'], ['XZ3-15', '丰台区']],
  'XZ2-2': [['XZ3-21', '和平区'], ['XZ3-22', '河西区'], ['XZ3-23', '南开区']],
  'XZ2-9': [['XZ3-91', '黄浦区'], ['XZ3-92', '徐汇区'], ['XZ3-93', '静安区'], ['XZ3-94', '浦东新区']],
  'XZ2-22': [['XZ3-221', '渝中区'], ['XZ3-222', '江北区'], ['XZ3-223', '南岸区']],
  'XZ2-101': [['XZ3-1011', '玄武区'], ['XZ3-1012', '秦淮区'], ['XZ3-1013', '建邺区'], ['XZ3-1014', '鼓楼区']],
  'XZ2-111': [['XZ3-1111', '上城区'], ['XZ3-1112', '拱墅区'], ['XZ3-1113', '西湖区'], ['XZ3-1114', '滨江区']],
  'XZ2-121': [['XZ3-1211', '蜀山区'], ['XZ3-1212', '庐阳区'], ['XZ3-1213', '包河区']],
  'XZ2-151': [['XZ3-1511', '历下区'], ['XZ3-1512', '市中区'], ['XZ3-1513', '天桥区']],
  'XZ2-171': [['XZ3-1711', '江岸区'], ['XZ3-1712', '江汉区'], ['XZ3-1713', '武昌区'], ['XZ3-1714', '洪山区']],
  'XZ2-191': [['XZ3-1911', '天河区'], ['XZ3-1912', '越秀区'], ['XZ3-1913', '海珠区'], ['XZ3-1914', '白云区'], ['XZ3-1915', '番禺区']],
  'XZ2-197': [['XZ3-1971', '罗湖区'], ['XZ3-1972', '福田区'], ['XZ3-1973', '南山区'], ['XZ3-1974', '宝安区'], ['XZ3-1975', '龙岗区'], ['XZ3-1976', '龙华区'], ['XZ3-1977', '坪山区']],
  'XZ2-231': [['XZ3-2311', '锦江区'], ['XZ3-2312', '青羊区'], ['XZ3-2313', '金牛区'], ['XZ3-2314', '武侯区']],
  'XZ2-271': [['XZ3-2711', '新城区'], ['XZ3-2712', '碑林区'], ['XZ3-2713', '莲湖区'], ['XZ3-2714', '雁塔区']],
}

let adminCodeSeq = 100000
const toDistrict = ([districtID, districtName]) => ({
  districtID,
  districtName,
  adminCode: String((adminCodeSeq += 1)),
  ...provinceById[districtID],
})

module.exports = {
  // 改为 false 后请求穿透 devServer 代理，走真实接口；改回 true 恢复本地 mock
  enable: false,
  data(body) {
    const commonDistrID = body && body.commonDistrID ? String(body.commonDistrID) : ''
    let districtLevel = 'province'
    let districtList = provinces

    if (commonDistrID) {
      districtList = subListMap[commonDistrID] || []
      // 省 ID 前缀 XZ1-、市 ID 前缀 XZ2-，据此返回对应层级
      districtLevel = commonDistrID.startsWith('XZ1-') ? 'city' : 'zone'
    } else if (body && body.provinceDistrID && !body.cityDistrID) {
      districtList = subListMap[String(body.provinceDistrID)] || []
      districtLevel = 'city'
    } else if (body && body.cityDistrID && !body.zoneDistrID) {
      districtList = subListMap[String(body.cityDistrID)] || []
      districtLevel = 'zone'
    }

    return {
      code: 0,
      msg: 'OK',
      success: true,
      data: { districtLevel, districtList: districtList.map(toDistrict) },
    }
  },
}
