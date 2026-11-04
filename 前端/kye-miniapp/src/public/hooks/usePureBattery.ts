import { YesOrNoString } from '@/modules/kye-miniapp-order/src/order-public/constants'
import { ref } from 'vue'

export const uploadGoodsTypeResolve = ref()
export const uploadGoodsTypeReject = ref()

export const uploadGoodsTypePromise = () => {
  return new Promise((resolve, reject) => {
    uploadGoodsTypeResolve.value = resolve
    uploadGoodsTypeReject.value = reject
  })
}

export const pureBatteryFileUploadConfirm = ref(YesOrNoString.NO)
