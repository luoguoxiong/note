import { ref } from 'vue'
import { GoodsSize, GoodsSupplement, MatchItem } from '@order-public-sub-public/types'

// 托寄物
export const goodsType = ref('')

// 件数
export const count = ref(0)

// 实际重量
export const actualWeight = ref(0)

// 体积
export const volumeSize = ref(0)

// 尺寸
export const preWaybillGoodsSizeList = ref<GoodsSize[]>([
  {
    width: '',
    height: '',
    length: '',
    count: 1,
    singleWeight: '',
  },
])

// 唯品会入库号
export const productCode = ref('')

// 托寄物属性
export const matchList = ref<MatchItem[]>([])

// 分组情况skuId
export const skuId = ref('')

// 尺寸气泡位置
export const sizeBubbleIndex = ref(0)

export const unfoldSizeVisible = ref(false)

// 托寄物联想
export const linkContentVisible = ref(false)

export const useOverLengthAndWeightRequest = ref(true)

export const goodsSupplement = ref<GoodsSupplement>({ oldGoods: '', nudedGoods: '' })

export const tipText = `
<div class="supplement-tip-item-content">
  <div class="supplement-tip-item-content-item"><span class="number">1、</span>裸货：<span class="text">货物无任何外包装，或外包装只是简单的包装(如用膜简易缠绕，外包装为编织袋，薄的纸皮，牛皮纸，胶袋简易包装等)以及仅打托盘货这些包装视为裸货。</span></div>
  <div class="supplement-tip-item-content-item"><span class="number">2、</span>旧货：<span class="text">二手旧货/退货/参展货物/在使用货。</span></div>
</div>
`
export const routerBackFromSizeType = ref<undefined | 'mySize' | 'historySize'>(undefined)

/** 从新增尺寸页返回时标记需要刷新选择尺寸页我的尺寸列表 */
export const selectSizeRefreshType = ref<undefined | 'mySize'>(undefined)
