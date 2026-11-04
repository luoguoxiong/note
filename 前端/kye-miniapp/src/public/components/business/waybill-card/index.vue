<template>
  <view class="waybill-card">
    <view class="waybill-card-head" @click.stop>
      <view class="waybill-card-head-left" @tap="copyClick" @touchstart="null">
        <slot name="headLeft" v-if="$slots.headLeft"></slot>
        <view class="waybill-card-number" v-else>
          <image v-if="waybillParentIndenDetail" :src="waybillParentIndenDetail" />
          <text>{{ baseInfo.waybillNumber || baseInfo.orderNumber || '--' }}</text>
        </view>
        <view class="waybill-card-copy">
          <image src="https://ic-img.ky-express.com/netc/20250726_6224_!!1753496748755_56_56.png" />
        </view>
      </view>
      <slot v-if="baseInfo.waybillNumber" name="headRight"></slot>
    </view>
    <view class="waybill-card-content">
      <view
        v-if="
          functionInfo.storageFeeStatus.showStatus && [10, 20].includes(+functionInfo.storageFeeStatus.operateStatus)
        "
        class="waybill-card-absolute"
      >
        {{ functionInfo.storageFeeStatus.showText }}
      </view>
      <view class="waybill-card-info">
        <slot name="cardInfoLeft"></slot>
        <view class="waybill-card-info-right">
          <view v-if="baseInfo.waybillNumber" class="waybill-card-info-head">
            <view class="send-receive-info">
              <text v-if="isSenderReceiverFieldVisible('deliveryCity')" class="send-receive-info__city" overflow="ellipsis">{{ delivery.city || '--' }}</text>
              <view class="send-flex send-align-center">
                <view v-if="isSenderReceiverFieldVisible('deliveryPerson')" class="send-receive-info__name">
                  {{ delivery.person || '--' }}
                </view>
                <ky-tag
                  v-if="functionInfo?.showUnRealAuthLabel?.showStatus"
                  size="3"
                  bgColor="#FFF3F3"
                  borderColor="#FFAFAB"
                  textColor="#FF706D"
                  class="real-tag"
                >
                  未实名
                </ky-tag>
              </view>
              <view v-if="isSenderReceiverFieldVisible('deliveryCustomerName')" class="send-receive-info__company">
                {{ delivery.customerName || '--' }}
              </view>
            </view>
            <view class="send-receive-logistics">
              <view v-if="isSenderReceiverFieldVisible('waybillStatusDesc')" :class="['waybill-status', { 'status-error': waybillErrorStatus }]">{{
                newExteriorRouteInfo.routeStepDesc || baseInfo.waybillStatusDesc || '--'
              }}</view>
              <image :src="transportImage" mode="aspectFit" />
              <view v-if="isSenderReceiverFieldVisible('serviceModeDesc')" class="waybill-service">
                {{ baseInfo.serviceModeDesc || '--' }}
              </view>
            </view>
            <view class="send-receive-info send-receive-info-right">
              <text v-if="isSenderReceiverFieldVisible('pickupCity')" class="send-receive-info__city" overflow="ellipsis">
                {{ (baseInfo.waybillBusinessRange === 10 ? pickup.country : pickup.city) || '--' }}
              </text>
              <view v-if="isSenderReceiverFieldVisible('pickupPerson')" class="send-receive-info__name">
                {{ pickup.person || '--' }}
              </view>
              <view v-if="isSenderReceiverFieldVisible('pickupCustomerName')" class="send-receive-info__company">
                {{ pickup.customerName || '--' }}
              </view>
            </view>
            <view class="stamp-box">
              <image v-if="tipsInfo" :src="STAMP_IMAGE_DIC[tipsInfo.sealType]" />
            </view>
          </view>
          <view v-else class="waybill-card-info-head">
            <view class="send-receive-info">
              <text class="send-receive-info__city" overflow="ellipsis">{{ delivery.customerName || '--' }}</text>
              <view class="send-receive-info__company2">{{ delivery.address || '--' }}</view>
            </view>
            <view class="stamp-box">
              <image v-if="tipsInfo" :src="STAMP_IMAGE_DIC[tipsInfo.sealType]" />
            </view>
          </view>
        </view>
      </view>
      <slot name="cardContent" v-if="$slots.cardContent"></slot>
      <view class="waybill-card-extra">
        <!-- 运单信息：动态组件渲染 -->
        <component
          v-for="(field, index) in visibleWaybillFields"
          :key="field.code"
          :is="getFieldComponent(field.code)"
          :code="field.code"
          :name="field.name"
          :waybillData="waybillData"
          :activeStatusTab="activeStatusTab"
          :showTags="index === tagFieldIndex"
        />

        <!-- 没有任何字段时兜底展示时间状态标签 -->
        <TimeTagsField v-if="tagFieldIndex === -1" :waybillData="waybillData" />

        <view
          :class="{ 'notice-box-card': noticeList.length > 1, 'mt-24': noticeList.length === 1 }"
          v-if="cardSource !== 'home'"
        >
          <view v-for="(ele, index) in noticeList" :key="index + 'box'" class="notice-box-item-card">
            <WaybillTips
              v-if="tipsVisible && (expand || index < 1)"
              :visible="true"
              :management="ele.sealType === null ? ele.limitReason : ele.sealType"
              :limitReason="ele.limitReason"
              :limitType="ele.limitType"
              :showWatermarkType="ele.showWatermarkType"
              @close="tipsVisible = false"
              :content="ele.showPaperwork"
              @onConfirmBarClick="handleTips(ele)"
            />
          </view>
          <view class="more-btn-card" @click.stop="handleMoreBtn" v-if="noticeList.length > 1">
            <image
              src="https://ic-img.ky-express.com/netc/20251010_75332_!!1760077218284_30_16.png"
              :class="{ 'expand-card': expand }"
              alt=""
              class="more-btn-img-card"
            ></image>
          </view>
        </view>

        <view
          class="waybill-card-extra-applyStatus"
          v-if="functionInfo.agingApplyStatus.showStatus"
          @click.stop="() => emit('applyStatusClick')"
        >
          <view class="waybill-card-extra-applyStatus-text"> 点击审核“货好时间”变更，超时未审自动同意 </view>
          <image
            class="waybill-card-extra-applyStatus-icon"
            src="https://ic-img.ky-express.com/netc/20250726_3393_!!1753498972424_64_64.png"
            mode="aspectFit"
          />
        </view>
        <view
          v-if="functionInfo.showLabelFlag.showStatus && functionInfo.showLabelFlag.showText"
          class="waybill-card-extra-label"
          @click.stop="() => emit('labelClick', functionInfo.showLabelFlag.showText)"
        >
          <image
            v-if="isWaybill"
            class="waybill-card-extra-label-icon"
            src="https://ic-img.ky-express.com/netc/20250603_31972831183_!!1748937025813_81_76.png"
            mode="aspectFit"
          />
          <text class="waybill-card-extra-label-text" overflow="ellipsis">
            标签：{{ functionInfo.showLabelFlag.showText || '--' }}
          </text>
        </view>
      </view>
    </view>
    <slot name="cardBottom"></slot>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { ref, computed, watchEffect } from 'vue'
