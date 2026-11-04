<template>
  <div class="popup-bottom">
    <BottomPopup
      :style="popupStyles"
      @open="initShowTpl"
      :showFooter="false"
      v-model:show="visible"
      :close-on-click-overlay="true"
      @onClose="closePop"
      class="paymode-popup-bottom"
      title="付款方式"
      :safeAreaInsetBottom="safeAreaBottom"
      @on-confirm="selectTip"
      @closed="closed"
    >
      <div v-if="visibleTip" class="pay-mode-tip flex items-center">
        <img
          class="pay-mode-img"
          src="https://ic-img.ky-express.com/netc/20240202_99767474279_!!1706840377582_96_96.png"
        />
        <span>如需收方付/第三方付请在运单信息页面选择</span>
      </div>
      <div class="main-content pay-mode-input">
        <div class="tab-content">
          <template :key="index" v-for="(item, index) in moduleList">
            <div
              class="tab-item"
              v-if="item.visible"
              :class="[{ last: index === 3 }, { active: item.name === curTpl }]"
              @click="clickTab(item)"
              v-click-report="{
                eventCode: 'clk_express_payment_method_v1',
                otherParams: () => {
                  return { button_name: item.label }
                },
              }"
            >
              {{ item.label }}
            </div>
          </template>
        </div>
        <div class="tpl-content">
          <keep-alive v-if="curTpl">
            <component
              @confirmHandel="confirm"
              @backToSend="backToSend"
              :key="curTpl"
              :loading="loading"
              @loadChange="loadChange"
              :is="ModuleMap[curTpl]"
              :info="moduleItem"
              ref="componentRef"
            />
          </keep-alive>
        </div>
        <div class="footer-content" v-if="!curTpl">
          <KyButton
            color="#8365F6"
            loading-text="确定"
            :loading="loading"
            class="confirm-btn"
            value="确定"
            @click="selectTip"
          />
        </div>
      </div>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import { useModel, ref, nextTick, computed } from 'vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import PaymentByReceiving from '../payment-by-receiving/index.vue'
import PaymentBySender from '../payment-by-sender/index.vue'
import PaymentByThird from '../payment-by-third/index.vue'
import { PayMethod, PayModeType } from '@order-public-sub-public/types'
import { AuthorizeStatusEnum } from '@order-public-sub-public/components/business/pay-mode/type'
import { confirmData } from '../../type'
import { businessConfigType, LimitResult, ModuleType, OrderPageType, PayMode } from '@order-public-sub-public/constants'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import {
  submit,
  updatePayAuthorizeAction,
} from '@order-public-sub-public/components/business/pay-mode/hooks/useConfirm'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { useKeyboardPopupStyles } from '@order-public-sub-public/hooks/useKeyboardPopupStyles'
import { performanceMark } from '@order-public-sub-public/utils/reportConfig'
import { reportPerception } from '@order-public-sub-public/reportUmp/util/index'
import { payPopupClosedReport } from '../../hooks/report'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

let moduleItem = ref<PayMethod>({
  label: '',
  name: '',
  visible: true,
  required: true,
  paymentAccount: '',
})

const componentRef = ref()

const loading = ref(false)
const loadChange = (val: boolean) => {
  loading.value = val
}
interface PopupProps {
  visible?: boolean
  unifiedInfoSwitcher?: boolean
  moduleList?: PayMethod[]
}
const props = withDefaults(defineProps<PopupProps>(), {
  visible: false,
  unifiedInfoSwitcher: false,
})
type KeyOfModuleMap = keyof typeof ModuleMap //也可以手动 'recipient' | 'xx'| 'xxx'

const ModuleMap = {
  recipientPay: PaymentByReceiving,
  senderPay: PaymentBySender,
  thirdPartyPay: PaymentByThird,
}

const orderPageType = piniaStore.root.getOrderPageType
const visibleTip = computed(
  () =>
    (orderPageType === OrderPageType.批量寄 || orderPageType === OrderPageType.批量寄单票) && props.unifiedInfoSwitcher,
)

const { popupStyles, safeAreaBottom, handleInputs, removeEvents } = useKeyboardPopupStyles()

const curTpl = ref<KeyOfModuleMap>()

const visible = useModel(props, 'visible')

