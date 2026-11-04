import { notEmpty } from '@order-public-sub-public/utils/pattern'

const validRules = {
  // 货好时间
  goodsTime: [
    {
      rule: notEmpty,
      errorMessage: '请选择货好时间',
    },
  ],
  goodsTimeFlag: [
    {
      rule: notEmpty,
      errorMessage: '请选择货好时间',
    },
  ],
}

export default validRules
