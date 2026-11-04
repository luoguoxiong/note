<!-- 控货 -->
<template>
  <div
    class="goods-control"
    v-if="visible && defaultModuleDimensionData?.goodsControl?.visible"
    v-exposure-report="exp_express_informdelivery_v1()"
  >
    <!-- 头 -->
    <div class="goods-control-title-box">
      <div
        class="goods-control-title font-level3 flex items-center"
        :class="moduleStyle !== 'unfold' ? 'fontBold' : ''"
      >
        <span class="mr-8">定时派送</span>
        <SvgIcon
          v-if="!checkResultListTips"
          @click="handleClickTips"
          v-click-report="clk_express_informdelivery_desc_v1()"
          class="desc-icon"
          name="tip-label-color"
        />
        <div class="error-tip-box" v-if="!!goodsControl">
          <SvgIcon name="dollar-reminder-line" />
          选择该服务后，将会收取{{ getGoodsControlFee + (getGoodsControlFee ? '元' : '') }}等通知服务费
        </div>
      </div>
      <template v-if="checkResultListTips && moduleStyle === 'unfold'">
        <div class="goods-control-title-label" v-html="checkResultListTips"></div>
      </template>
    </div>

    <!-- 内容 -->
    <div class="goods-control-content" v-if="!checkResultListTips || moduleStyle !== 'unfold'">
      <template v-for="item in optionList" :key="item.type">
        <div class="goods-control-content-item flex items-center" @click.stop="() => handleGoodsControl(item)">
          <div class="goods-control-content-item-circle"></div>
          <div class="font-level3">{{ item.typeName }}</div>
          <div class="goods-control-content-item-desc font-level5">{{ item.desc }}</div>
          <div class="goods-control-content-item-icon">
            <SvgIcon
              v-if="item.disabled && goodsControl === item.type"
              class="goods-control-content-item-icon"
              name="radio-disabled-checked"
            />
            <SvgIcon
              v-else-if="item.disabled && goodsControl !== item.type"
              class="goods-control-content-item-icon"
              name="radio-disabled-unchecked"
            />
            <SvgIcon
              v-else-if="!item.disabled && goodsControl === item.type"
              class="goods-control-content-item-icon"
              name="radio-checked"
            />
            <SvgIcon v-else class="goods-control-content-item-icon" name="radio-unchecked" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { FieldsConfig, AddedServiceDimension, goodsControlOption } from '@order-public-sub-public/types'
import { useGoodsControl } from '../../hooks/useState'
import { useValidate } from '../../hooks/useValidate'
import { useRouter } from '@order-public-sub-public/vue-router/index'
import { ModuleStyle, ModuleType, FeeTypeEnum } from '@order-public-sub-public/constants'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { useUpdateOrderStore } from '../../hooks/useModuleStore'
import {
  exp_express_informdelivery_v1,
  clk_express_informdelivery_delivery_v1,
  clk_express_informdelivery_despatch_v1,
  clk_express_informdelivery_desc_v1,
} from '@order-public-sub-public/components/business/added-service/hooks/report'
import { goodsControlEnum } from '@order-public-sub-public/components/business/added-service/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const router = useRouter()

const props = defineProps<FieldsConfig & { moduleStyle: string }>()
const checkResultListTips = computed(() => {
  let result = ''
  const checkResultList = piniaStore.globalData.checkResultList
  if (checkResultList && checkResultList.length > 0) {
    checkResultList.forEach((item) => {
      if (item.key === 'addedService.goodsControl' && item.showType === 2) {
        result = item.content
      }
    })
  }
  return result
})
const defaultModuleDimensionData = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])
})
const optionList = computed(() => {
  return defaultModuleDimensionData.value?.goodsControl?.optionList
})

watch(
  () => optionList.value,
  () => {
    if (optionList.value && optionList.value.length) {
      if (optionList.value.every((v) => v.disabledTips)) {
        setGoodsControl('')
      }
    }
  },
)

const { goodsControl, setGoodsControl } = useGoodsControl()

const { useAddedServiceValidate } = useValidate()

const handleClickTips = () => {
  router.push({
    path: '/order-service-introduction',
    query: {
      type: 'goods-control',
    },
  })
}
const handleGoodsControl = async (item: goodsControlOption) => {
  if (item.disabled) {
    showToast(item.disabledTips)
    return
  }
  const value = item.type
  let str = ''
  if (goodsControl.value !== value) {
    // 反选
    str = value
  }
  setGoodsControl(str)
  item.type === '10'
    ? clk_express_informdelivery_despatch_v1(item, str)
    : clk_express_informdelivery_delivery_v1(item, str)

  if (props.moduleStyle === 'unfold') {
    useUpdateOrderStore({
      goodsControl: goodsControl.value,
    })
  }

  if (str === goodsControlEnum.等通知派送 && props.moduleStyle === ModuleStyle.平铺) {
    setBranchSelfPickupDisabled()
  }
  try {
    await useAddedServiceValidate({ field: 'goodsControl' })
  } catch (error) {
    console.error(error)
  }
}

//前端切换等通知派送后，先置灰不可选择，防止用户直接选择网点自提
const setBranchSelfPickupDisabled = () => {
  const visible = piniaStore.globalData.dynamicConfig('branchSelfPickUp')?.visible
  piniaStore.globalData.setDynamicConfigItem({
    configItem: {
      key: 'branchSelfPickUp',
      value: {
        visible: visible || false,
        required: false,
        disabled: true,
        disabledToastTips: '已选择等通知派送，暂不支持网点自提',
        disabledTips: '已选择等通知派送，暂不支持网点自提',
      },
    },
  })
}

const curWaybillNumber = computed(() => piniaStore.order.waybillNumber)

// 获取运费信息
const getGoodsControlFee = computed(() => {
  let goodsControlFee = ''

  let responsesMap = piniaStore.globalData.estimatedCost?.responsesMap || {}
  const addedValueDetailTipList =
    responsesMap[curWaybillNumber.value as string]?.feeResponse?.addedValueDetailTipList ?? []

  goodsControlFee =
    (addedValueDetailTipList?.find((v) => v.type === FeeTypeEnum.等通知服务费)?.feeAmount as unknown as string) ?? ''
  console.log(goodsControlFee, 'goodsControlFeegoodsControlFee')
  return goodsControlFee ? Number(goodsControlFee).toFixed(2) : ''
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
