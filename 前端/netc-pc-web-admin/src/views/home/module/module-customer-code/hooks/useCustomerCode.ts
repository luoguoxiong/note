/**
 * 绑定客户编码主流程(TS 版)
 * 来源: customer-code 引用的 @/views/setting/user/hooks/useCustomerCode (netc-pc-web)
 *
 * 依赖映射:
 *  - vm.$createElement            -> vue h()
 *  - vm.$kye_message.confirm      -> ElMessageBox.confirm(入参/回调语义一致, 取消 reject 'cancel')
 *  - vm.$message                  -> ElMessage
 *  - vm.$reportUtils.*            -> 本目录 report.ts(事件码不变)
 *  - store.state.companyInfoType  -> useCustomerCodeStore()(模块级单例)
 *  - storageUtil.setCustomerData  -> @/stores/pc-web/deps/storage setCustomerData
 *  - envSdk.routerReload          -> @/stores/pc-web/deps/misc routerReload
 *  - 请求层: 老项目 code!==0 默认 resolve, 新请求层 reject -> catch 后归一化为响应结构,
 *    交由统一错误码分支处理(行为对齐)
 */
import { h } from 'vue'
import { KMessage, KMessageBox } from '@netc-design-pc/ui'
import type { Router } from 'vue-router'
import { setCustomerData } from '@/stores/pc-web/deps/storage'
import { routerReload } from '@/stores/pc-web/deps/misc'
import { bindCustomerCodeByClient, queryCustomerInfoApi, getBlackUserContactRole } from '../api'
import { bindCustomerCodeErrorCode, CompanyInfoType, customerCodeRole, customerCodeRoleName } from '../consts'
import {
  clkCenterCodeBind,
  otherCustomerCodeBindSub,
  reportCustomerCodeBindSub,
  clkCustomerCodeBindTipsPopupButton,
} from '../report'
import { showVerifyCodeDialog } from '../utils/verify-code'
import { showContactPhoneDialog } from './useContactPhoneDialog'
import useCustomerCodeStore from './useCustomerCodeStore'
import type { BindCustomerCodeResult } from '../types'

const sleep = (time = 1000) => new Promise<void>((resolve) => setTimeout(resolve, time))

/** 解析 URL query(老 utils/commonUtil.getQueryObject, 仅覆盖本模块用到的 needQuerySave) */
function getQueryObject(): Record<string, string> {
  const parse = (search: string) => {
    const params: Record<string, string> = {}
    new URLSearchParams(search).forEach((value, key) => {
      params[key] = value
    })
    return params
  }
  const hashQueryIndex = window.location.hash.indexOf('?')
  return {
    ...parse(window.location.search),
    ...(hashQueryIndex > -1 ? parse(window.location.hash.slice(hashQueryIndex + 1)) : {}),
  }
}

interface BindCustomerCodeOptions {
  customerCode: string
  /** 客户编码密码(侧边栏切换绑定等场景无密码) */
  password?: string
  /** 客户-成员姓名 */
  memberName?: string
  /** 绑定类型 */
  bindType: number
  /** 是否取消申请 */
  cancelApplyFlag?: boolean
  /** 是否需要刷新页面 */
  needReload?: boolean
  /** 图形安全校验确认id */
  safeVerifyId?: string
  reloadPath?: string
  /** action来源补充 */
  targetName?: string
}

