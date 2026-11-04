<template>
  <div class="customer-code__container">
    <!-- 添加客户编码弹窗 -->
    <customer-code-add-dialog v-model="addDialogVisible" @forgetPassword="handleForgetPassword" />

    <!-- 更换客户编码弹窗 -->
    <change-customer-code-dialog v-model="changeCustomerCodeVisible" @forgetPassword="handleForgetPassword" />

    <!-- 忘记密码 -->
    <forget-custom-password-flow ref="forgetCustomPasswordFlowRef" />

    <!-- 关联账号申请流程弹窗集(无权限提示/申请绑定其他公司/审批结果/联系客服) -->
    <RelationAccountFlow ref="relationAccountFlowRef" />
  </div>
</template>

<script setup lang="ts">
/**
 * 客户编码模块入口(TS 版)
 * 来源: customer-code/index.vue (netc-pc-web layout/customer-code 迁移)
 *
 * 依赖映射:
 *  - @vue/composition-api -> vue script setup
 *  - :visible.sync -> v-model
 *  - root.$store.dispatch('getAppUserRelationAuth')  -> useCustomerCodeStore().getAppUserRelationAuthAction()
 *  - root.$store.dispatch('setCustomerListAction')   -> useCustomerCodeStore().fetchCustomerListAction()
 *  - root.$reportUtils.* -> 本目录 report.ts(事件码不变)
 *  - envSdk.routerReload -> @/stores/pc-web/deps/misc routerReload
 *  - CompanyInfoType -> 本目录 consts.ts
 *
 * 对外能力(defineExpose):
 *  - handleAddCustomerCode()      添加客户编码(父级头像菜单等场景调用)
 *  - handleChangeCustomerCode()   更换客户编码
 *  - showRelationAccountFlow()    打开关联账号申请流程弹窗集(侧边栏切换返回 flowVisible 场景调用)
 */
import { nextTick, reactive, ref, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import CustomerCodeAddDialog from './components/customer-code-add-dialog.vue'
import ChangeCustomerCodeDialog from './components/change-customer-code-dialog.vue'
import ForgetCustomPasswordFlow from './components/forget-custom-password-flow.vue'
import RelationAccountFlow from './components/relation-account-flow/index.vue'
import useCustomerCodeStore from './hooks/useCustomerCodeStore'
import { routerReload } from '@/stores/pc-web/deps/misc'
import { CompanyInfoType } from './consts'
import { getCustomerCodeBindInfoApi } from './api'

defineOptions({ name: 'module-customer-code' })

const state = reactive({
  addDialogVisible: false,
  changeCustomerCodeVisible: false,
})
const { addDialogVisible, changeCustomerCodeVisible } = toRefs(state)

const forgetCustomPasswordFlowRef = ref<InstanceType<typeof ForgetCustomPasswordFlow> | null>(null)
const relationAccountFlowRef = ref<InstanceType<typeof RelationAccountFlow> | null>(null)

const { customerList, companyInfoType, customCode } = useCustomerCodeStore()

// 添加客户编码
const handleAddCustomerCode = async () => {
  const data = await useCustomerCodeStore().getAppUserRelationAuthAction()
  // 列表/类型数据使用前加载(替代原首屏预加载; 失败时全局已 toast, 中止本次流程)
  if (!(await useCustomerCodeStore().fetchCustomerListAction())) return false
  const { BIND_HAS_RECOMMEND, BIND_NO_RECOMMEND } = CompanyInfoType
  // 已绑码没有关联绑定权限不可以添加客户编码，需要先申请关联账号权限
  if (!data?.bindAuth && companyInfoType.value !== BIND_HAS_RECOMMEND && companyInfoType.value !== BIND_NO_RECOMMEND) {
    const companyList = customerList.value
      .filter((f) => f.customerCode !== customCode.value)
      .map((val) => {
        val.customerShortName = val.customerShortName || val.customerName
        return val
      })
    // 已绑码无关联绑定权限: 直接打开关联账号申请流程弹窗(老 relationAccountFlowRef.showDialog)
    relationAccountFlowRef.value?.showDialog({ type: 'add', companyList })
    return false
  }
  const res = await getCustomerCodeBindInfoApi()
  const { canBind } = (res.data || {}) as any
  if (res.code === 0 && !canBind) {
    ElMessage.warning('已达上限，请解绑账号后再添加')
    return
  }
  state.addDialogVisible = true
}

/** 无关联账号权限且无关联绑定公司更换客户编码（列表只有当前绑定公司） */
const handleChangeCustomerCode = async () => {
  const data = await useCustomerCodeStore().getAppUserRelationAuthAction()
  if (data?.bindAuth) {
    routerReload()
    return false
  }
  // 弹窗表单提交依赖 companyInfoType(数据使用前加载, 替代原首屏预加载; 失败时全局已 toast, 中止本次流程)
  if (!(await useCustomerCodeStore().fetchCustomerListAction())) return false
  // 曝光埋点在 change-customer-code-dialog 弹窗打开时上报
  state.changeCustomerCodeVisible = true
  return true
}

/**
 * 忘记密码
 * @param customerCode 客户编码
 */
const handleForgetPassword = async (customerCode: string) => {
  state.addDialogVisible = false
  await nextTick()
  forgetCustomPasswordFlowRef.value?.showDialog(customerCode)
}

/**
 * 打开关联账号申请流程弹窗集(侧边栏切换客户编码返回 flowVisible 时由父级组件调用,
 * 对齐老基座 avatar.vue onApplyRelationAccount -> relationAccountFlowRef.showDialog)
 */
const showRelationAccountFlow = (payload: { type?: 'add' | 'change'; companyList?: any[]; msg?: string }) => {
  relationAccountFlowRef.value?.showDialog(payload)
}

defineExpose({
  handleAddCustomerCode,
  handleChangeCustomerCode,
  showRelationAccountFlow,
})
</script>
