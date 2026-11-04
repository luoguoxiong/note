<template>
  <div
    :class="[onlyOne ? 'onlyOne branch-self-pickup' : 'branch-self-pickup', { fence: fenceTipsVisible }]"
    v-if="fieldsConfig.length > 0 && visible"
    :type="type"
    :visible="visible"
  >
    <KyCell
      :value="showValue"
      title="网点自提"
      :no-bg-disabled="disabled"
      class="branch-self-pickup-kycell"
      :placeholder="disabledToastTips ? disabledToastTips : '请选择'"
      :required="required"
      @click="handleClick"
      :large-value="true"
      :isLink="!disabledToastTips"
      id="branchSelfPickUp_selfPickBranchId"
      data-validate="branchSelfPickUp.selfPickBranchId"
      v-exposure-report="{
        eventCode: 'exp_express_single_wdzt_v1',
        regionCode: 'send_info',
      }"
      v-click-report="{
        eventCode: 'clk_express_self_pickup_v1',
        regionCode: 'send_info',
      }"
    >
      <template #value v-if="fenceTipsVisible">
        <div class="ky-cell-value"><span class="icon-fence"></span> {{ fenceTips }}</div>
      </template>
    </KyCell>

    <BottomPopup
      title="网点自提"
      :show="modalShow"
      :style="popupStyles"
      :safeAreaInsetBottom="safeAreaBottom"
      :showFooter="!onlyOne"
      footer-text="确定"
      @onClose="onClose"
      @onConfirm="onConfirm"
      :loading="btnLoading"
      :customStyle="customStyle"
      :class="onlyOne ? 'onlyOne branch-self-pickup__popup' : 'branch-self-pickup__popup'"
    >
      <Noticebar leftIcon>选择后跨越将取消送货上门，需收方自行前往网点提货</Noticebar>
      <div class="branch-self-pickup__options">
        <template v-if="options.length">
          <div
            v-for="item in options"
            :key="item.id"
            :class="`branch-self-pickup__options-item ${item.checked.value ? 'selected' : ''}`"
            @click="onSelectSuperZoneOption(item)"
          >
            <div class="branch-self-pickup__options-item-head">
              <div class="branch-self-pickup__options-item-head-left" v-if="!onlyOne">
                <div class="icon-select">
                  <SvgIcon name="check-icon" v-if="item.checked.value" class="check-icon" />
                </div>
              </div>
              <div class="branch-self-pickup__options-item-head-right">
                {{ item.label }}
              </div>
            </div>
            <!-- 网点自提 -->
            <div class="branch-self-pickup__options-item-content self-pick">
              <NetworkPickContent
                v-if="modalShow"
                v-model:phone="phoneData"
                v-model:phoneValid="phoneValid"
                v-model:isAgreement="isAgreement"
                :waybillNumber="waybillNumber"
                :pickupBranchInfo="pickupBranchInfo"
                :isBranchSelfPickup="true"
                ref="branchSelfPickupNetworkPickContentRef"
              />
            </div>
          </div>
          <div class="footer" v-if="onlyOne">
            <div
              loading-text="暂不需要"
              text="暂不需要"
              class="btn noNeed"
              type="danger"
              @click="onConfirm('暂不需要')"
            >
              <van-icon
                v-if="btnLoading && onConfirmBtn === '暂不需要'"
                :name="loadingImg"
                class="loadingImg"
              ></van-icon>
              暂不需要
            </div>
            <KyButton
              loading-text="确定"
              text="确定"
              class="need btn"
              type="primary"
              @click="onConfirm('确定')"
              :loading="btnLoading && onConfirmBtn === '确定'"
            ></KyButton>
          </div>
        </template>
        <template v-else>
          <Skeleton />
        </template>
      </div>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import KyCell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import NetworkPickContent from '../over-area-delivery/components/self-pick-content/index.vue'