import { copyText } from '@public/utils/copy'
import WaybillTips from './components/waybill-tips/index.vue'
import { STAMP_IMAGE_DIC } from './constant'
import { ISearchWeb } from './types'
import type { CardConfig } from './config/types'
import { DEFAULT_CARD_CONFIG } from './config/defaultConfig'
import { WaybillInfoCode } from './config/codes'
import { getFieldComponent, isFieldVisible } from './fields'
import TimeTagsField from './fields/TimeTagsField.vue'
import { WAYBILL_CONFIG_STATUS } from '@public/constants/cardConfig'


const props = withDefaults(
  defineProps<{
    waybillData?: ISearchWeb
    isWaybill?: boolean
    cardSource?: string
    cardConfig?: CardConfig
    activeStatusTab?: WAYBILL_CONFIG_STATUS
  }>(),
  {
    waybillData: undefined,
    isWaybill: false,
    cardConfig: undefined,
    activeStatusTab: undefined,
  },
)

const emit = defineEmits([
  'labelClick',
  'limitRemind',
  'applyStatusClick',
  'copyReportClick',
  'handleMoreBtn',
  'functionClick',
])

const noticeList = computed(() => {
  return props.waybillData?.tipsInfo?.tips || []
})

/** 获取有效配置（有外部配置用外部配置，否则用默认配置） */
const effectiveConfig = computed<CardConfig>(() => {
  return props.cardConfig || DEFAULT_CARD_CONFIG
})

