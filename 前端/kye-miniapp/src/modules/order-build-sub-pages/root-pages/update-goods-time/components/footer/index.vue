<template>
  <div class="update-goods-time-footer">
    <div class="ky-radio-content">
      <KyRadio :is-checked="isAllChecked" @click="checkAll">
        <div class="radio-text">
          <span class="all-check">全选</span><span class="number-text">已选{{ checkedList.length }}票运单</span>
        </div>
      </KyRadio>
    </div>
    <div class="ky-button-content">
      <KyButton
        text="修改货好时间"
        loading-text="修改货好时间"
        :loading="confirmLoading"
        @click="editGoodsTimeHandel"
      />
    </div>
  </div>

  <GoodsTimePopup
    v-if="showGoodsTimePopup && goodsTimeVo"
    @selectTime="selectTimeConfirm"
    :goodsTimeVo="goodsTimeVo"
    v-model:visible="showGoodsTimePopup"
    :config="goodsTimeConfig"
    v-exposure-report="exp_order__pickuptime_change_V1()"
  />
</template>
<script setup lang="ts">
import KyRadio from '@order-public-sub-public/components/base/ky-radio-v2/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import GoodsTimePopup from '@order-public-sub-public/components/ui/goods-time-popup/index.vue'
import { isAllChecked, checkedList, goodsTimeVo, confirmLoading, batchEditGoodsInfo } from '../../hooks/state'
import { checkAll, getGoodsTimeConfigData } from '../../hooks/updateState'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { ref } from 'vue'
import { GoodsTimeType } from '@order-public-sub-public/constants'
import { GoodsTime } from '@order-public-sub-public/types'
import { batchGoodstimeUpdate } from '@order-public-sub-public/apis/update-goods-time'
import { saveBatchId } from '@order-public-sub-public/configs'
import {
  PageTypeEnum,
  useBatchSaveTryCheck,
} from '@order-public-sub-root-pages/batch-restrict-new/hooks/useSaveAndCheck'
import { $native as native } from '@order-public-sub-public/utils'
import { currentRestrictType, RestrictType } from '@order-public-sub-root-pages/batch-restrict-new/hooks/useState'
import {
  clk_order__pickuptime_change_V1,
  clk_order_pickuptime_change_button_v1,
  exp_order__pickuptime_change_V1,
} from '../../hooks/useReport'

const emits = defineEmits(['editGoodsTimeHandel', 'reload'])

getGoodsTimeConfigData()

const showGoodsTimePopup = ref(false)

const goodsTimeConfig = ref({
  alias: '修改货好时间',
  packageGoodsTimeType: GoodsTimeType.CUSTOM,
})

const editGoodsTimeHandel = () => {
  clk_order_pickuptime_change_button_v1({ button_name: '修改货好时间' })
  if (checkedList.value.length <= 0) {
    showToast('请您勾选需要修改货好时间的运单')
    return
  }
  showGoodsTimePopup.value = true
}

const selectTimeConfirm = async (goodsTimeData: { type: string; data: GoodsTime }) => {
  confirmLoading.value = true
  currentRestrictType.value = RestrictType.批量修改货好时间
  const waybillNumbers = checkedList.value.map((item) => item.waybillNumber)
  const source = await native?.getSource()
  const params = {
    source: source?.source ?? '',
    waybillNumbers,
    goodsTime: goodsTimeData.data.goodsTime,
    goodsTimeFlag: goodsTimeData.data.goodsTimeFlag || undefined,
  }

  batchEditGoodsInfo.value = {
    newGoodsTime: {
      goodsTime: goodsTimeData.data.goodsTime,
      goodsTimeFlag: goodsTimeData.data.goodsTimeFlag || undefined,
    },
    waybillNumbers,
  }

  clk_order__pickuptime_change_V1({ button_name: goodsTimeData.data.goodsTimeFlag ? '现在货号' : '选择货好时间' })
  let resBatchId = ''
  try {
    const { data } = await batchGoodstimeUpdate(params)
    const { batchId } = data || {}
    resBatchId = batchId || ''
  } catch (error) {
    console.log('error', error)
    confirmLoading.value = false
  }

  if (resBatchId) {
    saveBatchId(resBatchId)
    try {
      const targetPageType = await useBatchSaveTryCheck(PageTypeEnum.运单提交)
      if (targetPageType === 'update-goods-time') {
        emits('reload')
      }
    } finally {
      confirmLoading.value = false
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
