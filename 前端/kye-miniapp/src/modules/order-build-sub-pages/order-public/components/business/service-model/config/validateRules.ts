import { notEmpty } from '@order-public-sub-public/utils/pattern'

const validRules = {
  // 服务方式
  serviceMode: [
    {
      rule: notEmpty,
      errorMessage: '请选择服务方式',
    },
  ],
}

export default validRules
