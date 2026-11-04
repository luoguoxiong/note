import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { GlobalState } from './type'
import { emitGlobalStateChange } from '@/native/event'

export const useGlobalStore = defineStore('global', () => {
  const globalState = ref<GlobalState>(createGlobalState())

  const customerInfo = computed(() => {
    return globalState.value.customerInfo
  })

  const realNameInfo = computed(() => {
    return globalState.value.real
  })

  const userInfo = computed(() => {
    return globalState.value.userInfo
  })

  async function getGlobalData() {
    // todo 获取用户信息、绑码信息、实名信息

    return globalState.value
  }

  async function updateUserInfo() {
    // todo 获取用户信息

    // 通知全局信息发生变更
    emitGlobalStateChange(globalState.value)
  }

  async function updateCustomerInfo() {
    // todo 更新绑码信息

    // 通知全局信息发生变更
    emitGlobalStateChange(globalState.value)
  }

  async function updateRealNameInfo() {
    // todo 更新实名信息

    // 通知全局信息发生变更
    emitGlobalStateChange(globalState.value)
  }

  return {
    customerInfo,
    realNameInfo,
    userInfo,
    updateCustomerInfo,
    updateRealNameInfo,
    updateUserInfo,
    getGlobalData,
  }
})

export function createGlobalState(): GlobalState {
  return {
    userInfo: {
      id: '',
      phone: '',
      encryptPhone: null,
      userName: null,
      nickname: null,
      position: '',
      newRegisterFlag: null,
      customerCode: '',
      headUrl: '',
      sex: 0,
      registrationDay: 0,
      registrationTime: '',
      birthday: '',
      oldUser: 0,
    },

    customerInfo: {
      customerId: '',
      customerType: 0,
      customerCode: '',
      customerShortName: '',
      existedRelationBind: false,
      bindAuth: false,
      hasCurBind: false,
    },

    real: {
      isValidation: false,
      isRealName: false,
      customerType: 0,
      icName: '',
      idCard: '',
      realName: '',
      authFlag: 0,
      noticeExplain: null,
      noticeTitle: null,
      headImgRealNameTagVO: {
        authFlag: 0,
        authFlagName: '',
      },
      personalPageRealNameTagVO: {
        authFlagName: '',
        authButtonName: '',
        authDesc: '',
      },
    },
  }
}
