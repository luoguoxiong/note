<template>
  <div class="popup-bottom">
    <BottomPopup
      :zIndex="99999"
      :showFooter="false"
      v-model:show="visible"
      @onClose="closePopup"
      class="goods-bottom-popup"
      :title="config.alias || '货好时间'"
      @closed="closed"
    >
      <template #header>
        <div class="good-time-header">
          {{ config.alias || '货好时间' }}
          <span v-if="isShowHindTip" @click="handleOpenHindMsg" class="good-time-header-content">
            <span class="good-time-header-content-tip">温馨提示 </span>
            <SvgIcon class="good-time-hind" name="good-time-hind" />
          </span>
        </div>
      </template>
      <Noticebar
        v-if="!isHideTips && (config.goodsTips || goodsTimeSchemaData?.aiGoodsTimeTips || editGoodsTimeByServiceTips)"
        v-exposure-report="exposureReportOption"
        :scrollable="false"
        leftIcon
        >{{
          htmlToPlainText(editGoodsTimeByServiceTips || goodsTimeSchemaData?.aiGoodsTimeTips || config.goodsTips || '')
        }}</Noticebar
      >
      <div class="goods-bottom-popup-content">
        <!-- 按线上逻辑 -->
        <OnlineTime :config="config" v-if="packageGoodsTimeType === 'online'" @close="close" />

        <!-- 自定义时间 -->
        <CustomeTime @hideTips="hideTips" :config="config" v-if="packageGoodsTimeType === 'custom'" @close="close" />
      </div>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import OnlineTime from './components/online/index.vue'
import CustomeTime from './components/custome/index.vue'
import { ModuleType, LimitResult } from '@order-public-sub-public/constants'
import { useModel, computed, ref, onMounted } from 'vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import { GoodsTimeConfig, GoodsTimeDimension } from '@order-public-sub-public/types'
import { EGoodsTimeHindMap } from '../../type'
import { useStore } from '@order-public-sub-public/store'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { getUserSettingInfoByKey } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { updateLimitResult } from '@order-public-sub-public/validate/limit'
import { goodsTimeClosedReport } from '../../hooks/report'
import { editGoodsTimeByServiceTips, openGoodsTimeByService } from '../../hooks/state'
import { htmlToPlainText } from '@order-public-sub-public/utils/filter'
import Noticebar from '@order-public-sub-public/components/base/ky-noticebar/noticebar.vue'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

const piniaStore = useStore()

const isHideTips = ref(false)
const goodsTimeOptimizeInfo = ref()
interface PopupProps {
  visible?: boolean
  config: GoodsTimeConfig
}
const hideTips = (val: boolean) => {
  isHideTips.value = val
}
const goodsTimeSchemaData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['货好时间'])
})

const isShowHindTip = computed(() => {
  const { type } = goodsTimeOptimizeInfo.value || {}
  return type === EGoodsTimeHindMap.显示
})

const emits = defineEmits<{
  (event: 'update:visible', visible: boolean): void
}>()

const props = withDefaults(defineProps<PopupProps>(), {
  visible: false,
})

// 货好时间类型  online: 按线上逻辑 | custom: 自定义时间
const packageGoodsTimeType = computed(() => {
  return props.config.packageGoodsTimeType
})

const visible = useModel(props, 'visible')

const close = () => {
  isHideTips.value = false
  emits('update:visible', false)
}
const closePopup = () => {
  isHideTips.value = false
  openGoodsTimeByService.value = false
  editGoodsTimeByServiceTips.value = ''
  emits('update:visible', false)
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_goodstime_control_v1',
    },
    {
      button_name: '关闭货好时间',
    },
  )
}

const closed = () => {
  goodsTimeClosedReport()
}

// 上报参数
const exposureReportOption = computed(() => {
  return {
    eventCode: 'exp_express_single_ai_time_v1',
    regionCode: 'pop',
    otherParams: () => {
      return { ai_strategy_code: goodsTimeSchemaData.value?.strategyId || '' }
    },
  }
})

// 获取新客提示、
const getDefaultGoodTimeData = async () => {
  const data = await getUserSettingInfoByKey('goodsTimeOptimizeInfo')
  goodsTimeOptimizeInfo.value = data
}

// 打开提示弹框
const handleOpenHindMsg = async () => {
  const { msg } = goodsTimeOptimizeInfo.value || {}
  try {
    await showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      message: msg,
      titleIcon: 'https://ic-img.ky-express.com/netc/20250227_93467474288_!!1740645123751_341_308.png',
      allowHtml: true,
      cancelButtonText: '否',
      showCancelButton: false,
      confirmButtonText: '我知道了',
    })

    updateLimitResult({
      type: 'goodsTime',
      flag: LimitResult.拒绝,
    })
  } catch (error) {
    console.log('handleOpenHindMsg', error)
  }
}

onMounted(() => {
  getDefaultGoodTimeData()
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
