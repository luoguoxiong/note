import { useValidate } from '../../../validate/useValidate'
import { getReceiveAddress, getSendAddress } from './useState'

const { updateValidateKey, removeValidateKey } = useValidate()

export const openValidateKey = (key: string, content: string) => {
  updateValidateKey({
    key,
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

export const useValidateSendAndReceive = () => {
  const sendAddress = getSendAddress()
  const receiveAddress = getReceiveAddress()
  if (!sendAddress.value.city && !sendAddress.value.fullAddress) {
    openValidateKey('address.send', '请输入寄件地址')
  } else {
    removeValidateKey('address.send')
  }
  if (!receiveAddress.value.city && !receiveAddress.value.fullAddress) {
    openValidateKey('address.receive', '请输入收件地址')
  } else {
    removeValidateKey('address.receive')
  }
}
