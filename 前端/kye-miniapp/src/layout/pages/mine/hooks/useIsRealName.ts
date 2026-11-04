import { computed, ref } from 'vue'
import { getIsRealName } from '@public/apis/user'
import { isLogined } from '@/public/utils'

export const useIsRealName = () => {
  const isRealName = ref(false)
  const flag = ref<null | number>(null)

  const getRealName = async () => {
    if (isLogined()) {
      const { data } = await getIsRealName()
      isRealName.value = data.isRealName
      flag.value = data.headImgRealNameTagVO.authFlag
    } else {
      isRealName.value = false
      flag.value = null
    }
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
    [RealNameAuthFlag.NO_PERSON_VERIFY, 'https://ic-img.ky-express.com/netc/20251120_21725_!!1763643700821_292_64.png'],
    [RealNameAuthFlag.PERSON_VERIFY, 'https://ic-img.ky-express.com/netc/20251120_88188_!!1763643700832_292_64.png'],
    [
      RealNameAuthFlag.ENTERPRISE_VERIFY,
      'https://ic-img.ky-express.com/netc/20251120_47218_!!1763643700835_292_64.png',
    ],
    [RealNameAuthFlag.HAS_VERIFY, 'https://ic-img.ky-express.com/netc/20251120_99159_!!1763643700836_292_64.png'],
  ])

  const flagImage = computed(() => RealNameFlagMap.get(flag.value!))

  return { isRealName, getRealName, flagImage }
}
