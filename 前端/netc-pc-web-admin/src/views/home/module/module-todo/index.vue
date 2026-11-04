<template>
  <Content :is-empty="tabData.length === 0" :is-loading="homeStatus.todoIsLoading">
    <ExpTodo></ExpTodo>
    <div class="todo-wrap" v-if="tabData.length > 1">
      <div class="tab-wrap">
        <Tab :data="tabData" :active="activeLocateTo" @change="handleTabChange"></Tab>
      </div>
      <div class="card-wrap">
        <Card
          v-if="cardData.length > 0"
          :data="cardData"
          :current="current"
          :isPayment="cardInfo.isPayment"
          :title="cardInfo.title"
          :todoCount="cardInfo.todoCount"
          @to-more="cardInfo.toMore"
          @change="changeCurrent"
        >
          <template #default="{ data }">
            <PayMonth :data="data" v-if="data.locateToType === TodoTabEnum.PAYMENT && data.billType === 0"></PayMonth>
            <PayIndividual
              :data="data"
              v-if="data.locateToType === TodoTabEnum.PAYMENT && data.billType === 1"
            ></PayIndividual>
            <PayAuthWaybill
              :data="data"
              :isActive="data.isActive"
              v-if="data.locateToType === TodoTabEnum.PAY_AUTH && data.authType === PayAuthTypeEnum.WAYBILL"
            ></PayAuthWaybill>
            <PayAuthIndidual
              :data="data"
              v-if="data.locateToType === TodoTabEnum.PAY_AUTH && data.authType !== PayAuthTypeEnum.WAYBILL"
            ></PayAuthIndidual>
            <PermissionApproval
              :data="data"
              v-if="data.locateToType === TodoTabEnum.AUTH_APPROVAL"
            ></PermissionApproval>
            <WaybillApproval :data="data" v-if="data.locateToType === TodoTabEnum.WAYBILL_APPROVAL"></WaybillApproval>
          </template>
        </Card>
        <Empty v-if="cardData.length === 0"></Empty>
      </div>
    </div>
    <div class="single-card" v-if="tabData.length === 1">
      <Card
        v-if="cardData.length !== 0"
        :data="cardData"
        :current="current"
        :isPayment="cardInfo.isPayment"
        :title="cardInfo.title"
        :todoCount="cardInfo.todoCount"
        @to-more="cardInfo.toMore"
        @change="changeCurrent"
      >
        <template #default="{ data }">
          <PayMonth :data="data" v-if="data.locateToType === TodoTabEnum.PAYMENT && data.billType === 0"></PayMonth>
          <PayIndividual
            :data="data"
            v-if="data.locateToType === TodoTabEnum.PAYMENT && data.billType === 1"
          ></PayIndividual>
          <PayAuthWaybill
            :data="data"
            :current="current"
            :isActive="data.isActive"
            v-if="data.locateToType === TodoTabEnum.PAY_AUTH && data.authType === PayAuthTypeEnum.WAYBILL"
          ></PayAuthWaybill>
          <PayAuthIndidual
            :data="data"
            v-if="data.locateToType === TodoTabEnum.PAY_AUTH && data.authType !== PayAuthTypeEnum.WAYBILL"
          ></PayAuthIndidual>
          <PermissionApproval :data="data" v-if="data.locateToType === TodoTabEnum.AUTH_APPROVAL"></PermissionApproval>
          <WaybillApproval :data="data" v-if="data.locateToType === TodoTabEnum.WAYBILL_APPROVAL"></WaybillApproval>
        </template>
      </Card>
      <Empty v-if="cardData.length === 0"></Empty>
    </div>
  </Content>
</template>
<script lang="ts" setup>
import Content from './content/index.vue'
import Card from './card/index.vue'
import Empty from './empty/index.vue'
import Tab from './tab/index.vue'
import ExpTodo from './exp-todo/index.vue'
import PayMonth from './pay-month/index.vue' // 费用支付 月结
import PayIndividual from './pay-individual/index.vue' //费用支付 散客
import PayAuthWaybill from './payAuth-waybill/index.vue' //付款授权 运单
import PayAuthIndidual from './payAuth-individual/index.vue' //付款授权 企业或个人
import PermissionApproval from './permission-approval/index.vue' // 权限审批
import WaybillApproval from './waybill-approval/index.vue' // 权限审批
import { computed, onMounted, ref } from 'vue'
import { useHomeStore, useLinkTo } from '@/hooks'
import { Any } from '@/types/common'
import { PayAuthTypeEnum, SubModuleCode, TodoTabEnum } from '@/apis/home/types'
import { locationRouteV2 } from '@/utils/appBridge'
import { pageActivatedAction } from '@/utils/eventemitter/modules/pageOnActivated'
import EE from '@/utils/eventemitter'
import { baseReportInstance } from '@/reportUmp'
const { pendingItems, updatePaddingItmesTab, homeStatus, showPayment, showPayAuth, showAuth, showWaybill } =
  useHomeStore()

