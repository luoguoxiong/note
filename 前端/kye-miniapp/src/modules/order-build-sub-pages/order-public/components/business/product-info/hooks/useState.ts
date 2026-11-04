import { ref } from 'vue'
import {
  goodsType,
  productCode,
  count,
  actualWeight,
  volumeSize,
  preWaybillGoodsSizeList,
  matchList,
  skuId,
  sizeBubbleIndex,
  unfoldSizeVisible,
  linkContentVisible,
  goodsSupplement,
} from './state'
import { GoodsSize, GoodsSupplementEnum, MatchItem } from '@order-public-sub-public/types'
import { clearSizeListEffect } from './useValidate'

export const useGoodsType = () => {
  const originGoodsType = ref(goodsType.value)
  const setGoodsType = (value: string, ignoreOrigin?: boolean) => {
    goodsType.value = value
    if (!ignoreOrigin) {
      originGoodsType.value = value
    }
  }

  return { goodsType, originGoodsType, setGoodsType }
}

export const useSupplement = () => {
  const setGoodsSupplement = (value: { oldGoods: GoodsSupplementEnum | ''; nudedGoods: GoodsSupplementEnum | '' }) => {
    goodsSupplement.value = value
  }
  return { goodsSupplement, setGoodsSupplement }
}

export const useProductCode = () => {
  const setProductCode = (value: string) => {
    productCode.value = value
  }

  return { productCode, setProductCode }
}

const isEmptySize = (item: GoodsSize) => {
  const isempty = (!item.count || Number(item.count) <= 1) && !item.length && !item.width && !item.height
  return isempty
}

export const usePreWaybillGoodsSizeList = () => {
  /**
   * 设置尺寸,对我的尺寸选择回填逻辑单独处理
   *    1.若尺寸列表只有条数据（长宽高均为空且件数=1），则覆盖该条数据
   *    2.非上述场景，则新增一条新尺寸数据到列表中
   */
  const setPreWaybillGoodsSizeList = (value: GoodsSize[], setFrom?: 'mySize' | 'historySize') => {
    const curSizeList = value.map((item) => {
      return {
        ...item,
        // 六位随机数ID
        id: item.id || Math.floor(100000 + Math.random() * 900000),
      }
    })
    if (
      (setFrom === 'mySize' || setFrom === 'historySize') &&
      !(preWaybillGoodsSizeList.value?.length === 1 && isEmptySize(preWaybillGoodsSizeList.value[0]))
    ) {
      preWaybillGoodsSizeList.value.push(...curSizeList)
    } else {
      preWaybillGoodsSizeList.value = curSizeList
    }
    setTimeout(() => {
      // 清除尺寸列表副作用，设置的地方太多了，在这里处理
      clearSizeListEffect()
    }, 300)
  }

  return { preWaybillGoodsSizeList, setPreWaybillGoodsSizeList }
}

export const useCount = () => {
  const setCount = (value: number) => {
    count.value = value
  }

  return { count, setCount }
}

export const useActualWeight = () => {
  const setActualWeight = (value: number) => {
    actualWeight.value = value
  }

  return { actualWeight, setActualWeight }
}

export const useVolumeSize = () => {
  const setVolumeSize = (value: number) => {
    volumeSize.value = value
  }

  return { volumeSize, setVolumeSize }
}

export const useMatchList = () => {
  const setMatchList = (value: MatchItem[]) => {
    matchList.value = value
  }

  return { matchList, setMatchList }
}

export const useSkuId = () => {
  const setSkuId = (value: string) => {
    skuId.value = value
  }

  return { skuId, setSkuId }
}

export const useSizeBubbleIndex = () => {
  const setSizeBubbleIndex = (value: number) => {
    sizeBubbleIndex.value = value
  }

  return { sizeBubbleIndex, setSizeBubbleIndex }
}

export const useUnfoldSizeVisible = () => {
  const setUnfoldSizeVisible = (value: boolean) => {
    unfoldSizeVisible.value = value
  }

  return { unfoldSizeVisible, setUnfoldSizeVisible }
}

export const useLinkContentVisible = () => {
  const setLinkContentVisible = (value: boolean) => {
    linkContentVisible.value = value
  }

  return { linkContentVisible, setLinkContentVisible }
}
