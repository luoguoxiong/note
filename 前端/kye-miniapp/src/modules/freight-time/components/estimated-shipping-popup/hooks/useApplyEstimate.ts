import { ref, reactive, computed } from 'vue'
import Taro from '@tarojs/taro'
import { applyEstimated, getApplyContent } from '../../../api'
import type { ApplyContentResponse } from '../../../types'
import { PersonnelContactType } from '../../../constants'

/** 申请详情数据（对齐 ApplyContentResponse） */
interface ApplyData {
  applyReason: string
  applyTime: string
  /** 联系人角色描述，如"商务""审批人" */
  contactTypeDesc: string
  /** 联系人按钮文案 */
  contactButtonName: string
  /** 联系人类型（10:主授权人 20:管理员 30:商务） */
  contactType: PersonnelContactType
  /** 联系场景 */
  contactScene: string
}

export function useApplyEstimate() {
  const show = ref(false)
  const loading = ref(false)
  const applyReason = ref('')
  /** 申请提示文案：由前端根据 applyTime 构造 */
  const applyHeadTip = computed(() =>
    applyData.applyTime ? `您于${applyData.applyTime}已申请，如需加急处理请联系商务` : ''
  )
  const applyData = reactive<ApplyData>({
    applyReason: '',
    applyTime: '',
    contactTypeDesc: '',
    contactButtonName: '',
    contactType: PersonnelContactType.未加载,
    contactScene: '',
  })

  /** 获取已有的申请内容（申请中/申请失败时调用） */
  const fetchApplyContent = async () => {
    try {
      const res = await getApplyContent()
      const data: ApplyContentResponse = res.data || {
        applyReason: '',
        applyTime: '',
        contactTypeDesc: '',
        contactButtonName: '',
        contactType: '',
        contactScene: '',
      }
      applyReason.value = data.applyReason
      applyData.applyReason = data.applyReason
      applyData.applyTime = data.applyTime
      applyData.contactTypeDesc = data.contactTypeDesc
      applyData.contactButtonName = data.contactButtonName
      applyData.contactType = data.contactType
      applyData.contactScene = data.contactScene
    } catch {
      // 获取失败不阻塞流程
    }
  }

  /** 提交申请（对齐 apply-popup onConfirm） */
  const handleSubmit = async () => {
    loading.value = true
    try {
      await applyEstimated({
        authCodes: ['freightLookAuthFlag'],
        applyReason: applyReason.value,
      })
      Taro.showToast({ title: '提交成功，已为您通知审批人', icon: 'none', duration: 2000 })
      show.value = false
      return true
    } catch (err: any) {
      if (err?.code === 80000 && err?.msg) {
        Taro.showToast({ title: err.msg, icon: 'none', duration: 2000 })
      } else {
        Taro.showToast({ title: '申请失败，请重新提交', icon: 'none', duration: 2000 })
      }
      return false
    } finally {
      loading.value = false
    }
  }

  const handleClose = () => {
    show.value = false
  }

  return {
    show,
    loading,
    applyReason,
    applyHeadTip,
    applyData,
    fetchApplyContent,
    handleSubmit,
    handleClose,
  }
}