const current = ref(0)

onMounted(() => {
  EE.on(pageActivatedAction['首页更新'], () => {
    current.value = 0
  })
})

const { linkToPay, linkPayAuth } = useLinkTo()

const setArrayItemLocateToType = (array: Any[] | null, locateTo: string) => {
  return (array ? array : []).map((item) => ({
    ...item,
    locateToType: locateTo,
  }))
}

const cardInfo = computed(() => {
  // 定位 tab 可能被展示开关过滤，统一用兜底后的 activeLocateTo 取内容
  if (pendingItems.value && activeLocateTo.value) {
    const { paymentVO, payAuthCount, wayBillApprovalCount, authApprovalCount } = pendingItems.value
    const maps = {
      [TodoTabEnum.PAYMENT]: {
        title: '费用支付',
        isPayment: true,
        todoCount: paymentVO ? 1 : 0,
        toMore: () => {
          linkToPay(encodeURIComponent(paymentVO?.moreDirectUrl || ''))
          window.$umpOtherReport(
            'CLK',
            {
              eventCode: 'clk_homepage_fee_payment_todo_view_more_v1',
            },
            {
              region_code: 'fee_payment_todo',
              pay_type: paymentVO?.billType === 0 ? '账单' : '现结',
            }
          )
        },
      },
      [TodoTabEnum.PAY_AUTH]: {
        title: '付款授权',
        isPayment: false,
        type: TodoTabEnum.PAY_AUTH,
        todoCount: payAuthCount || 0,
        toMore: () => {
          window.$umpOtherReport(
            'CLK',
            {
              eventCode: 'clk_homepage_pay_accredit_todo_view_more_v1',
            },
            {
              region_code: 'pay_accredit_todo',
            }
          )
          console.log('hhh', baseReportInstance.get('click_id'))
          sessionStorage.setItem('click_id', baseReportInstance.get('click_id'))
          linkPayAuth({})
        },
      },
      [TodoTabEnum.AUTH_APPROVAL]: {
        title: '权限审批',
        isPayment: false,
        todoCount: authApprovalCount || 0,
        toMore: () => {
          window.$umpOtherReport(
            'CLK',
            {
              eventCode: 'clk_homepage_authority_approval_todo_view_more_v1',
            },
            {
              region_code: 'authority_approval_todo',
            }
          )
          console.log('hhh', baseReportInstance.get('click_id'))
          sessionStorage.setItem('click_id', baseReportInstance.get('click_id'))
          locationRouteV2.push({
            // 优先消费接口下发跳链，缺省兜底写死容器路由（显式 query 覆盖 path 内嵌同名参数）
            path: pendingItems.value?.authApprovalList?.[0]?.viewMoreUrl || '/admin/permission-manage',
            query: {
              activeTab: '10',
              needQuerySave: 'false',
              pre_click_id: baseReportInstance.get('click_id'),
            },
          })
        },
      },
      [TodoTabEnum.WAYBILL_APPROVAL]: {
        title: '运单审批',
        isPayment: false,
        todoCount: wayBillApprovalCount || 0,
        toMore: () => {
          window.$umpOtherReport(
            'CLK',
            {
              eventCode: 'clk_homepage_waybill_approval_todo_see_more_v1',
            },
            {
              region_code: 'waybill_approval_todo',
            }
          )
          console.log('hhh', baseReportInstance.get('click_id'))
          sessionStorage.setItem('click_id', baseReportInstance.get('click_id'))
          locationRouteV2.push({
            // 优先消费接口下发跳链，缺省兜底写死容器路由（显式 query 覆盖 path 内嵌同名参数）
            path: pendingItems.value?.wayBillApprovalList?.[0]?.viewMoreUrl || '/admin/permission-manage',
            query: {
              activeTab: '20',
              needQuerySave: 'false',
              pre_click_id: baseReportInstance.get('click_id'),
            },
          })
        },
      },
    }
    return maps[activeLocateTo.value]
  }
  return {
    title: '',
    todoCount: 0,
    isPayment: false,
    toMore: undefined,
    expInfo: undefined,
  }
})

