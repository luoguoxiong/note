import { ENV } from './type'
export const ALIPAYSDK = 'https://appx/web-view.min.js'

// export const WXJSSDK = 'https://ic-h5.kye-erp.com/lib/jweixin-1.6.0.js'

export const WXJSSDK = 'https://ic-h5.kye-erp.com/lib/jweixin-1.6.2.js'

export const APPJSSDK = 'https://ic-h5.kye-erp.com/lib/dsbridge.js'

export const WXJSSDKSIGNAPIUAT =
  'https://ic-h5-uat.kye-erp.com/router/rest?web.ssoWeChatTool.getJsSdkSign'

export const WXJSSDKSIGNAPISTG =
  'https://ic-h5-stg.kye-erp.com/router/rest?web.ssoWeChatTool.getJsSdkSign'

export const WXJSSDKSIGNAPIPROD =
  'https://ic-h5.kye-erp.com/router/rest?web.ssoWeChatTool.getJsSdkSign'

export const APIAPPKY = '55262'

export const config = {
  uat: {
    wxjssdk: WXJSSDKSIGNAPIUAT,
  },
  stg: {
    wxjssdk: WXJSSDKSIGNAPISTG,
  },
  prod: {
    wxjssdk: WXJSSDKSIGNAPIPROD,
  },
}

export const getConfig = (env: ENV) => {
  return config[env]
}