import Skeleton from './components/skeleton/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import useData from './hooks/useData'
import useState from './hooks/useState'
import { ModuleType } from '@order-public-sub-public/constants'
import { IOption } from './types'
import { BranchSelfPickUpFence, ChangeKeys, Module, OverAreaDelivery } from '@order-public-sub-public/types'

import useEffect from '@order-public-sub-public/validate'
import Noticebar from '@order-public-sub-public/components/base/ky-noticebar/noticebar.vue'
import { phone } from '@order-public-sub-public/utils/pattern'
import { setBranchCheck, showAgreement } from '../over-area-delivery/components/agreement/hooks'
import { usePhoneChange } from './hooks/effect'
import { checked as isAgreementChecked } from '@order-public-sub-public/components/business/over-area-delivery/components/agreement/hooks'
import { removeErrClassByDataValidate } from '@order-public-sub-public/validate/effect/effectBubble'
import { clk_express_self_pickup_control_v1, other_express_self_pickup_control_v1 } from './hooks/useReport'
import { useGlobalPopover } from '@order-global-package-order-sub/components/business/popover-effect/hooks/useUpdate'
// import { pxToRem } from './utils'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const loadingImg = 'https://ic-img.ky-express.com/netc/20250619_80997_!!1750313700109_80_80.png'
const { remoteCheck, effectBubble } = useEffect()
const { removeValidateSinge } = useGlobalPopover()
const btnLoading = ref(false)
// const nobtnLoading = ref(false)

defineProps<Module>()

const { modalShow, options, phoneData, showValue } = useState()
const { data, waybillNumber, orderState, visible, required, disabledToastTips, fieldsConfig } = useData()

const branchSelfPickupNetworkPickContentRef = ref<InstanceType<typeof NetworkPickContent>[]>()
const orderPageType = computed(() => piniaStore.root.getOrderPageType)

const popupStyles = computed(() => branchSelfPickupNetworkPickContentRef.value?.[0]?.popupStyles)

const safeAreaBottom = computed(() => branchSelfPickupNetworkPickContentRef.value?.[0]?.safeAreaBottom)

const pickupBranchInfo: any = computed(() => {
  const item = data.value?.selfPickBranchesList[0]
  return {
    selfLiftingDepot: item?.branchName,
    selfLiftingAddress: item?.selfLiftingAddress,
    senderLat: item?.branchLat,
    senderLng: item?.branchLng,
    branchLat: item?.branchLat,
    branchLng: item?.branchLng,
    superZoneDistance: item?.receiptAddressDistance,
    selfLiftingDepotId: item?.branchId,
  }
})

// 报关出入仓、进展、出展费用提示
const fenceTips = computed(() => {
  const branchSelfPickUpFence = piniaStore.schema.moduleDimensionData(ModuleType['网点自提减免提示'])
  return branchSelfPickUpFence?.branchSelfPickUpFenceTips
})

const fenceTipsVisible = computed(() => {
  return !disabledToastTips.value && fenceTips.value && !showValue.value
})

const isAgreement = ref(false)
const phoneValid = ref(false)
const onConfirmBtn = ref('确定')

usePhoneChange()
// 设置固定高度：避免在ios上因为校验样式导致高度变化
const customStyle = computed(() => {
  return {
    // height: pxToRem(394),
  }
})

const handleClick = () => {
  if (disabledToastTips.value) {
    showToast(disabledToastTips.value)
    return
  }
  modalShow.value = true
  isAgreement.value = isAgreementChecked.value
}

