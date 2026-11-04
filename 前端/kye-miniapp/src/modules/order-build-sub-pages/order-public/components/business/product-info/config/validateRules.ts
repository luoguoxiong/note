const validateRules = {
  goodsType: [
    {
      rule: /^(?=.*[\u4E00-\u9FA5A-Za-z])/,
      errorMessage: '托寄物名称不可仅为数字或字符',
    },
    // {
    //   rule: /^(?![a-zA-Z]+$).+/,
    //   errorMessage: '托寄物名称不可仅为数字或字符',
    // },
  ],
}

export default validateRules
