import { useLoginPasswordSetting } from './useLoginPassword'
import { useLoginWhiteListSetting } from './useLoginWhiteList'
import { useLoginSwitchSetting } from './useLoginSwitch'
import useLoginAccountCancelSetting from './useLoginAccountCancel'
import { useOneKeyLogoutSetting } from './useOneKeyLogout'

export const useLoginSetting = () => {
  const useLoginSwitch = useLoginSwitchSetting()
  const useLoginPassword = useLoginPasswordSetting()
  const useLoginWhiteList = useLoginWhiteListSetting()
  const useLoginAccountCancel = useLoginAccountCancelSetting()
  const useOneKeyLogout = useOneKeyLogoutSetting()
  return {
    ...useLoginSwitch,
    ...useLoginPassword,
    ...useLoginWhiteList,
    ...useLoginAccountCancel,
    ...useOneKeyLogout,
  }
}
