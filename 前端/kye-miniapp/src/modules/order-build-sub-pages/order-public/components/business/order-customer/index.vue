<template>
  <div class="order-company" :data-show-brand="showBrand && !templateList?.length">
    <!-- 不显示公司时，margin-top会被隐藏，需要一个高度撑开，避免寄收信息直接跑到顶部 -->
    <div v-if="!visible" class="order-company-hide"></div>
    <div class="order-customer" v-if="visible" id="OrderCustomer" :class="{ 'is-scan': isScan }">
      <Cell
        title=""
        @click="pickHandel"
        placeholder="请选择"
        :value="orderCustomerValue || orderCustomer || ''"
        :needRightIcon="!disabled"
        v-exposure-report="{
          eventCode: 'exp_express_single_customer_v1',
        }"
      >
        <template #title>
          <SvgIcon class="icon-order-customer" name="order-customer"></SvgIcon>
          <span>当前下单公司</span>
        </template>
        <template #value>
          <text class="customer-value">{{ orderCustomer?.customerName || orderCustomerValue?.customerName }}</text>
          <text class="customer-value-item" v-if="orderCustomer?.departmentName">
            ({{ orderCustomer.departmentName }})</text
          >
        </template>
      </Cell>
    </div>
  </div>
</template>
<!-- @include hairline(after, $border-bottom-color, bottom); -->
<script setup lang="ts">
// TODO 目录注释规范
import { watchEffect, computed, ref, nextTick, watch } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import Cell from '@order-public-sub-public/components/base/ky-cell/index.vue'
import {
  Channel,
  ModuleType,
  OrderConfigType,
  OrderPageType,
  ReturnWaybillBackType,
} from '@order-public-sub-public/constants'
import { effectMasker } from '@order-public-sub-public/validate/effect/effectPopup'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import router from '@order-public-sub-public/router'
import { useRoute } from '@order-public-sub-public/vue-router/index'
import { awaitOrderPageShow } from '@order-public-sub-public/validate/utils'
import { OrderConsumer, Module } from '@order-public-sub-public/types'
import { templateList } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { useBindCustomer } from '@public/hooks/useBindCustomer'
import { initData } from './hooks/useChangeInit'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { orderPageScrollTop } from '@order-public-sub-root-pages/order-single/hooks/useScrollTop'
import { handleCropText } from '@order-public-sub-public/utils'
import { useDidShow } from '@tarojs/taro'
const piniaStore = useStore()
// import { sleep } from '@order-public-sub-public/utils/sleep'
const { customerInfo, openCustomerPage, onCustomerCodeChange, fetchUserDepartmentId } = useBindCustomer()

const props = defineProps<{
  cacheCustomerValue?: OrderConsumer
}>()
const moduleData = computed(() => {
  return props.cacheCustomerValue || piniaStore.schema.moduleDimensionData(ModuleType['下单公司'])
})

const disabled = computed(() => {
  return !!moduleData.value?.disabledSwitch
})

const isReturnSend = computed(() => {
  const orderPageType = piniaStore.root.getOrderPageType
  return orderPageType === 'order-back'
})

const visible = ref(false)
const orderCustomerValue = ref({})
const bindCustomerCodeFlag = computed(() => {
  return piniaStore.extend.orderCustomer.bindCustomerCodeFlag
})

const showBrand = computed(() => {
  return router.currentRoute.value.name === 'order-batch'
    ? false
    : piniaStore.schema.moduleConfigData(ModuleType.Banner, true)?.visible || false
})

const isScan = ref(false)
const _router = useRoute()
watchEffect(() => {
  const checkData = piniaStore.schema.getSchemaOrderConfig(OrderConfigType['切换客户编码']) as boolean
  visible.value = checkData && bindCustomerCodeFlag.value && !isReturnSend.value

  const query = _router.query
  const channel = query.channel as Channel
  isScan.value = channel === Channel.扫二维码下单
})

let maskerFun: () => void
const isHasMask = ref(false)

const needBindCustomerCode = computed(() => {
  return piniaStore.extend.orderCustomer.needBindCustomerCode
})
const showNeedBindCustomerCodeMasker = async () => {
  await awaitOrderPageShow()
  await nextTick()
  if (isHasMask.value) {
    return
  }
  maskerFun = await (
    await effectMasker({
      blockedFlag: true,
      callback: () => {
        showToast('请先绑定客户编码')
      },
      topSelector: ['Sender', 'OrderCustomer', 'Banner'],
    })
  ).unmount
  isHasMask.value = true
  console.log('创建了遮罩')
}

watchEffect(async () => {
  if (needBindCustomerCode.value) {
    showNeedBindCustomerCodeMasker()
  } else {
    await awaitOrderPageShow()
    isHasMask.value = false
    console.log('needBindCustomerCode.value111', maskerFun, needBindCustomerCode.value)
    maskerFun && maskerFun()
  }
})
const orderCustomer = computed(() => {
  let { customerName = '', departmentName = '' } = moduleData.value || {}
  customerName = handleCropText(customerName, departmentName ? 6 : 14)
  departmentName = handleCropText(departmentName, 5)
  return {
    customerName,
    departmentName,
  }
})

watch(
  () => orderCustomer.value,
  async () => {
    const initPromise = piniaStore.globalData.initDataPromise
    try {
      await initPromise
    } catch (error) {
      console.log('initPromise error', error)
    }
    orderCustomerValue.value = orderCustomer.value
  },
)

// 部门id改变
const departmentIdChangeFlag = ref(false)
// 进入了绑定客户编码页面
const enterBindingCodePage = ref(false)
const currentDepartmentId = ref('')

const updateInit = () => {
  orderPageScrollTop.value = 0
  orderCustomerValue.value = customerInfo.value?.customerShortName || ''
  initData()
  piniaStore.extend.updateIsShowBind({ value: false })
}

onCustomerCodeChange((data) => {
  if (piniaStore.root.getOrderPageType !== OrderPageType.单票) return
  if (departmentIdChangeFlag.value) {
    return
  }
  if ((moduleData.value?.customerCode || '') !== (data || '')) {
    console.log('order-customer2 useDidShow')
    updateInit()
  }
})

useDidShow(() => {
  if (enterBindingCodePage.value) {
    departmentIdChange()
  }
})

const departmentIdChange = async () => {
  try {
    const departmentId = await getFetchUserDepartmentId()
    if (departmentId !== currentDepartmentId.value) {
      departmentIdChangeFlag.value = true
      console.log('order-customer3 useDidShow', departmentId, currentDepartmentId.value)
      enterBindingCodePage.value = false
      currentDepartmentId.value = ''
      updateInit()
      setTimeout(() => {
        departmentIdChangeFlag.value = false
      }, 2000)
    }
  } catch (error) {
    console.log('error', error)
  }
}

const pickHandel = () => {
  if (disabled.value) {
    return
  }
  enterBindingCodePage.value = true
  setDepartmentId()
  openCustomerPage()
}

const setDepartmentId = async () => {
  currentDepartmentId.value = await getFetchUserDepartmentId()
}

const getFetchUserDepartmentId = async () => {
  try {
    const departmentInfo = (await fetchUserDepartmentId()) as { departmentId: string }
    return departmentInfo?.departmentId || ''
  } catch (error) {
    return ''
  }
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
