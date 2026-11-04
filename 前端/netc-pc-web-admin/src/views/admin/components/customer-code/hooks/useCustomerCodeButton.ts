/**
 * 添加/切换客户编码按钮业务逻辑
 * 来源: netc-pc-web/src/views/layout/avatar.vue「添加/切换客户编码」业务块(含客户编码切换列表 popover)
 *
 * 依赖映射:
 *  - vuex userInfo/customerList/existedRelationBind/relateAccountAuth
 *      -> useUserStore(pinia) + module-customer-code useCustomerCodeStore(模块级单例)
 *  - $store.dispatch('setCustomerListAction')  -> useCustomerCodeStore().fetchCustomerListAction()
 *  - $store.dispatch('getAppUserRelationAuth') -> useCustomerCodeStore().getAppUserRelationAuthAction()
 *  - $reportUtils.*                            -> 本目录 report.ts(事件码不变)
 *  - @views/setting/user/hooks/useCustomerCode -> module-customer-code/hooks/useCustomerCode(bindCustomerCode)
 *  - unbindByCustomerCode(老 @api/login)        -> 本目录 api.ts
 *  - $router.push('/admin/user?pre_click_id=xxx') -> router.push(新基座 /admin/user 已注册路由, 直接跳转 + 本目录 report.ts 的 getClickId)
 *  - $refs.relationAccountFlowRef.showDialog   -> onApplyRelationAccount 回调(关联账号流程弹窗待迁移, 交由父级处理)
 */
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { sortBy } from 'lodash-es'
import { useUserStore } from '@/stores/user'
import { setCustomerData } from '@/stores/pc-web/deps/storage'
import { routerReload } from '@/stores/pc-web/deps/misc'
import useCustomerCodeStore from '@/views/home/module/module-customer-code/hooks/useCustomerCodeStore'
import useCustomerCode from '@/views/home/module/module-customer-code/hooks/useCustomerCode'
import type { CustomerListItem } from '@/views/home/module/module-customer-code/types'
import { useLinkTo } from '@/hooks/useLinkTo'
import { unbindByCustomerCodeApi } from '../api'
import { clkCenterCustomerBindButton, clkCenterChangepopupButton, expChangeCustomerCodeWindow } from '../report'

/** module-customer-code 弹窗实例暴露的能力(defineExpose) */
export interface ModuleCustomerCodeExposed {
  handleAddCustomerCode: () => Promise<void>
  handleChangeCustomerCode: () => Promise<boolean>
  showRelationAccountFlow: (payload: { type?: 'add' | 'change'; companyList?: any[]; msg?: string }) => void
}

/** 申请关联账号 payload(关联账号流程弹窗待迁移, 交由父级处理) */
export interface ApplyRelationAccountPayload {
  type: 'add' | 'change'
  companyList: CustomerListItem[]
  msg?: string
}

interface UseCustomerCodeButtonOptions {
  /** module-customer-code 弹窗组件实例 */
  moduleCustomerCodeRef: Ref<ModuleCustomerCodeExposed | null>
  /** 无关联账号权限时申请关联账号 */
  onApplyRelationAccount: (payload: ApplyRelationAccountPayload) => void
}