const cardData = computed(() => {
  if (pendingItems.value && activeLocateTo.value) {
    const { paymentVO, payAuthList, authApprovalList, wayBillApprovalList } = pendingItems.value
    switch (activeLocateTo.value) {
      case TodoTabEnum.PAYMENT:
        return setArrayItemLocateToType(paymentVO ? [paymentVO] : [], TodoTabEnum.PAYMENT)
      case TodoTabEnum.PAY_AUTH:
        return setArrayItemLocateToType(payAuthList, TodoTabEnum.PAY_AUTH)
      case TodoTabEnum.AUTH_APPROVAL:
        return setArrayItemLocateToType(authApprovalList, TodoTabEnum.AUTH_APPROVAL)
      case TodoTabEnum.WAYBILL_APPROVAL:
        return setArrayItemLocateToType(wayBillApprovalList, TodoTabEnum.WAYBILL_APPROVAL)
      default:
        return []
    }
  } else {
    return []
  }
})

const tabData = computed(() => {
  const handleTodoCount = (count: number | null): string => {
    const Max = 99
    if (!count) return '(0)'
    else if (count >= 1 && count <= Max) return `(${count})`
    else {
      return `(${Max}+)`
    }
  }
  if (pendingItems.value) {
    const { payAuthCount, wayBillApprovalCount, authApprovalCount, paymentVO } = pendingItems.value
    // 如果全部数据都为空，则展示暂无数据
    if (!payAuthCount && !wayBillApprovalCount && !authApprovalCount && !paymentVO) {
      return []
    }
    const todoTabs: { label: string; value: TodoTabEnum }[] = [
      {
        label: `费用支付${handleTodoCount(paymentVO ? 1 : null)}`,
        value: TodoTabEnum.PAYMENT,
      },
      {
        label: `付款授权${handleTodoCount(payAuthCount)}`,
        value: TodoTabEnum.PAY_AUTH,
      },
      {
        label: `权限审批${handleTodoCount(authApprovalCount)}`,
        value: TodoTabEnum.AUTH_APPROVAL,
      },
      {
        label: `运单审批${handleTodoCount(wayBillApprovalCount)}`,
        value: TodoTabEnum.WAYBILL_APPROVAL,
      },
    ]

    if (!paymentVO) {
      todoTabs.splice(0, 1)
    }
    // 各 tab 是否展示由首屏接口下发的开关控制
    const showFlagMaps: Any = {
      [SubModuleCode.PAYMENT]: showPayment.value,
      [SubModuleCode.PAY_AUTH]: showPayAuth.value,
      [SubModuleCode.AUTH_APPROVAL]: showAuth.value,
      [SubModuleCode.WAYBILL_APPROVAL]: showWaybill.value,
    }
    return todoTabs.filter((item) => showFlagMaps[item.value as Any])
  }
  return []
})

/**
 * 当前生效的 tab 定位
 * 后端 locateTo 或历史定位（sessionStorage todoTab）可能指向已被展示开关过滤掉的 tab，
 * 此时兜底切到第一个可见 tab；全部不可见时为空串，模块走 Content 空态
 */
const activeLocateTo = computed<TodoTabEnum | ''>(() => {
  const rawLocateTo = pendingItems.value?.locateTo
  if (rawLocateTo && tabData.value.some((tab) => tab.value === rawLocateTo)) {
    return rawLocateTo
  }
  return tabData.value[0]?.value ?? ''
})

const handleTabChange = (tabVal: TodoTabEnum) => {
  updatePaddingItmesTab(tabVal)
  current.value = 0
}

const changeCurrent = (val: number) => {
  current.value = val
  const locateTo = activeLocateTo.value
  if (!locateTo) return
  const eventCodeEnum = {
    [TodoTabEnum.PAYMENT]: undefined,
    [TodoTabEnum.PAY_AUTH]: 'clk_homepage_pay_accredit_todo_card_switch_v1',
    [TodoTabEnum.WAYBILL_APPROVAL]: 'clk_homepage_waybill_approval_todo_card_switch_v1',
    [TodoTabEnum.AUTH_APPROVAL]: 'clk_homepage_authority_approval_todo_card_switch_v1',
  }
  const regionCodeEnum = {
    [TodoTabEnum.PAYMENT]: 'fee_payment_todo',
    [TodoTabEnum.PAY_AUTH]: 'pay_accredit_todo',
    [TodoTabEnum.WAYBILL_APPROVAL]: 'waybill_approval_todo',
    [TodoTabEnum.AUTH_APPROVAL]: 'authority_approval_todo',
  }
  const eventCode = eventCodeEnum[locateTo]
  const region_code = regionCodeEnum[locateTo]
  if (eventCode && region_code)
    window.$umpOtherReport(
      'CLK',
      {
        eventCode,
      },
      {
        region_code,
      }
    )
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
