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
      errorMessage: '请输入收件人姓名',
    },
    // {
    //   rule: lessTwoCharacters,
    //   errorMessage: '收件人姓名不能少于2个字',
    // },
    // {
    //   rule: sensitiveWords,
    //   errorMessage: '请输入真实的收件人姓名',
    // },
    // {
    //   rule: symbolNumber,
    //   errorMessage: '请输入正确的收件人姓名',
    // },
  ],
  mobile: [
    {
      rule: notEmpty,
      errorMessage: '请输入收件手机号',
    },
    {
      rule: mobileRule,
      errorMessage: '请输入正确的收件手机号',
    },
  ],
  telephone: [
    {
      rule: notEmpty,
      errorMessage: '请输入收件固定电话',
    },
    {
      rule: telephoneRule,
      errorMessage: '请输入正确的收件固定电话',
    },
  ],
  companyName: [
    {
      rule: lessTwoCharacters,
      errorMessage: '收件公司名称不能少于2个字',
    },
    {
      rule: symbolNumber,
      errorMessage: '请输入正确收件公司名称',
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
      errorMessage: '请输入收件详细地址',
    },
    // {
    //   rule: detailRule,
    //   errorMessage: '详细地址不能少于11位',
    // },
  ],
  receive: [
    {
      rule: notEmpty,
      errorMessage: '请填写收件人信息',
    },
  ],
  specifyAddress: [
    {
      rule: notEmpty,
      errorMessage: '请填写收件人信息',
    },
  ],
  fieldSpecifyAddress: [
    {
      rule: notEmpty,
      errorMessage: '请选择收件地址',
    },
  ],
  exhibitionSiteNumber: [
    {
      rule: notEmpty,
      errorMessage: '请填写展位号',
    },
  ],
  exhibitionNumber: [
    {
      rule: notEmpty,
      errorMessage: '请选择展馆号',
    },
  ],
}

export default validRules