export function useCustomerCodeButton(options: UseCustomerCodeButtonOptions) {
  const { moduleCustomerCodeRef, onApplyRelationAccount } = options

  /** 跳转个人中心绑码页(对齐老基座: /admin/user?pre_click_id=xxx) */
  const { linkToBindCode } = useLinkTo()

  // ==================== 状态 ====================

  /** 是否显示切换客户编码列表 */
  const popoverVisible = ref(false)
  /** 切换绑定中 */
  const loading = ref(false)
  /** 切换/解绑过渡态(500ms 内不展示"当前绑定"标记) */
  const isChanging = ref(false)
  /** 解绑中 */
  const isUnbinding = ref(false)
  /** 点击切换的公司编码(切换中行展示 loading) */
  const selectedCustomerCode = ref('')
  /** 客户编码简称超长气泡 */
  const showCustomerShortNameTooltip = ref(false)
  /** 简称气泡防抖标记(避免移入移除气泡未消失) */
  const debounceCustomerNameTooltip = ref(false)

  // ==================== 数据源 ====================

  const userStore = useUserStore()
  const {
    relateAccountAuth,
    existedRelationBind,
    customerList,
    fetchCustomerListAction,
    getAppUserRelationAuthAction,
  } = useCustomerCodeStore()
  const { bindCustomerCode } = useCustomerCode()

  /** 当前用户信息 */
  const userInfo = computed(() => userStore.user)

  /** 当前绑定客户编码 */
  const customCode = computed(() => userInfo.value?.customCode || '')

  /** 客户编码列表(当前绑定公司置底, 对齐老基座 sortBy) */
  const sortedCustomerList = computed(() =>
    sortBy(customerList.value, (v) => v.customerCode !== userInfo.value?.customerInfo?.customerCode)
  )

  /** 有关联账号权限并且有关联绑定 */
  const hasBindAuthAndExistRelationBind = computed(() => relateAccountAuth.value && existedRelationBind.value)

  /** 客户编码简称 */
  const customerShortName = computed(() => {
    if (customCode.value) {
      return userInfo.value?.customerInfo?.customerShortName || ''
    }
    return hasBindAuthAndExistRelationBind.value ? '需切换客户编码' : '未绑定客户编码'
  })

  /** 客户编码简称气泡禁用(简称超长才展示) */
  const customerShortNameDisabled = computed(() => {
    if (customCode.value && (userInfo.value?.customerInfo?.customerShortName?.length || 0) > 10) {
      return false
    }
    return true
  })

  /** 绑定|切换|添加|更换客户编码按钮文案 */
  const customerCodeBtnText = computed(() => {
    if (customCode.value && !relateAccountAuth.value && !existedRelationBind.value) {
      return '更换客户编码'
    } else if (customCode.value && !relateAccountAuth.value && existedRelationBind.value) {
      return '切换客户编码'
    } else if (customCode.value && relateAccountAuth.value && !existedRelationBind.value) {
      return '添加客户编码'
    } else {
      return '绑定客户编码'
    }
  })

  // ==================== 交互逻辑 ====================

  /** 打开/关闭切换客户编码列表 */
  const onCustomerCodeBtnClick = () => {
    popoverVisible.value = !popoverVisible.value
    showCustomerShortNameTooltip.value = false
  }

  /** 关闭切换客户编码列表(右上角关闭按钮) */
  const customerCodePopoverVisibleFn = () => {
    clkCenterChangepopupButton({ button_name: '关闭', pageCode: 'page_center_mine' })
    popoverVisible.value = false
  }

  /** 客户编码简称超长，鼠标移入显示气泡 */
  const onCustomerShortNameMouseenter = () => {
    setTimeout(() => {
      if (!popoverVisible.value && !debounceCustomerNameTooltip.value) {
        showCustomerShortNameTooltip.value = true
      }
    }, 200)
  }

  /** 客户编码简称鼠标移出 */
  const onCustomerShortNameMouseleave = () => {
    showCustomerShortNameTooltip.value = false
    debounceCustomerNameTooltip.value = true
    setTimeout(() => {
      debounceCustomerNameTooltip.value = false
    }, 300)
  }

  /** 添加/切换客户编码按钮点击 */
  const onBindCustomerCode = async () => {
    clkCenterCustomerBindButton({ button_name: customerCodeBtnText.value, pageCode: 'page_center_mine' })
    await getAppUserRelationAuthAction()
    if (!customCode.value && !existedRelationBind.value) {
      // 没有当前绑定 && 没有关联绑定需跳转个人中心绑码
      linkToBindCode()
    } else if (customCode.value && !relateAccountAuth.value && !existedRelationBind.value) {
      // 更换客户编码
      clkCenterChangepopupButton({ button_name: customerCodeBtnText.value, pageCode: 'page_center_mine' })
      await moduleCustomerCodeRef.value?.handleChangeCustomerCode()
    } else if (customCode.value && relateAccountAuth.value && !existedRelationBind.value) {
      // 添加客户编码
      await moduleCustomerCodeRef.value?.handleAddCustomerCode()
    } else {
      // 有关联绑定，展示切换客户编码列表(列表数据使用前加载, 替代原首屏预加载; 失败时全局已 toast, 不打开空列表)
      if (!(await fetchCustomerListAction())) return false
      onCustomerCodeBtnClick()
    }
  }

  /** 添加客户编码(列表底部按钮) */
  const handleAddCustomerCode = () => {
    popoverVisible.value = false
    clkCenterChangepopupButton({ button_name: '添加客户编码', pageCode: 'page_center_mine' })
    moduleCustomerCodeRef.value?.handleAddCustomerCode()
  }

  /** 解绑当前客户编码(切换被拦截场景, direct 直接触发不二次确认, 解绑后刷新页面) */
  const unbindCustomerCode = async (customerCode: string) => {
    try {
      const params = { customerCode, operatorSource: '30' }
      const res = await unbindByCustomerCodeApi(params)
      if (res.code === 0) {
        ElMessage.success('解绑成功')
        setTimeout(() => {
          setCustomerData({})
          routerReload()
        }, 1000)
      }
    } catch (e) {
      console.log('unbind :>> ', e)
    }
  }

  /**
   * 切换绑定客户编码
   * @param item 公司信息
   */
  const handleChangeCustomerCode = async (item: CustomerListItem) => {
    try {
      clkCenterChangepopupButton({
        button_name: '切换绑定公司',
        pageCode: 'page_center_mine',
        customer_no: item.customerCode,
      })
      if (loading.value || item.customerCode === customCode.value) return false
      selectedCustomerCode.value = item.customerCode
      isChanging.value = true
      loading.value = true
      const res = await bindCustomerCode({
        customerCode: item.customerCode,
        bindType: 1,
      })
      if (!res) {
        // 切换被拦截(客户编码拉黑)，解绑当前客户编码
        isUnbinding.value = true
        popoverVisible.value = true
        await unbindCustomerCode(item.customerCode)
      } else if (typeof res === 'object' && res.flowVisible) {
        // 需要走关联账号申请流程(关联账号流程弹窗待迁移, 交由父级处理)
        onApplyRelationAccount({ type: 'change', companyList: res.companyList || [], msg: res.msg })
      }
    } catch (e) {
      console.log(e, ':>> e')
    } finally {
      loading.value = false
      isUnbinding.value = false
      setTimeout(() => {
        isChanging.value = false
      }, 500)
    }
  }

  // 弹窗曝光/关闭重置
  watch(popoverVisible, (val) => {
    if (val) {
      expChangeCustomerCodeWindow()
    }
  })

  // 初始化权限数据(按钮文案/简称首屏渲染依赖, 对齐老基座 layout created 预加载 getAppUserRelationAuth;
  // 可绑定公司列表不首屏加载, 改为使用前加载: 见 onBindCustomerCode 及 module-customer-code 弹窗打开逻辑)
  onMounted(() => {
    getAppUserRelationAuthAction()
  })

  return {
    // 状态
    popoverVisible,
    loading,
    isChanging,
    isUnbinding,
    selectedCustomerCode,
    showCustomerShortNameTooltip,
    // 数据
    userInfo,
    customCode,
    sortedCustomerList,
    relateAccountAuth,
    existedRelationBind,
    customerShortName,
    customerShortNameDisabled,
    customerCodeBtnText,
    // 方法
    onBindCustomerCode,
    onCustomerCodeBtnClick,
    customerCodePopoverVisibleFn,
    onCustomerShortNameMouseenter,
    onCustomerShortNameMouseleave,
    handleAddCustomerCode,
    handleChangeCustomerCode,
  }
}
