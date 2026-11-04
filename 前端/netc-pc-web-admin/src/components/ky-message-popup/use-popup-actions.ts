/**
 * 弹窗公共行为 composable
 *
 * 抽取旧 activity-popup.vue / text-image-popup.vue 共有的：
 *  - 二次确认（twoConfirmStatus === 1，含关闭/恢复弹窗交互）
 *  - 跳转分发（jumpMode 1=H5、2=站内路由、4=API 按钮，统一走 useAdvertisementJump）
 *  - 用户操作上报（advertisementConfirmByUser）
 *  - 富文本 <a> 链接处理
 */
import { KMessageBox } from '@netc-design-pc/ui'
import { useRouter } from 'vue-router'
import eventBus, { EE_EVENT } from '@/views/admin/components/header/eventBus'
import native from '@/utils/native'
import { advertisementConfirmByUser, eventReport } from '@/apis/home'
import { useAdvertisementJump } from '@/hooks/useAdvertisementJump'
import type { AdvertisementButton } from '@/apis/home/types'
import type { PopupActionButton, ReportUserActionParams } from './types'

/** 弹窗类型：影响 pageGroupCode 通知 */
export type PopupType = 'activity' | 'text-image'

export interface SubmitOptions {
  /** 弹窗类型 */
  popupType: PopupType
  /** 弹窗 advertisementCode */
  advertisementCode: string
  /** 退场动画标记（pushToStyle 真值时为 true） */
  pushToStyle?: number
  /** "不再提醒"勾选状态 */
  noLongerRemindSelected: boolean
  /** 按钮所在 buttonList（用于按数组下标取 buttonName 上报） */
  buttonList?: PopupActionButton[]
  /** 点击事件上报类型：图文=1、纯图=4 */
  clickEventType?: number
  /** 按钮在 buttonList 中的数组下标（用于 eventReport 的 buttonName 取值） */
  arrayIndex?: number
  /** 二次确认弹出前隐藏弹窗（旧实现交互：先关弹窗再弹确认框） */
  onTwoConfirmHide?: () => void
  /** 二次确认取消后恢复弹窗 */
  onTwoConfirmRestore?: () => void
}

export interface SubmitResult {
  /** 是否关闭弹窗（API 按钮失败时为 false） */
  shouldClose: boolean
  /** 是否已调过 confirmByUser（避免重复上报） */
  apiButtonReported: boolean
}

