<template>
  <div class="history-size-page h-full">
    <HistorySizeSkeletonScreen v-if="loading"></HistorySizeSkeletonScreen>
    <div class="history-size-page-content" v-else>
      <div class="history-size-title font-level4 color-assist">长*宽*高*件数*单件重量（cm/kg）</div>
      <template v-for="item in historySizeList" :key="item.batchId">
        <div class="history-size-block" @click.stop="() => handleSelect(item.batchId)">
          <div class="history-size-block-top flex items-center space-between">
            <div class="history-size-block-icon flex-items-center">
              <SvgIcon name="history-size-icon" class="history-size-icon-class" />
              <span class="size-no">{{ item.goodsName }}</span>
            </div>
            <div class="history-size-delete" @click.stop="() => handleDelete(item.batchId)">
              <SvgIcon name="delete" />
            </div>
          </div>
          <div class="history-size-block-content flex space-between">
            <template v-for="secItem in item.goodsSizes" :key="secItem.id">
              <div class="history-size-items">
                <div class="history-size-items-content font-level4">
                  {{ secItem?.length }}*{{ secItem?.width }}*{{ secItem?.height }}*{{ secItem?.count
                  }}<template v-if="secItem?.singleWeight">*{{ secItem?.singleWeight }}</template>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
  <KyEmpty :type="EmptyTypeEnum.DATA" description="暂无数据" v-if="!loading && historySizeList.length <= 0" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { getHistorySize, deleteHistorySize } from '@order-public-sub-public/apis/product-info/index'
import { HistorySizeList } from '@order-public-sub-public/apis/product-info/types'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { usePreWaybillGoodsSizeList } from '../../hooks/useState'
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import { EmptyTypeEnum, MAX_DELAY_TIME } from '@order-public-sub-public/constants'

const router = useRouter()

const historyLoading = ref(false)
const historySizeList = ref<HistorySizeList[]>([])

const loading = ref(true)

const { setPreWaybillGoodsSizeList } = usePreWaybillGoodsSizeList()

const fetchHistorySizeList = async () => {
  try {
    historyLoading.value = true
    const { data } = await getHistorySize({ sourceId: 10 })

    historySizeList.value = data?.batchSizeList || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHistorySizeList()
})

const handleDelete = async (batchId: number) => {
  await showKyDialog({
    zIndex: 1000,
    title: '温馨提示',
    message: '确定要删除此条历史尺寸吗？',
    cancelButtonText: '取消',
    showCancelButton: true,
    confirmButtonText: '确定',
  })
  const selectHistorySize = historySizeList.value?.filter((item) => item.batchId === batchId)?.[0]
  try {
    await deleteHistorySize({ batchIdList: [selectHistorySize.batchId] })
    const resultHistoryList = historySizeList.value.filter((item) => item.batchId !== batchId)
    historySizeList.value = resultHistoryList
  } catch (error) {
    console.error(error)
  }
}

const handleSelect = (batchId: number) => {
  const selectHistorySize = historySizeList.value?.filter((item) => item.batchId === batchId)?.[0]?.goodsSizes
  const resultHistorySize = selectHistorySize?.map((item) => ({
    length: item.length,
    width: item.width,
    height: item.height,
    count: item.count,
    singleWeight: item.singleWeight || '',
  }))
  setPreWaybillGoodsSizeList(resultHistorySize)
  setTimeout(() => {
    router.back()
  }, MAX_DELAY_TIME)
}

/**
 * 触摸当前元素添加样式
 * @param event 触摸回调参数
 * @param isTouch true 触摸开始 false 触摸结束
 */
// const handleTouch = (event: MouseEvent | TouchEvent, isTouch: boolean, index?: number) => {
//   const eventTargetDom = event.target as HTMLElement
//   console.log('eventTargetDom:', eventTargetDom, isTouch)

//   const currentElement = document.querySelectorAll('.history-size-block')?.[index as number] as HTMLElement | null
//   if (!isTouch) {
//     return currentElement && (currentElement.style.background = '#fff')
//   }

//   currentElement && (currentElement.style.background = 'rgb(79 9 217 / 6%)')

//   // if (eventTargetDom.localName !== 'span' && eventTargetDom.localName !== 'use') {
//   //   currentElement && (currentElement.style.background = 'rgb(79 9 217 / 6%)')
//   // }
// }
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
