import { openURL } from '@/modules/webview/utils'
import { getApplicationByCode, getSingleApplicationUrl, urlContact } from '@/public/utils'

export const navigateWithParams = (
  appInfo: { menuCode: string; areaCode: string },
  params: Record<string, any> = {},
  routePath?: string,
  fallbackUrl?: string,
) => {
  const cloneAppInfo = { ...getApplicationByCode(appInfo.areaCode, appInfo.menuCode) }
  cloneAppInfo.routePath = routePath || cloneAppInfo.routePath
  if (routePath) {
    const url = new URL(cloneAppInfo.loadAddress)
    url.hash = ''
    cloneAppInfo.loadAddress = url.toString()
  }

  const url = getSingleApplicationUrl(cloneAppInfo) || fallbackUrl
  openURL(urlContact(url!, params), { needLogin: true })
}

export function useNavigateWithParams() {
  return {
    navigateWithParams,
  }
}
