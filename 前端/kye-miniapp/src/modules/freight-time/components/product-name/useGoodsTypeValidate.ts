import { useValidate } from '@freight-time/validate/useValidate'

const { updateValidateKey, removeValidateKey } = useValidate()

export const openValidateKey = (content: string) => {
  updateValidateKey({
    key: 'productInfo.goodsType',
    content,
    bubbleConfig: {
      offset: [0, 2],
      placement: 'top-start',
      theme: 'dark',
    },
    showType: 1,
    passed: false,
  })
}

export const closeValidateKey = () => {
  removeValidateKey('productInfo.goodsType')
}
