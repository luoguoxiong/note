import {
  notEmpty,
  lessTwoCharacters,
  symbolNumber,
  mobileRule,
  telephoneRule,
} from '@order-public-sub-public/utils/pattern'

const validRules: {
  [key: string]: { rule: RegExp; errorMessage: string }[]
} = {
  // 姓名
  person: [
    {
      rule: notEmpty,
      errorMessage: '请输入返单人姓名',
    },
    // {
    //   rule: lessTwoCharacters,
    //   errorMessage: '返单人姓名不能少于2个字',
    // },
  ],
  mobile: [
    {
      rule: notEmpty,
      errorMessage: '请输入返单人手机号',
    },
    {
      rule: mobileRule,
      errorMessage: '请输入正确的返单人手机号',
    },
  ],
  companyName: [
    {
      rule: lessTwoCharacters,
      errorMessage: '返单公司名称不能少于2个字',
    },
    {
      rule: symbolNumber,
      errorMessage: '请输入正确返单公司名称',
    },
  ],
  address: [
    {
      rule: notEmpty,
      errorMessage: '请选择省份/城市/区域',
    },
  ],
  cityCounty: [
    {
      rule: notEmpty,
      errorMessage: '请选择市区',
    },
  ],
  province: [
    {
      rule: notEmpty,
      errorMessage: '请选择省份',
    },
  ],
  city: [
    {
      rule: notEmpty,
      errorMessage: '请选择城市',
    },
  ],
  county: [
    {
      rule: notEmpty,
      errorMessage: '请选择区县',
    },
  ],
  detailAddress: [
    {
      rule: notEmpty,
      errorMessage: '请输入返单详细地址',
    },
  ],
}

export default validRules
