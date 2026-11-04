import { computed, watch } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import { currentPopueType } from '@order-public-sub-public/hooks/address/sender/state'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { Address, CompleteAddressSceneType, CheckShowType, ModuleType } from '@order-public-sub-public/constants'
import { ModulePageType } from '@order-public-sub-public/components/business/exhibition/hooks/data-config'
import {
  province as senderProvince,
  city as senderCity,
  county as senderCounty,
  detailAddress as senderDetailAddress,
} from '@order-public-sub-public/hooks/address/sender/state'
import {
  province as receiveProvince,
  city as receiveCity,
  county as receiveCounty,
  detailAddress as receiveDetailAddress,
} from '@order-public-sub-public/hooks/address/receive/state'
import { getData as getSenderData } from '@order-public-sub-public/hooks/address/sender/useUpdateData'
import { getData as getReceiveData } from '@order-public-sub-public/hooks/address/receive/useUpdateData'
import { useRestrict } from '@order-public-sub-public/hooks/address/useCommon'
import { isShowRealNameGuide } from '@order-public-sub-public/components/ui/person-name-guide/hooks/useState'
import { useAddressReminder } from '@order-public-sub-public/hooks/useAddressReminder'
import useEffect from '@order-public-sub-public/validate'
import type { CompleteAddressResult } from '@order-public-sub-public/apis/address/types'
import type { ChangeKeys } from '@order-public-sub-public/types'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { useCompleteAddress } from './useCompleteAddress'
import { buildCompleteAddressParams } from '../utils'

/**
 * @description 下单页地址校正逻辑：提示条显隐（地址提醒接口）、点击去修改调用完善地址接口、校正弹窗数据与确定修改回填
 * 地址提醒接口返回的提示（寄件/收件/海南违禁品）优先级最低，寄/收下方有其他提示时不展示
 * @param type 寄方/收方
 * @param isFlat 是否平铺形态（unfold），影响实名引导、门牌号提示的判断范围
 */
