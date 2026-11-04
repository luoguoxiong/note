import Taro from '@tarojs/taro'

/**
 * @Desc: useLoginAccountCancel 注销账号逻辑
 * @Date: 2025/7/21
 */
const useLoginAccountCancelSetting = () => {
  /* 跳转到注销账号页 */
  const goAccountCancellationH5Page = () => {
    Taro.navigateTo({ url: '/modules/user/pages/account-logoff/index' })
  }
  return {
    goAccountCancellationH5Page,
  }
}

export default useLoginAccountCancelSetting
