import { notEmpty } from '@order-public-sub-public/utils/pattern'

const validRules = {
  // 付款方式
  payMode: [
    {
      rule: notEmpty,
      errorMessage: '请输入付款方式',
    },
  ],
}

export default validRules