export const useAddressCorrection = (type: ModulePageType, isFlat = false) => {
  const piniaStore = useStore()

  const isSender = type === ModulePageType.寄方
  const side = isSender ? 'sender' : 'receive'
  const moduleType = isSender ? ModuleType['寄方信息'] : ModuleType['收方信息']

  // 寄/收方对应的地址状态与表单读取（确定修改回填、过程校验共用）
  const sideAddress = isSender
    ? {
        province: senderProvince,
        city: senderCity,
        county: senderCounty,
        detailAddress: senderDetailAddress,
        getData: getSenderData,
      }
    : {
        province: receiveProvince,
        city: receiveCity,
        county: receiveCounty,
        detailAddress: receiveDetailAddress,
        getData: getReceiveData,
      }

  // 埋点公共参数：寄/收件来源识别类型、运单号
  const recognitionType = isSender ? '寄件' : '收件'
  const getWaybillNumber = () => piniaStore.order.waybillNumber || ''
  const baseReportParams = () => ({ waybill_number: getWaybillNumber(), recognition_type: recognitionType })

  // 地址提醒数据（addressWarningFlag 为 true 时触发接口）
  const { senderReminder, receiveReminder, dismissReminder } = useAddressReminder()

  // 取派管控创可贴（限取限派提示条，寄/收各一份），展示时优先级高于地址提醒
  const { limitRemindBarData } = useRestrict({
    moduleStyle: isSender ? Address.SENDER : Address.RECEIVE,
  })

  // 当前类型的提醒（type=800 寄件 / type=900 收件）
  const currentReminder = computed(() => {
    return isSender ? senderReminder.value : receiveReminder.value
  })

  // 提示文案由提醒接口返回
  const tipText = computed(() => currentReminder.value?.content || '')

  // 判断寄/收下方是否已有其他提示（优先级高于地址提醒；地址提醒接口返回的提示一律最低优先级）
  const hasExistingTips = computed(() => {
    // 1. checkResultList 中存在地址校验提示（showType === 2）
    const hasCheckTip = piniaStore.globalData.checkResultList?.some(
      (item) => item.key === `${side}.address` && item.showType === CheckShowType.BAR,
    )
    if (hasCheckTip) return true
    // 2. 取派管控创可贴提示条（restrictData.addressRestrict，含收方阶梯费提示）
    if (limitRemindBarData.value.show) return true
    // 3. 实名认证引导（仅寄方填单页有 PersonNameGuide 组件，平铺形态不渲染）
    if (!isFlat && isSender && isShowRealNameGuide.value) return true
    // 4. 门牌号提示（仅平铺形态的 detailAddressTips 会渲染）
    if (isFlat) {
      const addressIntegralityTips = piniaStore.schema.moduleDimensionData(moduleType)?.addressIntegralityTips
      if (addressIntegralityTips) return true
    }

    return false
  })

  // 提示条显隐：地址提醒接口返回且无更高优先级提示时展示
  const tipVisible = computed(() => {
    return !!currentReminder.value && !hasExistingTips.value
  })

  // 校正弹窗公共流程
  const { dialogVisible, currentAddress, suggestedAddress, modifying, trigger, onDialogConfirm, onDialogCancel } =
    useCompleteAddress({
      buildParams: () => {
        const formData = (piniaStore.order.moduleFormData(moduleType) ?? {}) as Record<
          string,
          string | null | undefined
        >
        return buildCompleteAddressParams({
          side,
          sceneType: CompleteAddressSceneType.下单,
          source: formData,
        })
      },
      onNoPopup: () => {
        // type=20 异常：前端兜底，提示当前地址已完善
        showToast('当前地址已完善')
        // TODO: 此时需要调用接口隐藏提示条，接口待提供，后续补充
      },
      onConfirm: async (suggested: CompleteAddressResult, { close }) => {
        // 回填建议地址（省/市/区/详细地址），再同步更新 store
        sideAddress.province.value = suggested.province || sideAddress.province.value
        sideAddress.city.value = suggested.city || sideAddress.city.value
        sideAddress.county.value = suggested.county || sideAddress.county.value
        sideAddress.detailAddress.value = suggested.detailAddress || sideAddress.detailAddress.value
        piniaStore.order.updateOrderByType({ type: moduleType, data: { ...sideAddress.getData() } })

        // 先关闭弹窗，再在后台调用过程中接口重新校验（与原行为一致，不阻塞弹窗关闭）
        close()
        try {
          const { remoteCheck } = useEffect()
          await remoteCheck(side as ChangeKeys, { [side]: sideAddress.getData() })
        } catch (e) {
          console.error('[useAddressCorrection] remoteCheck 异常:', e)
        }
      },
    })

  // 弹窗打开时把对应寄/收方模块提到最上层，避免被另一块地址模块盖住
  // （与指定地址、展会、地址展开等弹窗保持一致，它们都会设置 currentPopueType）
  watch(dialogVisible, (val) => {
    if (val) {
      currentPopueType.value = isSender ? 'sender' : 'receive'
    }
  })

  // 埋点：地址校正提醒横幅曝光（提醒条由隐藏变展示时触发）
  watch(tipVisible, (val) => {
    if (val) {
      umpOtherReport('EXP', { eventCode: 'exp_express_address_correction_tips_v1' }, baseReportParams())
    }
  })

  // 关闭提醒条：从 store 中删除对应提醒数据，显隐由 tipVisible 数据驱动；
  // 接口下次重新返回该提醒时会再次展示。
  const onCloseTip = () => {
    const reminderType = currentReminder.value?.type
    if (reminderType) {
      dismissReminder(reminderType)
    }
  }

  // 埋点：点击"去修改"
  const onModify = () => {
    umpOtherReport('CLK', { eventCode: 'clk_express_address_correction_modify_v1' }, baseReportParams())
    return trigger()
  }

  // 埋点：弹窗按钮点击（确定修改/暂不修改）
  const reportDialogButton = (buttonName: string) => {
    umpOtherReport(
      'CLK',
      { eventCode: 'clk_express_address_correction_confirm_button_v1' },
      { button_name: buttonName, waybill_number: getWaybillNumber() },
    )
  }

  const onConfirm = () => {
    reportDialogButton('确定修改')
    onDialogConfirm()
  }

  const onCancel = () => {
    reportDialogButton('暂不修改')
    onDialogCancel()
  }

  return {
    tipVisible,
    tipText,
    modifying,
    dialogVisible,
    currentAddress,
    suggestedAddress,
    onModify,
    onConfirm,
    onCancel,
    onCloseTip,
  }
}
