<template>
  <KMessageBoxDialog
    v-model="dialog.visible"
    dialog-type="feedback"
    title="温馨提示"
    :message="desc"
    @open="onOpen"
    show-close
  >
    <template #footer>
      <template v-if="dialog.type === 'customerCode'">
        <KButton v-if="scenario === 'oldNoBusiness'" type="default" @click="onApplyBusiness">申请专属商务</KButton>
        <KButton v-if="scenario === 'newNoBusiness'" type="default" @click="onBindCode">去绑码</KButton>
        <KButton v-if="scenario === 'hasBusiness'" type="default" @click="onContactBusiness">联系商务</KButton>
        <KButton @click="onConfirm">{{ confirmText }}</KButton>
      </template>
      <template v-else-if="dialog.type === 'order'">
        <KButton v-if="needApply" type="default" @click="closeDialog">取消</KButton>
        <KButton :loading="applying" @click="onOrderConfirm">
          {{ applying ? '申请中...' : needApply ? '立即申请' : '我知道了' }}
        </KButton>
      </template>
      <KButton v-else @click="closeDialog">我知道了</KButton>
    </template>
  </KMessageBoxDialog>
  <CommonContact v-if="showBusiness" :visible="showBusiness" @close="showBusiness = false" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { KButton, KMessageBoxDialog } from '@netc-design-pc/ui'
import CommonContact from '@/components/side-navigation/common-contact.vue'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'
import { useLinkTo } from '@/hooks/useLinkTo'
import { BindClientType } from '@/apis/user/types'
import { applyOrderPermission } from '@/apis/order'
import { showMessage } from '@/native/ui'

/**
 * 全局无权限/未绑码拦截弹窗（由路由守卫经 permission store 触发）
 * 未绑码场景对齐老项目 bindCodeClientConfirm（netc-pc-web routerGuard.js）：
 * 文案后端直出（getBindInfo.tips），按 clientType/hasBusiness/oldCustomer 分 4 种场景
 * 下单权限场景对齐老项目 orderPermissionGuardV2（netc-pc-web configOrderPermission.js）：
 * 文案后端直出（getOrderTips.content），未申请弹「立即申请」，审核中弹「我知道了」
 */

/** 未绑码弹窗场景 */
type BindScenario = 'change' | 'hasBusiness' | 'oldNoBusiness' | 'newNoBusiness'

const BIND_CODE_PATH = '/admin/user'
/** 老基座绑码页路径，经 realRoutePath 透传给个人中心子应用 */
const BIND_CODE_REAL_ROUTE = '/admin/user/cusCode'

const permissionStore = usePermissionStore()
const userStore = useUserStore()
// dialog 为 reactive 对象，解构保持响应；bindInfo 为 ref 需经 computed 访问（直接解构会丢失响应性）
const { dialog, closePermissionDialog } = permissionStore
const { linkToBindCode, linkToApplyCustomerCode } = useLinkTo()
const route = useRoute()

const showBusiness = ref(false)

const bindInfo = computed(() => permissionStore.bindInfo)

/** 下单权限：checkResultList[0] */
const orderResult = computed(() => permissionStore.orderTips?.checkResultList?.[0])

/** 报废/拉黑拦截文案（第一层，非空即拦截，仅单按钮「我知道了」） */
const orderBlockTip = computed(() => permissionStore.orderBlockTip)

/** 下单权限：'10' 未申请（弹「立即申请」+「取消」），否则审核中/报废拦截（单按钮「我知道了」） */
const needApply = computed(() => !orderBlockTip.value && orderResult.value?.extraData?.haveApply?.haveApply === '10')

/** 下单权限：申请按钮 loading */
const applying = ref(false)

/** 场景判定（对齐老项目分支；数据缺失时按 falsy 落「新客-未匹配商务」） */
const scenario = computed<BindScenario>(() => {
  const info = bindInfo.value
  if (!info) return 'newNoBusiness'
  if (info.clientType === BindClientType.CHANGE_CUSTOMER_CODE) return 'change'
  if (info.hasBusiness) return 'hasBusiness'
  return info.oldCustomer ? 'oldNoBusiness' : 'newNoBusiness'
})

const confirmText = computed(() => {
  if (scenario.value === 'change') return '去切换'
  if (scenario.value === 'newNoBusiness') return '申请专属商务'
  return '去绑码'
})