/** 判断寄收信息字段是否显示 */
const isSenderReceiverFieldVisible = (code: string): boolean => {
  const field = effectiveConfig.value.senderReceiverConfig.fields.find((f) => f.code === code)
  return field ? field.visible : true
}

/** 获取会实际渲染的运单信息字段（配置 visible + 组件内部 show 逻辑） */
const visibleWaybillFields = computed(() => {
  return effectiveConfig.value.waybillInfoConfig.fields
    .filter((field) => field.visible && isFieldVisible(field.code, props.waybillData, props.activeStatusTab))
})

/** 时间字段 code 集合 */
const TIME_FIELD_CODES = [
  WaybillInfoCode.GOODS_TIME,
  WaybillInfoCode.DELIVERY_TIME,
  WaybillInfoCode.RECEIVE_TIME,
  WaybillInfoCode.CREATION_DATE,
]

/** 状态标签应该跟随的字段索引：优先最后一个时间字段，否则最后一个字段 */
const tagFieldIndex = computed(() => {
  const fields = visibleWaybillFields.value

  for (let i = fields.length - 1; i >= 0; i--) {
    if (TIME_FIELD_CODES.includes(fields[i].code as WaybillInfoCode)) return i
  }

  return fields.length - 1
})

const expand = ref(false)
const handleMoreBtn = () => {
  expand.value = !expand.value
  // 虚拟列表需要更新高度
  emit('handleMoreBtn')
}

const baseInfo = ref()
const delivery = ref()
const pickup = ref()
const newExteriorRouteInfo = ref()
const functionInfo = ref()
const tipsInfo = ref()

watchEffect(() => {
  baseInfo.value = props.waybillData?.waybill?.baseInfo || {}
  delivery.value = props.waybillData?.waybill?.delivery || {}
  pickup.value = props.waybillData?.waybill?.pickup || {}
  newExteriorRouteInfo.value = props.waybillData?.newExteriorRouteInfo || {}
  functionInfo.value = props.waybillData?.functionInfo || {}
  tipsInfo.value = props.waybillData?.tipsInfo || {}
})

const waybillErrorStatus = computed(() => {
  return newExteriorRouteInfo.value.routeStepDesc === '派送异常' || baseInfo.value.waybillStatusDesc === '派送异常'
})

const waybillParentIndenDetail = computed(() => {
  const waybillParentInden = Number(baseInfo.value.waybillParentInden)
  switch (waybillParentInden) {
    case 10:
      return 'https://ic-img.ky-express.com/netc/20250604_70672831149_!!1749040591045_56_56.png'
    case 20:
      return 'https://ic-img.ky-express.com/netc/20250604_64072831121_!!1749040579299_56_56.png'
    default:
      return ''
  }
})

const tipsVisible = ref(true)

const transportImage = computed(() => {
  const routeStep = newExteriorRouteInfo.value.routeStep
  switch (Number(routeStep)) {
    case 0:
    case 10:
    case 20:
    case 30:
    case 90:
      return 'https://ic-img.ky-express.com/netc/20221024_24751702280_!!1666594467845_207_21.png'
    case 70:
      return 'https://ic-img.ky-express.com/netc/20221024_26651702265_!!1666594452088_207_21.png'
    case 80:
      return 'https://ic-img.ky-express.com/netc/20221024_6755170220_!!1666594418055_207_21.png'
    default:
      return 'https://ic-img.ky-express.com/netc/20221024_89051702247_!!1666594380930_207_21.png'
  }
})

// const management = ref<EManagementStyle>(EManagementStyle.Flood)

const handleTips = (ele) => {
  console.log('handleTips >>> ', tipsInfo.value)
  console.log('isNotshowRestrictTips >>>>> ', props.waybillData.isNotshowRestrictTips)
  switch (Number(ele.showWatermarkType)) {
    case 1:
    case 111:
      emit('limitRemind')
      break
    default:
      break
  }
  // tipsInfo.sealType
}

const copyClick = () => {
  copyText(baseInfo.value.waybillNumber || baseInfo.value.orderNumber)
  emit('copyReportClick', {
    waybill_order: baseInfo.value.waybillNumber || baseInfo.value.orderNumber,
  })
}
</script>
