/**
 * 切换部门业务逻辑
 * 来源: netc-pc-web/src/views/layout/avatar.vue「部门」业务块(含切换部门 popover 与引导气泡)
 *
 * 依赖映射:
 *  - vuex permission/update_department_list (uamDepartmentGetMoreDepartment + getPhone)
 *      -> useCustomerCodeStore().phone + 本目录 api.ts(复用 pc-web deps 已有封装)
 *  - vuex permission.department_list -> 本 hook departmentList(模块内自持)
 *  - storageUtil.setDepartmentCode  -> @/stores/pc-web/deps/storage setDepartmentCode
 *  - envSdk.routerReload            -> @/stores/pc-web/deps/misc routerReload
 *  - $reportUtils.*                 -> 本目录 report.ts(事件码不变)
 *  - department-table-popover 引导气泡(依赖老 menu-popover + permission guide store)
 *      -> el-popover 受控模式 + localStorage 引导标记(键名与老基座一致)
 */
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { setDepartmentCode } from '@/stores/pc-web/deps/storage'
import { routerReload } from '@/stores/pc-web/deps/misc'
import useCustomerCodeStore from '@/views/home/module/module-customer-code/hooks/useCustomerCodeStore'
import { uamDepartmentChangeCurrentDepartmentApi, uamDepartmentGetMoreDepartment, type DepartmentItem } from '../api'
import {
  clkCenterCustomerBindButton,
  clkChangeDepartmentsButton,
  expChangeDepartments,
  otherChangeDepartmentsSuccess,
} from '../report'

const sleep = (time = 1000) => new Promise<void>((resolve) => setTimeout(resolve, time))

/** 引导气泡 localStorage key(对齐老 department-table-popover popKey) */
const GUIDE_STORAGE_KEY = 'showSwitchDepartmentGuidePopover'
/** 切换部门引导状态缓存 key(客户编码切换成功后由 module-customer-code 置 '1') */
const SWITCH_DEPARTMENT_STATUS_KEY = 'avatarSwitchDepartmentStatus'