const desc = computed(() => {
  if (dialog.type === 'customerCode') {
    // 文案后端直出（getBindInfo.tips），无数据时兜底
    return bindInfo.value?.tips || '该页面需要绑定客户编码后才能访问，请先完成绑码'
  }
  if (dialog.type === 'order') {
    // 文案后端直出：报废/拉黑拦截（allowToOrderTip）优先，其次下单权限（getOrderTips.content）
    return orderBlockTip.value || orderResult.value?.content || '您暂无该公司下单权限，如需开通请联系管理员'
  }
  const target = dialog.target
  return target
    ? `您没有访问「${target}」页面的权限，如需开通请联系管理员`
    : '您没有访问该页面的权限，如需开通请联系管理员'
})

/** 弹窗曝光埋点 */
function onOpen() {
  try {
    window.$umpOtherReport?.(
      'OTHER',
      { eventCode: 'other_permission_dialog_reach_v1', region_code: 'router_guard' },
      { type: dialog.type, target: dialog.target, scenario: scenario.value }
    )
  } catch (error) {
    console.error('permission dialog report error:', error)
  }
}

/** 按钮点击埋点（对齐老项目 reportClick） */
function reportButtonClick(buttonName: string) {
  try {
    window.$umpOtherReport?.(
      'CLK',
      { eventCode: 'clk_customer_code_bind_Recommended_botton' },
      {
        button_name: buttonName,
        page_code: 'page_customer_code_bind',
        page_name: 'page_customer_code_bind',
      }
    )
  } catch (error) {
    console.error('permission dialog report error:', error)
  }
}

function closeDialog() {
  closePermissionDialog()
}

/** 跳绑码页（老项目：已在绑码页则不重复跳转） */
function goBindCode() {
  closeDialog()
  if (route.path !== BIND_CODE_PATH || route.query.realRoutePath !== BIND_CODE_REAL_ROUTE) {
    linkToBindCode()
  }
}

/** 跳申请专属商务页 */
function goApplyCustomerCode() {
  closeDialog()
  linkToApplyCustomerCode()
}

/** 主按钮 */
function onConfirm() {
  if (dialog.type !== 'customerCode') return
  if (scenario.value === 'newNoBusiness') {
    // 场景 D 新客-未匹配商务：主按钮 = 申请专属商务
    reportButtonClick('申请专属商务')
    goApplyCustomerCode()
  } else {
    reportButtonClick(confirmText.value)
    goBindCode()
  }
}

/** 场景 C 取消：申请专属商务 */
function onApplyBusiness() {
  reportButtonClick('申请专属商务')
  goApplyCustomerCode()
}

/** 场景 D 取消：去绑码 */
function onBindCode() {
  reportButtonClick('去绑码')
  goBindCode()
}

/** 场景 B 取消：联系商务（拉起浮层，不跳转；老项目此分支无点击埋点） */
function onContactBusiness() {
  closeDialog()
  showBusiness.value = true
}

/**
 * 下单权限主按钮（对齐老项目 orderPermissionGuardV2 beforeClose）：
 * 未申请 →「立即申请」发起申请（loading + 成功/失败 toast）；审核中/无数据 →「我知道了」关闭
 */
async function onOrderConfirm() {
  if (!needApply.value) {
    closeDialog()
    return
  }
  const customerCode = userStore.currentCustomerCode
  const phone = userStore.user?.phone || ''
  if (!customerCode || !phone) {
    showMessage({ message: '抱歉，申请失败，请重新尝试', type: 'error' })
    closeDialog()
    return
  }

  applying.value = true
  try {
    const res = await applyOrderPermission(customerCode, phone)
    if (res.code === 0) {
      const authPersonName = orderResult.value?.extraData?.haveApply?.authPersonName || ''
      showMessage({
        message: authPersonName ? `申请成功，等待${authPersonName}审核` : '申请成功，等待审核',
        type: 'success',
      })
    } else {
      throw new Error('接口异常')
    }
  } catch (error) {
    console.error('申请下单权限失败:', error)
    showMessage({ message: '抱歉，申请失败，请重新尝试', type: 'error' })
  } finally {
    applying.value = false
    closeDialog()
  }
}
</script>
