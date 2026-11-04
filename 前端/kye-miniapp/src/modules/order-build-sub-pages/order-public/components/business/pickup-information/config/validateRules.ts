import {
  lessTwoCharacters,
  overZero,
  phone,
  /*symbolNumber,*/ /*tel, telephoneMobile, */ notEmpty,
} from '@order-public-sub-public/utils/pattern'

const validRules = {
  //取货联系人
  mobile: [
    {
      rule: phone,
      errorMessage: '请输入正确的取货联系人手机号',
    },
  ],
  telephone: [
    {
      // rule: tel || telephoneMobile,
      rule: /^(?:(?:0\d{2}-?\d{8})|(?:0\d{3}-?\d{8})|(?:0\d{2}-?\d{7})|(?:0\d{3}-?\d{7})|(?:^(?!400|800)\d{7,8})|(?:[48]00-?\d{5,10}))$/,
      errorMessage: '请输入正确的取货联系人固定电话',
    },
  ],
  person: [
    {
      rule: notEmpty,
      errorMessage: '请输入取货联系人姓名',
    },
    {
      rule: lessTwoCharacters,
      errorMessage: '取货联系人姓名不能少于2个字',
    },
    // {
    //   rule: symbolNumber,
    //   errorMessage: '请输入正确的取货联系人姓名',
    // },
  ],
  pickup: [
    {
      rule: overZero,
      errorMessage: '请上传取货信息',
    },
  ],
  cargoImg: [
    {
      rule: overZero,
      errorMessage: '请上传货物照片',
    },
  ],
}

export default validRules
