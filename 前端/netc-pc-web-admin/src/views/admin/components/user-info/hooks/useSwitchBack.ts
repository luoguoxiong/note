/**
 * 返回自己的手机号(白名单一键切回)
 * 来源: netc-pc-web/src/mixins/switchBack.js
 *
 * 依赖映射:
 *  - services/api/login.changeBack -> 本目录 api.ts changeBackApi(web.ssoChangeAccount.changeBack)
 *  - login().loginSucess(isWhiteListChange) -> useSwitchLoginSuccess.switchLoginSuccess(新基座无 guide 引导页)
 *  - @api/login.loginOut + @utils/commonUtil.userLogout -> 本目录 api.ts loginOutApi + @/utils/iframeBridge/interaction userLogOut
 */
import { KMessage } from '@netc-design-pc/ui'
import { userLogOut } from '@/utils/iframeBridge/interaction'
import { changeBackApi, loginOutApi } from '../api'
import { useSwitchLoginSuccess } from './useSwitchLoginSuccess'

export function useSwitchBack() {
  const { switchLoginSuccess } = useSwitchLoginSuccess()

  /** 切回原账户(对齐老 switchBack mixin) */
  const switchBack = async () => {
    let res: Awaited<ReturnType<typeof changeBackApi>> | null = null
    try {
      res = await changeBackApi()
    } catch (e: any) {
      // 请求异常(网络/token 失效等)仅提示, 不触发退登(对齐老 mixin 未捕获异常的行为)
      if (e?.msg) KMessage.error(e.msg)
      return
    }

    if (res?.data) {
      // 对齐老 mixin: loginData = userLoginInfoResponse + allowCheckFlag/userStatus, phone 从外层透传
      switchLoginSuccess({
        ...res.data.userLoginInfoResponse,
        phone: res.data.phone,
        allowCheckFlag: res.data.allowCheckFlag,
        userStatus: res.data.userStatus,
      })
      KMessage.success('切回原客户成功')
    } else {
      KMessage.warning('请重新登录')
      loginOutApi()
        .then((r) => {
          if (r.code === 0) {
            userLogOut()
          } else {
            if (r.msg) KMessage.error(r.msg)
          }
        })
        .catch(() => {
          // 退登接口失败(含 token 已失效)不阻塞退登流程, 错误静默(与 useUserInfo.logout 同口径)
        })
    }
  }

  return {
    switchBack,
  }
}