export function usePopupActions() {
  const router = useRouter()
  const { jumpByAdvertisement } = useAdvertisementJump()

  /**
   * 二次确认：button.twoConfirmStatus === 1 时弹确认框
   * 旧实现交互：先隐藏弹窗 → 200ms 后弹确认框；取消后 200ms 恢复弹窗
   * @returns true=用户确认继续；false=取消
   */
  async function confirmWithWarn(
    button: AdvertisementButton,
    options?: Pick<SubmitOptions, 'onTwoConfirmHide' | 'onTwoConfirmRestore'>
  ): Promise<boolean> {
    if (button.twoConfirmStatus !== 1) return true

    options?.onTwoConfirmHide?.()
    await new Promise((resolve) => setTimeout(resolve, 200))
    try {
      await KMessageBox.confirm(button.twoConfirmPopupText ?? '', button.twoConfirmPopupTitle ?? '', {
        confirmButtonText: button.twoConfirmButtonTextTwo ?? '确定',
        cancelButtonText: button.twoConfirmButtonTextOne ?? '取消',
        type: 'warning',
        closeOnClickModal: false,
      })
      return true
    } catch {
      setTimeout(() => {
        options?.onTwoConfirmRestore?.()
      }, 200)
      return false
    }
  }

  /**
   * 跳转分发：统一走 useAdvertisementJump
   *  - jumpMode 1: H5 链接（含 CRM 视频壳版本兼容、pcH5JumpType=10 直开、function-feedback 站内跳转）
   *  - jumpMode 2: 站内路由（text-image 场景通知页签切换）
   *  - jumpMode 4: API 按钮（不在此处处理，由 submit 走 confirmByUser）
   */
  async function handleJump(button: AdvertisementButton, popupType: PopupType, pushToStyle?: number): Promise<void> {
    await jumpByAdvertisement(button, { pushToStyle })
    // 旧实现仅 text-image 弹窗有 store.commit('notice/setCurrentPageGroupCode', pageGroupCode)
    // 新项目改用 eventBus 通知页签切换
    if (popupType === 'text-image' && button.jumpMode === 2 && button.pageGroupCode) {
      eventBus.emit(EE_EVENT.SELF_TAB_NAME, button.pageGroupCode)
    }
  }

  /**
   * 上报用户点击/关闭行为
   * @returns 当 isHandleResult=true 时返回后端 code===0；其他情况返回 void
   */
  async function reportUserAction(params: ReportUserActionParams, isHandleResult = false): Promise<boolean | void> {
    const res = await advertisementConfirmByUser({
      advertisementCodeList: [params.advertisementCode],
      channelSource: 'pc',
      eventType: params.eventType,
      buttonIndex: params.buttonIndex,
      noLongerRemindFlag: params.noLongerRemindFlag,
      operatePort: 'PC',
      operatorSystem: native.isClientMode() ? 'pcClient' : 'pc',
    })
    if (isHandleResult) {
      return res?.code === 0
    }
  }

  /**
   * 提交按钮点击：二次确认 → 跳转/API 上报 → 关闭
   * API 上报的 buttonIndex 取 button.buttonIndex（后端定义值）；
   * eventReport 的 buttonName 按 options.arrayIndex（数组下标）取，与旧实现一致。
   */
  async function submit(button: PopupActionButton, options: SubmitOptions): Promise<SubmitResult> {
    const result: SubmitResult = { shouldClose: true, apiButtonReported: false }

    // 1. 二次确认（含隐藏/恢复弹窗交互）
    const confirmed = await confirmWithWarn(button, options)
    if (!confirmed) return result

    // 2. jumpMode 分发
    if (button.jumpMode === 4) {
      // API 按钮：先调 confirmByUser，失败则不关闭
      const ok = (await reportUserAction(
        {
          advertisementCode: options.advertisementCode,
          eventType: 1,
          buttonIndex: button.buttonIndex,
          noLongerRemindFlag: options.noLongerRemindSelected ? 1 : 0,
        },
        true
      )) as boolean
      if (!ok) result.shouldClose = false
      result.apiButtonReported = true
    } else {
      await handleJump(button, options.popupType, options.pushToStyle)
    }

    // 3. 非 API 按钮补一次点击上报（eventType=1）
    if (!result.apiButtonReported) {
      await reportUserAction({
        advertisementCode: options.advertisementCode,
        eventType: 1,
        buttonIndex: button.buttonIndex,
        noLongerRemindFlag: options.noLongerRemindSelected ? 1 : 0,
      })
    }

    // 4. 点击事件上报（图文=1、纯图=4；buttonName 按数组下标取，与旧实现一致）
    eventReport({
      adCodes: [options.advertisementCode],
      eventType: options.clickEventType ?? 1,
      buttonName: options.buttonList?.[options.arrayIndex ?? 0]?.buttonText,
    })

    return result
  }

  /**
   * 关闭按钮：上报关闭事件（eventType=2，与旧实现一致）
   */
  async function reportClose(
    advertisementCode: string,
    noLongerRemindSelected: boolean,
    buttonIndex?: number
  ): Promise<void> {
    await reportUserAction({
      advertisementCode,
      eventType: 2,
      buttonIndex,
      noLongerRemindFlag: noLongerRemindSelected ? 1 : 0,
    })
    eventReport({ adCodes: [advertisementCode], eventType: 2 })
  }

  /**
   * 富文本内 <a> 链接处理
   *  - http/https → message-center iframe
   *  - native:/  → 站内路由（去掉前缀）
   * 返回是否发生了跳转（调用方据此关闭弹窗，与旧实现一致）
   */
  function handleAnchorLink(url: string): boolean {
    if (!url || !url.includes(':')) return false
    const [protocol] = url.split(':')
    switch (protocol) {
      case 'http':
      case 'https':
        router.push({ path: '/admin/message-center', query: { url } })
        return true
      case 'native':
        router.push({ path: url.replace('native:/', '') })
        return true
      default:
        return false
    }
  }

  return {
    confirmWithWarn,
    handleJump,
    reportUserAction,
    submit,
    reportClose,
    handleAnchorLink,
  }
}
