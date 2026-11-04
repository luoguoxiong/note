import { defineStore } from 'pinia'
import type { CustomerCodeState, UIState } from './types'
import type { CompanyInfo, BindForm, ConfigData, DepartmentInfo } from '../types/customer-code'
import { DisplayMode } from '../constants/index'

/**
 * 初始化默认状态
 */
const initState = (): CustomerCodeState => ({
  bindForm: {
    customerCode: '',
    customerPassword: '',
    memberName: '',
  },

  companyInfoList: [],

  currentCompany: null,

  /** 正在切换的目标公司（用于显示"切换中"状态） */
  switchingCompany: null,

  uiState: {
    loading: false,
    mode: DisplayMode.POPUP,
    showContactBusiness: false,
    showAlert: false,
    showCaptcha: false,
  } as UIState,

  configData: {
    btnLists: [],
  },

  departmentList: [],

  currentDepartment: null,
})

/**
 * 客户编码模块 Pinia Store
 *
 * 管理客户编码绑定/更换/切换的所有状态和业务逻辑
 */
export const useCustomerCodeStore = defineStore('customerCode', {
  state: (): CustomerCodeState => initState(),

  getters: {
    /** 是否已绑定客户编码 */
    isBound(state): boolean {
      return !!state.currentCompany
    },

    /** 当前客户编码 */
    currentCustomerCode(state): string {
      return state.currentCompany?.customerCode || ''
    },

    /** 当前公司名称 */
    currentCompanyName(state): string {
      return state.currentCompany?.customerName || ''
    },
  },

  actions: {
    /**
     * 设置加载状态
     */
    setLoading(loading: boolean) {
      this.uiState.loading = loading
    },

    /**
     * 设置显示模式
     */
    setMode(mode: DisplayMode) {
      this.uiState.mode = mode
    },

    /**
     * 显示联系商务弹窗
     */
    showContactBusinessDialog(show: boolean) {
      this.uiState.showContactBusiness = show
    },

    /**
     * 显示确认弹窗
     */
    showAlertDialog(show: boolean) {
      this.uiState.showAlert = show
    },

    /**
     * 显示图形验证码
     */
    showCaptchaDialog(show: boolean, info?: UIState['captchaInfo']) {
      this.uiState.showCaptcha = show
      if (info) {
        this.uiState.captchaInfo = info
      }
    },

    /**
     * 更新绑定表单字段
     */
    updateBindForm<K extends keyof BindForm>(field: K, value: BindForm[K]) {
      this.bindForm[field] = value
    },

    /**
     * 重置绑定表单
     */
    resetBindForm() {
      Object.assign(this.bindForm, initState().bindForm)
    },

    /**
     * 设置公司列表
     */
    setCompanyInfoList(list: CompanyInfo[]) {
      this.companyInfoList = list
    },

    /**
     * 设置当前绑定公司
     */
    setCurrentCompany(company: CompanyInfo | null) {
      this.currentCompany = company
    },

    /**
     * 设置正在切换的目标公司（显示"切换中"状态）
     *
     * @param company - 正在切换的目标公司
     */
    setSwitchingCompany(company: CompanyInfo | null) {
      this.switchingCompany = company
    },

    /**
     * 清除切换状态（切换完成或失败时调用）
     */
    clearSwitchingCompany() {
      this.switchingCompany = null
    },

    /**
     * 更新公司列表中某项的绑定状态（用于切换操作）
     *
     * @param customerId - 公司ID
     * @param isCurrBond - 是否当前绑定 ('1' | '0' | '')
     */
    updateCompanyBondStatus(customerId: string | number, isCurrBond: string) {
      const company = this.companyInfoList.find((item) => String(item.customerId) === String(customerId))
      if (company) {
        // 先清除所有当前绑定标记
        this.companyInfoList.forEach((item) => {
          item.isCurrBond = ''
        })
        // 设置新的当前绑定
        company.isCurrBond = isCurrBond
      }
    },

    /**
     * 更新指定公司的 isCurrBond 状态（用于切换/解绑联动）
     *
     * @param customerCode - 客户编码
     * @param isCurrent - 是否当前绑定 (true='1', false='0')
     */
    updateIsCurrBond(customerCode: string, isCurrent: boolean) {
      const company = this.companyInfoList.find((item) => item.customerCode === customerCode)
      if (company) {
        company.isCurrBond = isCurrent ? '1' : '0'
      }
    },

    /**
     * 从公司列表中移除某项（用于解绑）
     */
    removeCompanyFromList(customerId: string | number) {
      const index = this.companyInfoList.findIndex((item) => String(item.customerId) === String(customerId))
      if (index > -1) {
        this.companyInfoList.splice(index, 1)
      }
    },

    /**
     * 移除当前绑定公司（用于解绑当前公司时）
     *
     * @description 清空 currentCompany，不删除列表项
     */
    removeCurrentCompany() {
      this.currentCompany = null
    },

    /**
     * 根据客户编码从列表中移除公司（用于解绑非当前绑定公司）
     *
     * @param customerCode - 客户编码
     */
    removeCompany(customerCode: string) {
      const index = this.companyInfoList.findIndex((item) => item.customerCode === customerCode)
      if (index > -1) {
        this.companyInfoList.splice(index, 1)
      }
    },

    /**
     * 设置配置数据
     */
    setConfigData(data: ConfigData) {
      this.configData = data
    },

    /**
     * 设置部门列表
     */
    setDepartmentList(list: DepartmentInfo[]) {
      this.departmentList = list
    },

    /**
     * 设置当前部门
     */
    setCurrentDepartment(dept: DepartmentInfo | null) {
      this.currentDepartment = dept
    },

    /**
     * 重置所有状态到初始值
     */
    reset() {
      const initialState = initState()
      Object.assign(this.bindForm, initialState.bindForm)
      this.companyInfoList = initialState.companyInfoList
      this.currentCompany = initialState.currentCompany
      this.switchingCompany = initialState.switchingCompany  // 🔑 重置切换状态
      Object.assign(this.uiState, initialState.uiState)
      this.configData = initialState.configData
      this.departmentList = initialState.departmentList
      this.currentDepartment = initialState.currentDepartment
    },
  },
})
