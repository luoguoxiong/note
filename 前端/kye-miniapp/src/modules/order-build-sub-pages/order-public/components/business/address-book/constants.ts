import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'

export const MaxClearAddrNum = 500

interface newDialogOptions {
  titleIcon?: string
  closeable?: boolean
  storageFlag?: boolean
  zIndex?: number
  showCustomConcat?: boolean
  confirmButtonText: string
  showCustomConcatCallBack?: () => void
}

export const repeatAddrDialog = (params?: newDialogOptions) => {
  return new Promise((resove) => {
    showKyDialog({
      message: '您想保存的地址已存在“公司地址簿”，建议您直接使用该地址下单',
      title: '温馨提示',
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: '继续保存',
      confirmButtonText: '去下单',
      ...params,
    })
      .then(() => {
        resove(true)
      })
      .catch(() => {
        // 继续保存
        resove(false)
      })
  })
}

// 保存地址的 是第一次保存，还是二次确认保存
export enum SaveAddrRepeatValueEnmu {
  弹层不保存地址 = '10',
  不弹层保存地址 = '20',
  // 移动端-寄件页-点击地址(编辑)-点击保存，不需要弹层，不保存地址
  不弹层不保存地址 = '30',
}
