import {
  receiptFlag,
  receiptProvider,
  receiptCount,
  collectionAmount,
  collectionFee,
  woodenFrame,
  otherWoodFrameList,
  goodsControl,
  aiValidate,
  uploadList,
  kyeUploadList,
  showCheckErrorTip,
  receiptFileImageCount,
  dismantlingWoodenFrame,
  isReadAiTips,
  receiptCheckType,
  receiptUrgentReturn,
} from './state'

import { fileType } from '@order-public-sub-public/apis/pickup/type'

export const useReceiptFlag = () => {
  const setReceiptFlag = (value: string) => {
    receiptFlag.value = value
  }

  return { receiptFlag, setReceiptFlag }
}

export const useReceiptProvider = () => {
  const setReceiptProvider = (value: string) => {
    receiptProvider.value = value
  }

  return { receiptProvider, setReceiptProvider }
}

export const useReceiptCount = () => {
  const setReceiptCount = (value: number | null) => {
    receiptCount.value = value
  }

  return { receiptCount, setReceiptCount }
}
// 回单要求
export const useReceiptCheckType = () => {
  const setReceiptCheckType = (value: string[]) => {
    receiptCheckType.value = value
  }
  return { receiptCheckType, setReceiptCheckType }
}
// 回单是否加急返
export const useReceiptUrgentReturn = () => {
  const setReceiptUrgentReturn = (value: string) => {
    receiptUrgentReturn.value = value
  }
  return { receiptUrgentReturn, setReceiptUrgentReturn }
}

export const useCollectionAmount = () => {
  const setCollectionAmount = (value: number | string) => {
    collectionAmount.value = value
  }

  return { collectionAmount, setCollectionAmount }
}

export const useCollectionFee = () => {
  const setCollectionFee = (value: number) => {
    collectionFee.value = value
  }

  return { collectionFee, setCollectionFee }
}

export const useWoodenFrame = () => {
  const setWoodenFrame = (value: string) => {
    woodenFrame.value = value
  }

  return { woodenFrame, setWoodenFrame }
}

export const useOtherWoodenFrame = () => {
  const setOtherWoodenFrame = (list: string[]) => {
    otherWoodFrameList.value = list
  }
  return { otherWoodFrameList, setOtherWoodenFrame }
}

export const useGoodsControl = () => {
  const setGoodsControl = (value: string) => {
    goodsControl.value = value
  }
  return { goodsControl, setGoodsControl }
}

export const useAiValidate = () => {
  const setAiValidate = (value: boolean) => {
    aiValidate.value = value
  }

  return { aiValidate, setAiValidate }
}

export const useUploadList = () => {
  const setUploadList = (value: fileType[]) => {
    uploadList.value = value
  }

  return { uploadList, setUploadList }
}

export const useKyeUploadList = () => {
  const setKyeUploadList = (value: fileType[]) => {
    kyeUploadList.value = value
  }

  return { kyeUploadList, setKyeUploadList }
}

export const useCheckErrorTip = () => {
  const setCheckErrorTip = (value: boolean) => {
    showCheckErrorTip.value = value
  }

  return { showCheckErrorTip, setCheckErrorTip }
}

export const useReceiptFileImagCount = () => {
  const setReceiptFileImagCount = (value: number) => {
    receiptFileImageCount.value = value
  }

  return { receiptFileImageCount, setReceiptFileImagCount }
}

export const useDismantlingWoodenFrame = () => {
  const setDismantlingWoodenFrame = (value: string) => {
    dismantlingWoodenFrame.value = value
  }

  return { dismantlingWoodenFrame, setDismantlingWoodenFrame }
}

export const useIsReadAiTips = () => {
  const setIsReadAiTips = (value: boolean) => {
    isReadAiTips.value = value
  }

  return { isReadAiTips, setIsReadAiTips }
}