export function useDepartmentSwitch() {
  const userStore = useUserStore()
  const { phone } = useCustomerCodeStore()

  // ==================== 状态 ====================

  /** 是否显示切换部门列表 */
  const departmentPopoverVisible = ref(false)
  /** 切换部门中 */
  const isDepartmentLoading = ref(false)
  /** 切换过渡态(500ms 内不展示"当前部门"标记, 同时抑制引导气泡) */
  const isSwitching = ref(false)
  /** 点击切换的部门编码(切换中行展示 loading) */
  const selectedDepartmentCode = ref('')
  /** 当前部门名称 */
  const curDepartmentName = ref('')
  /** 是否展示切换部门按钮(多部门) */
  const showSwitchDepartmentBtn = ref(false)
  /** 切换部门引导状态(对齐老 localStorage avatarSwitchDepartmentStatus, 响应式化驱动模板) */
  const switchDepartmentStatus = ref<string | null>(localStorage.getItem(SWITCH_DEPARTMENT_STATUS_KEY))
  /** 引导气泡显隐(老 menu-popover visible) */
  const guideVisible = ref(false)

  /** 部门列表 */
  const departmentList = ref<DepartmentItem[]>([])

  const customCode = computed(() => userStore.user?.customCode || '')

  // ==================== 引导气泡(老 department-table-popover + permissionGuide) ====================

  const getGuideStorageKey = () => `${GUIDE_STORAGE_KEY}-${userStore.user?.id || ''}-${customCode.value || ''}`
  /** 获取部门引导气泡已读标记 */
  const getDetailGuideStorage = () => localStorage.getItem(getGuideStorageKey())
  /** 标记部门引导气泡已展示 */
  const setDetailGuideStorage = () => localStorage.setItem(getGuideStorageKey(), '1')

  /** 是否展示切换部门引导气泡(老 avatar.showSwitchDepartmentGuidePopper) */
  const showSwitchDepartmentGuidePopper = () => {
    return showSwitchDepartmentBtn.value && switchDepartmentStatus.value === '1' && !isSwitching.value
  }

  /** 关闭引导气泡并标记已读(老 closeSwitchDepartmentGuidePopover + handleSwitchDepartmentClose) */
  const closeSwitchDepartmentGuidePopover = () => {
    try {
      guideVisible.value = false
      setDetailGuideStorage()
      switchDepartmentStatus.value = '0'
      localStorage.setItem(SWITCH_DEPARTMENT_STATUS_KEY, '0')
    } catch (e) {
      console.log(e)
    }
  }

  // ==================== 交互逻辑 ====================

  /** 切换部门图标点击 */
  const onDepartmentBtnClick = () => {
    clkCenterCustomerBindButton({ button_name: '切换部门', pageCode: 'page_center_mine' })
    if (showSwitchDepartmentGuidePopper()) {
      closeSwitchDepartmentGuidePopover()
    }
    departmentPopoverVisible.value = !departmentPopoverVisible.value
    if (departmentPopoverVisible.value) {
      expChangeDepartments({ pageCode: 'page_center_mine' })
    }
  }

  /** 关闭切换部门列表(右上角关闭按钮) */
  const departmentPopoverVisibleFn = () => {
    clkChangeDepartmentsButton({ pageCode: 'page_center_mine', button_name: '关闭' })
    departmentPopoverVisible.value = false
  }

  /**
   * 切换部门
   * @param item 部门信息
   */
  const handleChangeDepartment = async (item: DepartmentItem) => {
    try {
      if (isDepartmentLoading.value || item.current) return
      isSwitching.value = true
      selectedDepartmentCode.value = item.departmentCode
      isDepartmentLoading.value = true
      clkChangeDepartmentsButton({ pageCode: 'page_center_mine', button_name: '切换其他部门' })
      const params = {
        toDepartmentCode: item.departmentCode,
        customerCode: customCode.value,
        source: 30,
      }
      const res = await uamDepartmentChangeCurrentDepartmentApi(params)
      if (res.code === 0) {
        ElMessage.success('切换部门成功')
        otherChangeDepartmentsSuccess({
          pageCode: 'page_center_mine',
          request_result: '成功',
          session_id: localStorage.getItem('sessionId'),
        })
        await sleep(1000)
        routerReload()
      } else {
        otherChangeDepartmentsSuccess({
          pageCode: 'page_center_mine',
          request_result: '失败',
          session_id: localStorage.getItem('sessionId'),
          failure_reason: JSON.stringify(res),
        })
        // 切换失败刷新部门列表(老 permission/update_department_list)
        fetchDepartmentList()
      }
    } catch (e) {
      console.log(e, ':>> e')
    } finally {
      isDepartmentLoading.value = false
      setTimeout(() => {
        isSwitching.value = false
      }, 500)
    }
  }

  /** 获取侧边栏部门列表(老 permission/update_department_list + getDepartmentList) */
  const fetchDepartmentList = async () => {
    try {
      const res = await uamDepartmentGetMoreDepartment({ phone: phone.value })
      const data: DepartmentItem[] = res.code === 0 ? res.data || [] : []
      departmentList.value = data
      const curDepartmentInfo = data.find((f) => f.current)
      curDepartmentName.value = curDepartmentInfo?.departmentName || ''
      setDepartmentCode(curDepartmentInfo?.departmentCode || '')
      showSwitchDepartmentBtn.value = data.length > 1
      // 对齐老 getDepartmentList: 2s 后重置引导状态(引导气泡仅展示 2s)
      setTimeout(() => {
        switchDepartmentStatus.value = '0'
        localStorage.setItem(SWITCH_DEPARTMENT_STATUS_KEY, '0')
      }, 2000)
    } catch (e) {
      console.log(e, ':>>> e')
    }
  }

  /** 引导气泡初始化显隐(老 department-table-popover initDepartmentPopover + menu-popover init) */
  const initGuidePopover = () => {
    if (showSwitchDepartmentGuidePopper()) {
      guideVisible.value = Number(getDetailGuideStorage()) !== 1
    }
  }

  // 部门按钮显隐变化后初始化引导气泡
  watch(showSwitchDepartmentBtn, initGuidePopover)

  // 对齐老 avatar userInfo watch: 非引导期重置引导已读标记(每次切换客户编码后气泡可再次展示)
  watch(
    () => userStore.user,
    (val) => {
      const { id, customCode: code } = val || ({} as Record<string, any>)
      if (code && id && localStorage.getItem(SWITCH_DEPARTMENT_STATUS_KEY) !== '1') {
        localStorage.setItem(`${GUIDE_STORAGE_KEY}-${id}-${code}`, '0')
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    fetchDepartmentList()
  })

  return {
    // 状态
    departmentPopoverVisible,
    isDepartmentLoading,
    isSwitching,
    selectedDepartmentCode,
    curDepartmentName,
    showSwitchDepartmentBtn,
    guideVisible,
    departmentList,
    // 方法
    showSwitchDepartmentGuidePopper,
    closeSwitchDepartmentGuidePopover,
    onDepartmentBtnClick,
    departmentPopoverVisibleFn,
    handleChangeDepartment,
  }
}
