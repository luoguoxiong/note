import { ref, watch } from 'vue'
import { showLoadingToast, closeToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { setFooterZIndex } from '@order-public-sub-public/hooks/asynrender'
import { completeAddress } from '@order-public-sub-public/apis/address'
import type { CompleteAddressParams, CompleteAddressResponse, CompleteAddressResult } from '@order-public-sub-public/apis/address/types'
import { CompleteResultType } from '@order-public-sub-public/constants'

/**
 * @description 地址校正弹窗的确认回调上下文
 */
export interface CompleteAddressConfirmContext {
  /** 关闭校正弹窗 */
  close: () => void
}

/**
 * @description 地址校正弹窗的确认回调
 * @returns 返回 Promise 时，弹窗展示 loading 直到 settled；抛出异常时保留弹窗并关闭 loading，便于重试
 */
export type CompleteAddressConfirmHandler = (
  suggested: CompleteAddressResult,
  ctx: CompleteAddressConfirmContext,
) => void | Promise<void>

export interface UseCompleteAddressOptions {
  /** 构造完善地址接口入参 */
  buildParams: () => CompleteAddressParams
  /**
   * 判断接口返回是否需要弹窗，默认 type === '10'（正常返回）
   * 地址簿新增/编辑页用 needFlag === '10' 判断
   */
  shouldPopup?: (res: CompleteAddressResponse) => boolean
  /** 不需要弹窗时的回调（如 type=20 异常兜底） */
  onNoPopup?: (res: CompleteAddressResponse) => void
  /** 点击"确定修改"后的业务处理（回填、调保存接口等） */
  onConfirm?: CompleteAddressConfirmHandler
  /** 点击"暂不修改"或关闭弹窗时的回调 */
  onCancel?: () => void
}

/**
 * @description 地址校正（完善地址）公共流程：
 * 1. 触发时调用 completeAddress，通过 modifying 防重复点击
 * 2. 需要弹窗时打开校正弹窗，等待用户操作
 * 3. 确定修改时调用 onConfirm，弹窗展示 loading；onConfirm 抛错则关闭 loading 并保留弹窗
 * 4. 暂不修改/关闭时放行后续流程
 *
 * 下单页、地址簿列表、地址簿新增/编辑页共用此 hook。
 */
export const useCompleteAddress = (options: UseCompleteAddressOptions) => {
  const dialogVisible = ref(false)
  const currentAddress = ref('')
  const suggestedAddress = ref('')
  /** completeAddress 请求中（触发按钮防重） */
  const modifying = ref(false)
  /** 确定修改后的业务请求中（弹窗 loading） */
  const submitting = ref(false)

  // 接口返回的建议地址（仅地址字段），确定修改后传给 onConfirm
  let suggestedInfo: CompleteAddressResult = {}
  // 弹窗等待用户操作的 resolve，trigger() 借此等待确认结果
  let resolveWait: ((value: boolean) => void) | null = null

  // 弹窗打开时把 footer 降到 12，关闭时恢复 14，确保校正弹窗盖住底部费用栏
  watch(dialogVisible, (val) => {
    setFooterZIndex(val)
  })

  const close = () => {
    dialogVisible.value = false
  }

  const shouldPopup =
    options.shouldPopup ?? ((res: CompleteAddressResponse) => res.type === CompleteResultType['正常'])

  /**
   * 从完善地址接口返回中提取地址相关字段
   * 接口返回的手机号/固话/分机号等字段禁止使用，统一在此剥离，避免业务侧回填误用
   */
  const pickAddressResult = (info?: CompleteAddressResponse['afterAddress'] | null): CompleteAddressResult => {
    const { fullAddress = null, province = null, city = null, county = null, detailAddress = null } = info || {}
    return { fullAddress, province, city, county, detailAddress }
  }

  /**
   * 触发完善地址校验：调接口 → 弹窗（如需）→ 等待用户操作
   * @returns true 表示用户确认修改；false 表示无需弹窗或用户暂不修改
   */
  const trigger = async (): Promise<boolean> => {
    if (modifying.value) return false
    modifying.value = true
    try {
      const { data: rawRes } = await completeAddress(options.buildParams())
      if (!rawRes) return false

      // 仅保留地址相关字段，手机号/固话/分机号等返回字段不可使用
      const afterAddress = pickAddressResult(rawRes.afterAddress)
      const res: CompleteAddressResponse = { ...rawRes, afterAddress }
      suggestedInfo = afterAddress
      suggestedAddress.value = afterAddress.fullAddress || ''

      if (shouldPopup(res)) {
        currentAddress.value = res.beforeAddress || ''
        dialogVisible.value = true
        return await new Promise<boolean>((resolve) => {
          resolveWait = resolve
        })
      }
      options.onNoPopup?.(res)
      return false
    } catch (e) {
      console.error('[useCompleteAddress] 地址校正请求异常:', e)
      return false
    } finally {
      modifying.value = false
    }
  }

  /** 弹窗-确定修改 */
  const onDialogConfirm = async () => {
    if (submitting.value) return
    submitting.value = true
    showLoadingToast({ message: '加载中', forbidClick: true })
    try {
      await options.onConfirm?.(suggestedInfo, { close })
      resolveWait?.(true)
      resolveWait = null
    } catch (e) {
      // onConfirm 抛错时保留弹窗、关闭 loading，便于用户重试；错误提示由请求层处理
      console.error('[useCompleteAddress] onConfirm 执行异常:', e)
    } finally {
      submitting.value = false
      closeToast()
    }
  }

  /** 弹窗-暂不修改/关闭 */
  const onDialogCancel = () => {
    close()
    options.onCancel?.()
    resolveWait?.(false)
    resolveWait = null
  }

  return {
    dialogVisible,
    currentAddress,
    suggestedAddress,
    modifying,
    submitting,
    trigger,
    onDialogConfirm,
    onDialogCancel,
  }
}
