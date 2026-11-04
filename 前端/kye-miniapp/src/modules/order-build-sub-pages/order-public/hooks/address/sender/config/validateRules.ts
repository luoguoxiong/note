import { FieldKey } from '@order-public-sub-public/types'
import { notEmpty, lessTwoCharacters, symbolNumber, phone } from '@order-public-sub-public/utils/pattern'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const validRules: {
  [key: string]: { rule: RegExp; errorMessage: string }[]
} = {
  // 姓名
  person: [
    {
      rule: notEmpty,
      errorMessage: '根据国家相关法律要求，寄件人请输入真实姓名',
    },
    {
      rule: lessTwoCharacters,
      errorMessage: '寄件人姓名不能少于2个字',
    },
    // 真实寄件人姓名的限制变为可配置项，逻辑放置在后端
    // {
    //   rule: sensitiveWords,
    //   errorMessage: '请输入真实的寄件人姓名',
    // },
    {
      rule: symbolNumber,
      errorMessage: '请输入正确的寄件人姓名',
    },
  ],
  mobile: [
    {
      rule: notEmpty,
      errorMessage: '请输入寄件人手机号',
    },
    {
      rule: phone,
      errorMessage: '请输入正确的寄件人手机号',
    },
  ],
  telephone: [
    {
      rule: notEmpty,
      errorMessage: '请输入寄件人电话',
    },
    {
      // rule: /^(?:(?:0\d{2}-?\d{8})|(?:0\d{3}-?\d{8})|(?:0\d{2}-?\d{7})|(?:0\d{3}-?\d{7})|(?:\d{8})|(?:\d{7}))$/,
      rule: /^(?:(?:0\d{2}-?\d{8})|(?:0\d{3}-?\d{8})|(?:0\d{2}-?\d{7})|(?:0\d{3}-?\d{7})|(?:^(?!400|800)\d{7,8})|(?:[48]00-?\d{5,10}))$/,
      errorMessage: '请输入正确的寄件人电话',
    },
  ],
  companyName: [
    {
      rule: lessTwoCharacters,
      errorMessage: '寄件公司名称不能少于2个字',
    },
    {
      rule: symbolNumber,
      errorMessage: '请输入正确寄件公司名称',
    },
  ],
  address: [
    {
      rule: notEmpty,
      errorMessage: '请选择省份/城市/区域',
    },
  ],
  province: [
    {
      rule: notEmpty,
      errorMessage: '请选择省份',
    },
  ],
  cityCounty: [
    {
      rule: notEmpty,
      errorMessage: '请选择市区',
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
      errorMessage: '请输入寄件详细地址',
    },
    // {
    //   rule: detailRule,
    //   errorMessage: '详细地址不能少于11位',
    // },
  ],
  sender: [
    {
      rule: notEmpty,
      errorMessage: '请填写寄件人信息',
    },
  ],
  specifyAddress: [
    {
      rule: notEmpty,
      errorMessage: '请填写寄件人真实姓名',
    },
  ],
  fieldSpecifyAddress: [
    {
      rule: notEmpty,
      errorMessage: '请选择寄件地址',
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

export const getSendLocationConfig = (field: FieldKey, waybillNumber?: string) => {
  if (['projectArea', 'projectNumber'].includes(field)) {
    const sendLocationDynamicConfig = piniaStore.globalData.dynamicConfig('senderProjectLocation', waybillNumber)
    const areaLabel = sendLocationDynamicConfig?.locationInfo?.areaLabel || '大厦'
    const floorLabel = sendLocationDynamicConfig?.locationInfo?.locationLabel || '楼层'
    const houseLabel = sendLocationDynamicConfig?.shopInfo?.shopNumberLabel || '门牌号'

    const areaPlaceholder = `请选择${areaLabel}/${floorLabel}`
    const housePlaceholder = `请输入${houseLabel}`
    return {
      projectAreaRuls: [
        {
          rule: notEmpty,
          errorMessage: areaPlaceholder,
        },
      ],
      housePlaceholderRuls: [
        {
          rule: notEmpty,
          errorMessage: housePlaceholder,
        },
      ],
    }
  }
  return {
    projectAreaRuls: [],
    housePlaceholderRuls: [],
  }
}
