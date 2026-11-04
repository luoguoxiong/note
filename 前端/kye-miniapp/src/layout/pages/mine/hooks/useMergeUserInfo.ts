import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUpdateSomeUserInfoV1 } from '@public/hooks/useUpdateSomeUserInfoV1'
import { isLogined } from '@/public/utils'

export const useMergeUserInfo = () => {
  const { getMinePageUserInfo, globalUserStore } = useUpdateSomeUserInfoV1()

  const store = storeToRefs(globalUserStore)

  const getMinePageData = async () => {
    if (!isLogined()) {
      return
    }
    await getMinePageUserInfo()
  }

  const RealNameAuthFlag = {
    NO_VERIFY: 10, // 未认证
    NO_PERSON_VERIFY: 20, // 未个人认证
    PERSON_VERIFY: 30, // 已个人认证
    ENTERPRISE_VERIFY: 40, // 已企业认证
    HAS_VERIFY: 50, // 已实名
  }
  const RealNameFlagMap = new Map([
    [RealNameAuthFlag.NO_VERIFY, 'https://ic-img.ky-express.com/netc/20251120_21725_!!1763643700821_292_64.png'],
    [RealNameAuthFlag.NO_PERSON_VERIFY, 'https://ic-img.ky-express.com/netc/20251202_19345_!!1764677102485_146_32.png'],
    [RealNameAuthFlag.PERSON_VERIFY, 'https://ic-img.ky-express.com/netc/20251120_88188_!!1763643700832_292_64.png'],
    [
      RealNameAuthFlag.ENTERPRISE_VERIFY,
      'https://ic-img.ky-express.com/netc/20251120_47218_!!1763643700835_292_64.png',
    ],
    [RealNameAuthFlag.HAS_VERIFY, 'https://ic-img.ky-express.com/netc/20251120_99159_!!1763643700836_292_64.png'],
  ])

  const flagImage = computed(() => {
    const headImgRealNameTagVO = store.data.value?.real?.headImgRealNameTagVO as any
    const authFlag = headImgRealNameTagVO?.authFlag
    const customerShortName = globalUserStore.data?.customerInfo?.customerShortName
    if (!customerShortName && authFlag === RealNameAuthFlag.PERSON_VERIFY) {
      return 'https://ic-img.ky-express.com/netc/20251126_46998_!!1764137535405_292_64.png'
    }
    return RealNameFlagMap.get(authFlag)
  })

  const realName = computed(() => store.data.value?.real)

  /** 新客 */
  const newCustomerFlag = computed(() => {
    return globalUserStore.data.userInfo?.isOldCustomer === 0 && !globalUserStore.data.customerInfo.customerCode
  })

  return {
    flagImage,
    realName,
    newCustomerFlag,
    RealNameAuthFlag,
    getMinePageData,
  }
}