const emits = defineEmits<{
  (event: 'update:visible', visible: boolean): void
  (event: 'submit', data: confirmData): void
}>()

const close = () => {
  performanceMark('payModeCloseStart15')
  loading.value = false
  emits('update:visible', false)
  removeEvents('.pay-mode-input')
  console.log('下单_寄件页_付款方式_弹窗消失')

  nextTick(() => {
    performanceMark('payModeCLoseEnd16')

    const extend1 = JSON.stringify(window?.performance?.getEntriesByType('mark')) || ''

    const requestPerformance = window?.performance
      ?.getEntries()
      ?.filter((item: any) => item.initiatorType === 'xmlhttprequest' && item.name.includes('singleProcess'))
      ?.reverse()?.[0]

    const extend2 = JSON.stringify(requestPerformance) || ''

    // console.log(extend1)
    // console.log(extend2)

    window.$umpOtherReport(
      'CLK',
      {
        eventCode: 'ks_app_module_performance_pay_mode',
      },
      {
        extend1: extend1,
        extend2: extend2,
      },
    )
  })
}
const closePop = () => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_pay_control_v1',
    },
    {
      button_name: '关闭',
    },
  )
  close()
}
const clickTab = (item: PayMethod) => {
  moduleItem.value = item
  curTpl.value = item.name as KeyOfModuleMap
  handleTabBlur()
  nextTick(() => {
    handleInputs('.pay-mode-input', 'input')
  })
}

const handleTabBlur = () => {
  if (componentRef.value?.handleInputBlur) {
    componentRef.value?.handleInputBlur()
  }
}

const confirm = (data: confirmData) => {
  // 性能埋点
  window?.performance?.clearMarks()

  performanceMark('payModeStart1')
  // 是否需要付款授权的配置结果
  const needLimits = piniaStore.schema.getSchemaBusinessConfig(businessConfigType['付款授权'])

  performanceMark('payModeGetStoreData2')

  if (data.authorizeStatus === AuthorizeStatusEnum.未授权 && needLimits) {
    showKyDialog({
      zIndex: 1000,
      title: '温馨提示',
      confirmButtonText: '继续',
      cancelButtonText: '返回',
      showCancelButton: true,
      message: data.msg || '',
    })
      .then(() => {
        data.payAuthorizeConfirm = LimitResult.确认
        submit(data, (isloading?: string) => {
          if (isloading && isloading === 'loading') {
            loading.value = false
          } else {
            emits('submit', data)
            close()
          }
        })
      })
      .catch(() => {
        loading.value = false
        curTpl.value = 'senderPay'
        updatePayAuthorizeAction(LimitResult.取消)
      })
    return
  } else {
    submit(data, (isloading?: string) => {
      if (isloading && isloading === 'loading') {
        loading.value = false
      } else {
        close()
      }
    })
  }
}

const initShowTpl = () => {
  const payModeData = piniaStore.order.moduleFormData(ModuleType.付款方式)
  if (props?.visible && payModeData?.payMode) {
    const payMode = props.unifiedInfoSwitcher ? PayMode.寄方付 : payModeData.payMode
    switch (payMode) {
      case '10':
        curTpl.value = 'senderPay'
        break
      case '20':
        curTpl.value = 'recipientPay'
        break
      case '30':
        curTpl.value = 'thirdPartyPay'
        break
    }

    nextTick(() => {
      removeEvents('.pay-mode-input')
      handleInputs('.pay-mode-input', 'input')
    })
  }
  // 默认选中第一个付款方式
  const firstTab = props.moduleList && props.moduleList.find((v) => v.visible)
  const payMode = piniaStore.order.moduleFormData(ModuleType['付款方式'])?.payMode
  if (props?.visible && !payMode && firstTab) {
    moduleItem.value = firstTab
    curTpl.value = firstTab.name as KeyOfModuleMap
    // clickTab(firstTab)
  }
  nextTick(() => {
    if (props.moduleList && props.moduleList.length > 0) {
      reportPerception('other_express_paymente_popup_perception_v1')
    }
  })
}

const closed = () => {
  payPopupClosedReport()
}

const backToSend = () => {
  curTpl.value = 'senderPay'
}

const selectTip = () => {
  showToast('请选择付款方式')
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_pay_control_v1',
    },
    {
      button_name: '确定',
    },
  )
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
