<template>
  <div
    class="over-area-delivery"
    :class="{ disabled: disabled }"
    v-if="visible"
    id="overAreaDelivery_deliveryMode"
    data-validate="overAreaDelivery.deliveryMode"
    v-hotZone="{
      moduleType: ModuleType['超区派送'],
      visible: hotZoneVisible,
      validateCallback: validateCallback,
    }"
    :type="type"
    :visible="visible"
  >
    <HotZone :moduleType="ModuleType['超区派送']"></HotZone>
    <KyCell
      :no-bg-disabled="disabled"
      :value="showValue"
      title="超区派送"
      placeholder="请选择"
      :large-value="true"
      :required="true"
      @click="handleClick"
    />
    <BottomPopup
      :footerText="'确定'"
      title="超区派送"
      :show="modalShow"
      :style="{ height: '82%' }"
      :safeAreaInsetBottom="safeAreaBottom"
      showFooter
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
      <div class="over-area-delivery__options">
        <template v-if="filteredOptions.length">
          <div
            v-for="item in filteredOptions"
            :key="item.id"
            :class="`over-area-delivery__options-item ${item.checked.value ? 'selected' : ''} ${
              disabledToastTips && item.label === '网点自提' ? 'disabledToastTips' : ''
            }`"
            @click="onSelectSuperZoneOption(item)"
          >
            <div class="over-area-delivery__options-item-head">
              <div class="over-area-delivery__options-item-head-left">
                <div class="icon-select" :class="disabledToastTips && item.label === '网点自提' ? 'boderno' : ''">
                  <SvgIcon :name="'radio-disabled-unchecked'" v-if="disabledToastTips && item.label === '网点自提'" />
                  <SvgIcon name="check-icon" v-else-if="item.checked.value" />
                </div>
              </div>
              <div class="over-area-delivery__options-item-head-right">
                {{ item.label }}
                <span v-if="item.id === DeliveryMode.SUPER_ZONE">&nbsp;{{ data?.agent?.themeText || item.desc }}</span>
              </div>
            </div>
            <!-- 送货上门 -->
            <template v-if="item.id === DeliveryMode.SUPER_ZONE">
              <div class="over-area-delivery__options-item-content highlight">
                <SvgIcon name="dollar-reminder-line" class="icon" />
                <!-- 代理超区使用agent对象，返回的提示展示 -->
                <div class="over-area-delivery__tip" v-if="superZoneTip" v-html="superZoneTip"></div>
                <template v-else>
                  <div v-if="data && data.showFeeFlag" class="over-area-delivery__tip">
                    <text v-if="data.superAreaFee && data.superZoneDistance && data.superAreaUnitePrice">
                      预估超区费<text class="highlight">{{ decimal(data.superAreaFee) || 0 }}元</text>，超出{{
                        data.superZoneDistance || 0
                      }}km，收费价格：{{ decimal(data.superAreaUnitePrice) || 0 }}元/km
                    </text>
                    <text v-else>需收取一定超区费，具体以实际收费为准</text>
                  </div>
                  <div v-else class="over-area-delivery__tip">
                    超出{{ data?.superZoneDistance || 0 }}km，预估超区费按照付款公司报价计算，暂不支持查看
                  </div>
                </template>
              </div>
            </template>
            <!-- 网点自提 -->
            <div v-else class="over-area-delivery__options-item-content self-pick">
              <NetworkPickContent
                v-if="modalShow"
                v-model:phone="phoneData"
                v-model:phoneValid="phoneValid"
                v-model:isAgreement="isAgreement"
                :waybillNumber="waybillNumber"
                :pickupBranchInfo="data"
                :inputClass="inputClass"
                :disabled="!!(disabledToastTips && item.label === '网点自提')"
                ref="overAreaNetworkPickContentRef"
              />
            </div>
          </div>
        </template>
        <Skeleton v-else />
      </div>

      <template #footer>
        <KyButton block :loading="btnLoading" :loading-text="'确定'" @click="onConfirm">确定</KyButton>
      </template>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import NetworkPickContent from './components/self-pick-content/index.vue'
import Skeleton from './components/skeleton/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import useState from './hooks/useState'
import useData from './hooks/useData'
import { DeliveryMode, ModuleType } from '@order-public-sub-public/constants'
import { IOption } from './types'
import { OverAreaDelivery, Module, ChangeKeys } from '@order-public-sub-public/types'

import { useHotZone } from '@order-public-sub-public/hooks/useHotZone'
import { useModuleHotZone } from './hooks/useModuleHotZone'
import useEffect from '@order-public-sub-public/validate'
import { phone } from '@order-public-sub-public/utils/pattern'
import { setBranchCheck, showAgreement } from './components/agreement/hooks'
import { decimal } from '@order-public-sub-public/utils/filter'
import { useStore } from '@order-public-sub-public/store'
import { removeErrClassByDataValidate } from '@order-public-sub-public/validate/effect/effectBubble'
import HotZone from '@order-public-sub-public/components/business/hot-zone/index.vue'
const piniaStore = useStore()

const { effectBubble } = useEffect()
const { modalShow, options, phoneData, showValue, isAgreement } = useState()
const { data, waybillNumber, visible, orderState, branchConfig, homeDeliveryConfig, disabledToastTips } = useData()
const { validateCallback, hotZoneVisible } = useHotZone(ModuleType['超区派送'])
useModuleHotZone()
const { remoteCheck } = useEffect()
const btnLoading = ref(false)

defineProps<Module>()

// console.log('超区visible', visible, data, 'branchConfig, homeDeliveryConfig', branchConfig, homeDeliveryConfig)
const phoneValid = ref(false)

const handleClick = () => {
  modalShow.value = true
  const { selfPickupMobile } = orderState.value || {}
  phoneData.value = selfPickupMobile || ''
}

const inputClass = ref('overarea-delivery')

const overAreaNetworkPickContentRef = ref<InstanceType<typeof NetworkPickContent>[]>()

const popupStyles = computed(() => overAreaNetworkPickContentRef.value?.[0]?.popupStyles)

const safeAreaBottom = computed(() => overAreaNetworkPickContentRef.value?.[0]?.safeAreaBottom)

const superZoneTip = computed(() => data?.value?.agent?.tips)

const onSelectSuperZoneOption = (item: IOption) => {
  console.log('item click ...', item)
  if (disabledToastTips.value && item.label === '网点自提') {
    showToast(disabledToastTips.value)
    return
  }
  options.value?.forEach((option) => {
    if (option.id === item.id) {
      option.checked.value = !option.checked.value
    } else {
      option.checked.value = false
    }
  })
}

const filteredOptions = computed(() => options.value.filter((item) => itemVisible(item)))

// item项是否显示
const itemVisible = (item: IOption) => {
  switch (item.id) {
    case DeliveryMode.SUPER_ZONE:
      if (homeDeliveryConfig.value.visible) {
        return true
      }
      break
    case DeliveryMode.SELF_PICKUP:
      if (branchConfig.value.visible) {
        return true
      }
  }

  return false
}

const validate = () => {
  const checkedItem = options.value.find((option) => option.checked.value)
  const isSelectSelfPick = checkedItem?.id === DeliveryMode.SELF_PICKUP // 是否选择网点自提
  console.log('isSelectSelfPick', phoneData, isAgreement)
  const appendTo = document.querySelector('.over-area-delivery__options') || undefined
  if (isSelectSelfPick && !phoneData.value) {
    try {
      effectBubble([
        {
          key: 'pickupBranch.phone',
          passed: false,
          content: '请输入自提人手机号',
          bubbleConfig: {
            appendTo: appendTo,
            offset: [0, 18],
          },
        },
      ])
    } catch (error) {
      console.log('error', error)
    }
    return false
  }
  if (isSelectSelfPick && phoneData.value) {
    const result = phoneData.value.match(phone)
    if (!result) {
      // showToast('请输入正确手机号码')
      try {
        effectBubble([
          {
            key: 'pickupBranch.phone',
            passed: false,
            content: '请输入正确手机号码',
            bubbleConfig: {
              appendTo: appendTo,
            },
          },
        ])
      } catch (error) {
        console.log('error', error)
      }
      return false
    }
  }
  if (isSelectSelfPick && !isAgreement.value) {
    showAgreement()
    return false
  }
  return true
}

/**
 * 根据配置信息校验
 */
const preValidate = (checkedItem: IOption) => {
  const isSelectSelfPick = checkedItem?.id === DeliveryMode.SELF_PICKUP // 是否选择网点自提
  const isSelectHome = checkedItem?.id === DeliveryMode.SUPER_ZONE // 是否选择送货上门
  // 配置了网点自提必填校验
  if (branchConfig.value.required) {
    if (!isSelectSelfPick) {
      // 没有选择网点自提则校验不通过
      showToast('必须选择网点自提')
      return false
    }
  } else if (homeDeliveryConfig.value.required) {
    // 配置了送货上门必填校验
    if (!isSelectHome) {
      showToast('必须选择送货上门')
      return false
    }
  }

  return true
}

const onConfirm = async () => {
  try {
    const checkedItem = options.value.find((option) => option.checked.value)
    const params: OverAreaDelivery = {}
    if (checkedItem) {
      btnLoading.value = true
      const prePass = preValidate(checkedItem)
      if (!prePass) {
        btnLoading.value = false
        return
      }
      const pass = validate()
      if (!pass) {
        btnLoading.value = false
        return
      }
      params.deliveryMode = checkedItem?.id
      if (checkedItem?.id === DeliveryMode.SELF_PICKUP) {
        // 自提需要更多信息
        params.selfPickupMobile = phoneData.value
        params.selfPickBranchId = data.value?.selfLiftingDepotId
        params.selfPickBranchName = data.value?.selfLiftingDepot
      }
    } else {
      return showToast('请选择收货方式')
    }
    // 如果选择了送货上门，则清空网点自提手机号
    if (checkedItem && checkedItem.id === DeliveryMode.SUPER_ZONE) {
      params.selfPickupMobile = ''
      params.selfPickBranchId = ''
      params.selfPickBranchName = ''
    }

    btnLoading.value = false
    modalShow.value = false

    console.log('提交超区store参数', params)
    piniaStore.order.updateOrderByType({
      type: ModuleType['超区派送'],
      data: params,
    })

    await remoteCheck('overAreaDelivery')
  } catch (error) {
    console.log('error', error)
    btnLoading.value = false
  } finally {
    btnLoading.value = false
  }
}

const onClose = () => {
  modalShow.value = false
  resetStatus()
}

// 点击取消时重置状态
const resetStatus = () => {
  // 充值列表点击状态和手机号等信息
  const { deliveryMode, selfPickupMobile } = orderState.value || {}
  options.value?.forEach((option) => {
    option.checked.value = option.id === deliveryMode
  })
  phoneData.value = selfPickupMobile || ''

  // 如果上一次选了网点自提重置勾选状态
  console.log('上一次勾选了协议', deliveryMode)
  if (deliveryMode === DeliveryMode.SELF_PICKUP) {
    setBranchCheck(true)
  }
  removeErrClassByDataValidate('pickupBranch.phone' as ChangeKeys)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
