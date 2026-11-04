export const HOT_CITY_ARR = [
  {
    // {districtID: "XZ1-06", districtName: "北京"}
    // {districtID: "XZ2-174", districtName: "北京"}
    text: '北京',
    level: '2',
    parentText: '北京',
    districtIDCity: 'XZ2-174',
    districtIDProvince: 'XZ1-06',
    districtIDProvinceIndex: 1,
    districtIDCityIndex: 1,
  },
  {
    // {districtID: "XZ1-01", districtName: "上海"}
    // {districtID: "XZ2-040", districtName: "上海"}
    text: '上海',
    level: '2',
    parentText: '上海',
    districtIDCity: 'XZ2-040',
    districtIDProvince: 'XZ1-01',
    districtIDProvinceIndex: 9,
    districtIDCityIndex: 1,
  },
  {
    // {districtID: "XZ1-31", districtName: "广东省"}
    // {districtID: "XZ2-042", districtName: "广州市"}
    text: '广州',
    level: '2',
    parentText: '广东省',
    districtIDCity: 'XZ2-042',
    districtIDProvince: 'XZ1-31',
    districtIDProvinceIndex: 19,
    districtIDCityIndex: 1,
  },
  {
    // {districtID: "XZ1-31", districtName: "广东省"}
    // {districtID: "XZ2-229", districtName: "深圳市"}
    text: '深圳',
    level: '2',
    parentText: '广东省',
    districtIDCity: 'XZ2-229',
    districtIDProvince: 'XZ1-31',
    districtIDProvinceIndex: 19,
    districtIDCityIndex: 3,
  },
  {
    // {districtID: "XZ1-31", districtName: "广东省"}
    // {districtID: "XZ2-253", districtName: "东莞市"}
    text: '东莞',
    level: '2',
    parentText: '广东省',
    districtIDCity: 'XZ2-253',
    districtIDProvince: 'XZ1-31',
    districtIDProvinceIndex: 19,
    districtIDCityIndex: 17,
  },
  {
    // {districtID: "XZ1-22", districtName: "浙江省"}
    // {districtID: "XZ2-213", districtName: "杭州市"}
    text: '杭州',
    level: '2',
    parentText: '浙江省',
    districtIDCity: 'XZ2-213',
    districtIDProvince: 'XZ1-22',
    districtIDProvinceIndex: 11,
    districtIDCityIndex: 1,
  },
  {
    // {districtID: "XZ1-08", districtName: "四川省"}
    // {districtID: "XZ2-043", districtName: "成都市"}
    text: '成都',
    level: '2',
    parentText: '四川省',
    districtIDCity: 'XZ2-043',
    districtIDProvince: 'XZ1-08',
    districtIDProvinceIndex: 23,
    districtIDCityIndex: 1,
  },
  {
    // {districtID: "XZ1-14", districtName: "江苏省"}
    // {districtID: "XZ2-260", districtName: "南京市"}
    text: '南京',
    level: '2',
    parentText: '江苏省',
    districtIDCity: 'XZ2-260',
    districtIDProvince: 'XZ1-14',
    districtIDProvinceIndex: 10,
    districtIDCityIndex: 1,
  },
]

export const hotCity = () => {
  return [
    {
      title: '北京',
      id: 'XZ2-174',
      value: [
        { id: 'XZ1-06', name: '北京', level: 'province' },
        { id: 'XZ2-174', name: '北京市', level: 'city' },
      ],
    },
    {
      title: '上海',
      id: 'XZ2-040',
      value: [
        { id: 'XZ1-01', name: '上海', level: 'province' },
        { id: 'XZ2-040', name: '上海市', level: 'city' },
      ],
    },
    {
      title: '广州',
      id: 'XZ2-042',
      value: [
        { id: 'XZ1-31', name: '广东省', level: 'province' },
        { id: 'XZ2-042', name: '广州市', level: 'city' },
      ],
    },
    {
      title: '深圳',
      id: 'XZ2-229',
      value: [
        { id: 'XZ1-31', name: '广东省', level: 'province' },
        { id: 'XZ2-229', name: '深圳市', level: 'city' },
      ],
    },
    {
      title: '东莞',
      id: 'XZ2-253',
      value: [
        { id: 'XZ1-31', name: '广东省', level: 'province' },
        { id: 'XZ2-253', name: '东莞市', level: 'city' },
      ],
    },
    {
      title: '杭州',
      id: 'XZ2-213',
      value: [
        { id: 'XZ1-22', name: '浙江省', level: 'province' },
        { id: 'XZ2-213', name: '杭州市', level: 'city' },
      ],
    },
    {
      title: '成都',
      id: 'XZ2-043',
      value: [
        { id: 'XZ1-08', name: '四川省', level: 'province' },
        { id: 'XZ2-043', name: '成都市', level: 'city' },
      ],
    },
    {
      title: '南京',
      id: 'XZ2-260',
      value: [
        { id: 'XZ1-14', name: '江苏省', level: 'province' },
        { id: 'XZ2-260', name: '南京市', level: 'city' },
      ],
    },
  ]
}
