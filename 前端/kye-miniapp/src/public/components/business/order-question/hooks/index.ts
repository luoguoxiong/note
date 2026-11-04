import Taro, { useDidShow } from '@tarojs/taro'
import { ref } from 'vue'
import * as Apis from '../api/index'

export const questionShow = (() => {
  return {
    isShow: false,
    orderId: '',
    batchId: '',
    setQuestionStatus(isShow: boolean, orderId?: string, batchId?: string) {
      this.isShow = isShow
      this.orderId = orderId || ''
      this.batchId = batchId || ''
    },
  }
})()

export const useQuestionShow = () => {
  const showQuestion = ref()

  const alertData = ref({})

  useDidShow(async () => {
    if (questionShow.isShow && !showQuestion.value) {
      const userinfo = Taro.getStorageSync('USER_INFO')
      const { data } = await Apis.orderQuestionCheck({
        alertType: 'surveyQuestionnaire',
        phone: userinfo.phone,
      })
      if (data.alertData) {
        alertData.value = {
          ...data.alertData,
          orderId: questionShow.orderId,
          batchId: questionShow.batchId,
        }
        showQuestion.value = true
      }
      questionShow.setQuestionStatus(false, '')
    }
  })

  const handleClose = () => {
    showQuestion.value = false
  }

  return { showQuestion, alertData, handleClose }
}
