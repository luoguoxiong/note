/* 我的页面-客户编码 */
import { ApplicationCodeMap } from '@public/utils/application/constants'
import { useApplication } from '@public/utils/application/useApplication'
import { computed } from 'vue'
import { report_clk_home_mine_mine_button } from '../../../report/mine'
import { useUserGlobalStore } from '@/store/user'
import { storeToRefs } from 'pinia'
const { navigateApplicationWithCode } = useApplication()

export default function useMineCustomer() {
  const userGlobalStore = useUserGlobalStore()
  // // 用户关联绑定信息
  // const relationAuth = ref<RelationAuth>(userGlobalStore.customerInfo)
  // const setRelationAuth = (value) => {
  //   relationAuth.value = value
  // }
  /* customerInfo 依赖我的页面调用 */
  const { customerInfo } = storeToRefs(userGlobalStore)

  const relationAuthText = computed(() => {
    const { hasCurBind, bindAuth, existedRelationBind } = customerInfo.value || {}
    console.log('customerInfo.value >>>', customerInfo.value)
    if (!hasCurBind) {
      if (bindAuth && existedRelationBind) {
        return '切换'
      }
      return '绑定'
    } else {
      if (bindAuth) {
        return '切换'
      } else {
        if (existedRelationBind) {
          return '切换'
        } else {
          return '更换'
        }
      }
    }
  })

  const pageUrlTitle = computed(() => {
    const { hasCurBind, bindAuth, existedRelationBind } = customerInfo.value || {}
    if (!hasCurBind) {
      if (bindAuth && existedRelationBind) {
        return '切换客户编码'
      }
      return '绑定客户编码'
    } else {
      if (bindAuth) {
        return '切换客户编码'
      } else {
        if (existedRelationBind) {
          return '切换客户编码'
        } else {
          return '更换客户编码'
        }
      }
    }
  })

  const customerNameText = computed(() => {
    if (customerInfo?.value?.customerShortName) {
      return customerInfo?.value?.customerShortName
    }
    // console.log('customerInfo.value >>>', customerInfo.value)
    let result = '未绑定客户编码'
    const { bindAuth, existedRelationBind } = customerInfo.value || {}
    // 无当前绑定 且有关联账号权限且有关联绑定公司
    if (bindAuth && existedRelationBind) {
      result = '需切换客户编码'
    }
    return result
  })

  // 跳转绑码页
  const navigateCustomerPage = () => {
    const { areaCode, menuCode } = ApplicationCodeMap['绑码组件']
    navigateApplicationWithCode(
      {
        areaCode,
        menuCode,
        queryParams: { express_type: '我的' },
      },
      {
        title: pageUrlTitle.value,
      },
    )
  }

  /* 我的-[绑码/更换/切换]按钮点击逻辑 */
  const handleCustomerClick = () => {
    report_clk_home_mine_mine_button('点击绑码')
    navigateCustomerPage()
  }

  return {
    customerInfo,
    relationAuthText,
    customerNameText,
    handleCustomerClick,
  }
}