const onSelectSuperZoneOption = (item: IOption) => {
  options.value?.forEach((option) => {
    if (option.id === item.id) {
      option.checked.value = !option.checked.value
    } else {
      option.checked.value = false
    }
  })
}
const onlyOne = computed(() => {
  return options.value.length === 1
})
const validate = async () => {
  const checkedItem = options.value.find((option) => option.checked.value)
  const appendTo = document.querySelector('.branch-self-pickup__options') || undefined
  if (checkedItem && !phoneData.value) {
    try {
      await effectBubble(
        [
          {
            key: 'pickupBranch.phone',
            passed: false,
            content: '请输入自提人手机号',
            bubbleConfig: {
              appendTo: appendTo,
              offset: [0, 18],
            },
          },
        ],
        {
          needFirstToast: false,
        },
      )
    } catch (error) {
      console.log('error', error)
    }
    return false
  }
  if (checkedItem && phoneData.value) {
    const result = phoneData.value.match(phone)
    if (!result) {
      try {
        await effectBubble(
          [
            {
              key: 'pickupBranch.phone',
              passed: false,
              content: '请输入正确手机号码',
              bubbleConfig: {
                appendTo: appendTo,
              },
            },
          ],
          {
            needFirstToast: false,
          },
        )
      } catch (error) {
        console.log('error', error)
      }
      return false
    }
  }
  if (checkedItem && !isAgreement.value) {
    showAgreement()
    return false
  }
  return true
}
// eslint-disable-next-line max-lines-per-function
const onConfirm = async (btn: string) => {
  onConfirmBtn.value = btn
  try {
    if (btn === '暂不需要' && onlyOne.value) {
      options.value[0].checked.value = false
    }
    if (btn === '确定' && onlyOne.value) {
      options.value[0].checked.value = true
    }
    const checkedItem = options.value.find((option) => option.checked.value)
    const params: OverAreaDelivery = {}
    console.log('onConfirm checkedItem', checkedItem)
    btnLoading.value = true
    if (checkedItem) {
      const pass = await validate()
      if (!pass) {
        btnLoading.value = false
        return
      }
      params.selfPickupMobile = phoneData.value
      params.selfPickBranchId = pickupBranchInfo.value?.selfLiftingDepotId
      params.selfPickBranchName = pickupBranchInfo.value?.selfLiftingDepot
    } else if (required.value) {
      btnLoading.value = false
      other_express_self_pickup_control_v1({
        request_result: '失败',
        failure_reason: '请选择自提点部',
      })
      return showToast('请选择自提点部')
    } else {
      // 提交store参数，走到这里表示清空了数据
      params.selfPickupMobile = ''
      params.selfPickBranchId = ''
      params.selfPickBranchName = ''
    }
    // 如果没有选中的话，就清空其他信息
    piniaStore.order.updateOrderByType({
      type: ModuleType['网点自提'],
      data: params,
      orderPageType: orderPageType.value,
    })

    modalShow.value = false

    btnLoading.value = false
    removeValidateSinge()
    await remoteCheck('branchSelfPickUp')
    console.log('confirm关闭')
    removeErrClassByDataValidate('pickupBranch.phone' as ChangeKeys)
    clk_express_self_pickup_control_v1({
      button_name: '确定',
      regionCode: 'send_info',
    })
    other_express_self_pickup_control_v1({
      request_result: '成功',
      failure_reason: '',
      regionCode: 'send_info',
    })
  } catch (error) {
    other_express_self_pickup_control_v1({
      request_result: '失败',
      failure_reason: error,
      regionCode: 'send_info',
    })
    btnLoading.value = false
  } finally {
    btnLoading.value = false
  }
}

const onClose = () => {
  modalShow.value = false
  clk_express_self_pickup_control_v1({
    button_name: '关闭',
    regionCode: 'send_info',
  })
  resetStatus()
}

// 点击取消时重置状态
const resetStatus = () => {
  // 充值列表点击状态和手机号等信息
  const { selfPickBranchId, selfPickupMobile } = orderState.value || {}
  options.value?.forEach((option) => {
    option.checked.value = option.id === selfPickBranchId
  })
  phoneData.value = selfPickupMobile || ''
  // 如果上一次选了网点自提重置勾选状态
  if (selfPickBranchId) {
    setBranchCheck(true)
  }
  removeErrClassByDataValidate('pickupBranch.phone' as ChangeKeys)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
