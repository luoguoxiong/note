import { onMounted } from 'vue'
import { getAssetCode } from '@order-public-sub-public/configs'
import { localStorage } from '@order-public-sub-public/utils/storage'

// 设置资产编码
export const useSetAssetCode = () => {
  onMounted(async () => {
    const assetNumber = await getAssetCode()
    console.log(assetNumber)
    if (assetNumber) {
      localStorage?.setItem('assetNumber', assetNumber)
    }
  })
}
