<template>
  <KButton v-if="!state.hasQueried && !state.showLoading" text size="small" class="loadpay" @click.stop="showMoney"
    >点击查看</KButton
  >
  <ButtonLoadingIcon v-if="state.showLoading" :src="LOADING_IMG" :size="15" :mr="0" />
  <span class="payMoney" v-if="state.hasQueried">
    {{ state.payMoney ? `￥${thousandSeparatorReplacer(`${state.payMoney}`, ',')}` : '--' }}
  </span>

  <KTooltip
    placement="bottom-start"
    :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [-12, 12] } }] }"
    content="预估费用为下单时预估费用，实际金额以详情页为准"
  >
    <KIcon class="question-icon" :size="12" color="var(--el-color-primary)"><Question /></KIcon>
  </KTooltip>
</template>
<script lang="ts" setup>
import { KButton, KIcon, KTooltip } from '@netc-design-pc/ui'
import { Question } from '@netc-design-pc/icons'
import ButtonLoadingIcon from '@/components/button-loading-icon/index.vue'
import { reactive } from 'vue'
import { thousandSeparatorReplacer } from '@/utils/regexp'
import { getForecastCost } from '@/apis/home'

const LOADING_IMG = 'https://ic-img.ky-express.com/netc/20240508_95570395148_!!1715157423511_15_15.png'
interface LoadPayProps {
  bacho: string
}
const props = defineProps<LoadPayProps>()
interface LoadPay {
  showLoading: boolean
  payMoney: string
  /** 是否已完成查询：区分"尚未查询"（显示点击查看）与"查询完成但无费用"（显示 --） */
  hasQueried: boolean
}
const state = reactive<LoadPay>({
  showLoading: false,
  payMoney: '',
  hasQueried: false,
})

const showMoney = async () => {
  try {
    state.showLoading = true
    const { data } = await getForecastCost([props.bacho])
    if (Array.isArray(data) && data.length > 0) {
      const { forecastCost } = data[0]
      state.payMoney = forecastCost ?? ''
    } else {
      state.payMoney = ''
    }
    state.hasQueried = true
  } catch (error) {
    console.log(error)
  } finally {
    state.showLoading = false
  }
}
</script>
<style lang="scss" scoped>
.loadpay {
  &.k-button {
    height: auto;
    min-height: 0;
    padding: 0;
    font-size: 12px;
  }
}
.payMoney {
  font-size: 12px;
  color: #24262b;
  display: flex;
  align-items: center;
}
.question-icon {
  margin-left: 4px;
  cursor: default;
}
</style>