export default function useCustomerCode(options: { router?: Router } = {}) {
  const { router } = options
  const { companyInfoType, phone } = useCustomerCodeStore()

  /**
   * 绑定客户编码
   * @returns false 会解绑客户编码
   * @returns true 不进行操作
   * @returns { success: true } 绑码成功
   * @returns { flowVisible: true } 弹出审批流
   * @returns { contactPhone: true } 弹出联系客服弹窗
   */
  // eslint-disable-next-line complexity
  const bindCustomerCode = async ({
    customerCode,
    password,
    memberName,
    bindType,
    cancelApplyFlag = false,
    needReload = true,
    safeVerifyId,
    reloadPath,
    targetName,
  }: BindCustomerCodeOptions): Promise<BindCustomerCodeResult | boolean> => {
    const {
      CHANGE_CUSTOMER_CODE,
      SWITCH_HAS_AUTH,
      SWITCH_NO_AUTH,
      BIND_HAS_RECOMMEND,
      BIND_NO_RECOMMEND,
      BIND_HAS_RELATION_BIND,
    } = CompanyInfoType
    const currentInfoType = companyInfoType.value as number
    const params: Record<string, any> = {
      customerCode: customerCode,
      customerPwd: password,
      memberName,
      type: bindType,
      cancelApplyFlag: cancelApplyFlag,
      operatorSource: '30',
      listType: currentInfoType,
    }
    if (currentInfoType === BIND_HAS_RECOMMEND) {
      params.status = cancelApplyFlag ? 2 : null
    }
    if (safeVerifyId) {
      params.safeVerifyId = safeVerifyId
    }
    const { CUSTOMER_CODE_BLOCKED, VERIFY_CHECK, MOBILE_BLOCKED, HAS_UNBIND } = bindCustomerCodeErrorCode
    let _action = ''
    switch (currentInfoType) {
      case CHANGE_CUSTOMER_CODE:
        _action = '更换'
        break
      case SWITCH_HAS_AUTH:
      case SWITCH_NO_AUTH:
        _action = '切换'
        break
      case BIND_HAS_RECOMMEND:
      case BIND_NO_RECOMMEND:
      case BIND_HAS_RELATION_BIND:
        _action = '绑定'
        break
    }
    let res: any
    try {
      res = await bindCustomerCodeByClient(params)
    } catch (err: any) {
      clkCenterCodeBind({
        request_result: '失败',
        pageCode: 'page_customer_code_bind',
        failure_reason: err?.msg || '',
        page_type: '切换客户编码弹窗',
        customer_no: customerCode,
      })
      // 归一化为响应结构, 交由下方统一错误码分支处理
      res = { code: err?.code, msg: err?.msg, data: err?.data }
    }
    clkCenterCodeBind({
      pageCode: 'page_customer_code_bind',
      request_result: res.code === 0 ? '成功' : '失败',
      failure_reason: res.msg || '',
      page_type: '切换客户编码弹窗',
      customer_no: customerCode,
    })
    try {
      reportCustomerCodeBindSub({ memberName, res, _action: targetName || _action })
      otherCustomerCodeBindSub({
        page_code: 'page_customer_code_bind',
        page_name: 'page_customer_code_bind',
        request_result: res.code === 0 ? '成功' : '失败',
        failure_reason: res.code !== 0 ? res.msg : '',
        page_type: '新客绑码',
        user_name: memberName || '',
      })
    } catch (e) {
      console.log(e)
    }
    if (res.code === 0) {
      if (+res.data?.status === 0) {
        return { flowVisible: true, companyList: res.data?.errCompanyList, msg: res.msg }
      } else if (+res.data?.status === 2) {
        try {
          const Msg = h('div', { style: 'line-height: 20px;' }, [
            h('span', null, '您已申请绑定'),
            h('span', { style: 'color: #ff8038;' }, `${res.data?.errCompanyList[0]?.customerShortName}`),
            h(
              'span',
              null,
              `（${res.data?.errCompanyList[0]?.customerCode}）${
                res.data?.errCompanyList?.length > 1 ? '等公司' : ''
              }，继续提交将取消申请。`
            ),
          ])
          await KMessageBox.confirm(Msg, '温馨提示', {
            type: 'warning',
            confirmButtonText: '继续',
            cancelButtonText: '取消',
            closeOnClickModal: false,
          })
          clkCustomerCodeBindTipsPopupButton({ button_name: '确定' })
          bindCustomerCode({
            customerCode,
            password,
            memberName,
            bindType,
            needReload,
            cancelApplyFlag: true,
          })
          return true
        } catch (e) {
          console.log(e)
          if (e === 'cancel') {
            clkCustomerCodeBindTipsPopupButton({ button_name: '取消' })
          }
          return true
        }
      }
      res = await queryCustomerInfoApi(customerCode, phone.value)
      if (res.code === 0) {
        setCustomerData(res.data as Record<string, any>)
      }
      const msg = `${_action}${_action === '绑定' ? '' : '绑定'}成功`
      KMessage.success(msg)
      // 刷新绑码关联权限(老 store.dispatch('getAppUserRelationAuth'))
      useCustomerCodeStore().getAppUserRelationAuthAction()
      if (!needReload) {
        // 权限管理权限更新 - 仅页面不执行刷新才更新用户权限数据，强刷避免出现越权弹窗
        // (老 store.dispatch('permission/get_common_user'); 新基座权限体系由主工程托管, 此处无需处理)
      }

      await sleep()
      // 运单详情页面切换客户编码跳转到运单列表页面
      if (reloadPath) {
        location.replace(reloadPath)
      }
      if (needReload) {
        const { needQuerySave } = getQueryObject()
        if (needQuerySave === 'false') {
          window.location.replace(window.location.href.split('?')[0])
        }
        // 切换客户编码刷新页面后需要展示切换部门提示
        localStorage.setItem('avatarSwitchDepartmentStatus', '1')
        routerReload()
      }
      return { success: true }
    } else if (res.code === CUSTOMER_CODE_BLOCKED) {
      // 客户编码已拉黑，已报废错误码
      if (_action === '切换' && bindType !== 0) {
        const [first, ...rest] = res?.msg?.split('@') || []
        let Msg: ReturnType<typeof h> = h('div', { style: 'font-weight: bold;line-height: 20px;' }, first)
        if (rest && rest.length) {
          Msg = h('div', null, [
            h('div', { style: 'line-height: 20px;' }, first),
            h('div', { style: 'font-size: 12px;margin-top: 5px;color: #8f8fa8;line-height: 18px;' }, rest.join('')),
          ])
        }
        await KMessageBox.confirm(Msg, `${_action}失败提示`, {
          type: 'warning',
          confirmButtonText: '立即解绑',
          cancelButtonText: '取消',
          closeOnClickModal: false,
        })
      } else {
        KMessage.error(res?.msg || '操作异常')
      }
      return false
    } else if (res.code === VERIFY_CHECK) {
      // 风控校验错误码，1-图形验证码，2-已锁定不需要弹窗图形验证，4-滑块
      if (res.data?.type === 2) {
        KMessage.error(res?.msg || '操作异常')
      } else {
        const verifyResult = await showVerifyCodeDialog(
          {
            ruleId: res.data?.ruleId,
            strategyCode: res.data?.strategyCode,
          },
          { type: res.data?.type }
        )
        if (verifyResult && (verifyResult as any)?.safeVerifyId) {
          const currentResult = await bindCustomerCode({
            customerCode,
            password,
            memberName,
            bindType,
            cancelApplyFlag,
            needReload,
            safeVerifyId: (verifyResult as any)?.safeVerifyId,
          })
          return currentResult || true
        }
      }
      return true
    } else if (res.code === MOBILE_BLOCKED) {
      // 手机号已被加入黑名单
      try {
        const blackUserMsg = res?.msg || '您已被该公司限制绑码，如需绑码请联系商务咨询'
        const roleRes = await getBlackUserContactRole({ customerCode })
        const role = roleRes?.data?.role
        await KMessageBox.confirm(blackUserMsg, '温馨提示', {
          type: 'warning',
          showClose: true,
          confirmButtonText: `联系${role === customerCodeRole.BUSINESS ? '商务' : '他'}`,
          showCancelButton: false,
          closeOnClickModal: false,
        })
        try {
          await sleep(100)
          const checkFlag = await showContactPhoneDialog(
            {
              role: customerCodeRoleName.get(role),
              customerCode: customerCode,
              trackName: 'clk_customer_code_bind_password_businesspopup_button',
              changeTrackName: 'clk_customer_code_bind_password_changenumpopup_button',
            },
            router
          )
          if (!checkFlag) return { contactPhone: true }
        } catch (e) {
          console.log(e)
        }
        return { contactPhone: true }
      } catch (e) {
        console.log(e)
        return true
      }
    } else if (res.code === HAS_UNBIND) {
      KMessage.error(res?.msg || '操作异常')
      await sleep()
      const { needQuerySave } = getQueryObject()
      if (needQuerySave === 'false') {
        window.location.replace(window.location.href.split('?')[0])
      }
      routerReload()
      return true
    } else {
      KMessage.error(res?.msg || '操作异常')
      return true
    }
  }

  return {
    bindCustomerCode,
  }
}
