import { overZero } from '@order-public-sub-public/utils/pattern'

const validRules = {
  deliveryData: [
    {
      rule: overZero,
      errorMessage: '请上传派货信息',
    },
  ],
}

export default validRules
