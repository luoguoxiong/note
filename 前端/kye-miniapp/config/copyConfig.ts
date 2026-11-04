/**
 * @Desc: copyConfig
 * @Date: 2025/10/15
 */
/* eslint-disable no-undef */
const isBuildWeaapp = process.env.TARO_ENV === 'weapp'
const isAppTemporary = process.argv.includes('--temporary')
const isBuildH5 = process.env.TARO_ENV === 'h5'

let copyPatterns: { from: string; to: string; ignore?: any }[] = []

const initCopyPatterns = () => {
  if (isBuildWeaapp) {
    const appConfig = !isAppTemporary
      ? [{ from: 'project.miniapp.json', to: 'dist/weapp/project.miniapp.json' }]
      : [{ from: 'project.private.miniapp.json', to: 'dist/weapp/project.miniapp.json' }]
    copyPatterns = [
      ...appConfig,
      { from: 'app.miniapp.json', to: 'dist/weapp/app.miniapp.json' }, // 微信多端配置
      { from: 'miniapp/', to: 'dist/weapp/miniapp/' }, // 微信配置+证书目录
      {
        from: 'src/modules/kye-miniapp-waybill/src/pages/waybill-route/components/routeMap/utils/alipay/mapLayout',
        to: 'dist/alipay/layout/',
        ignore: ['*.js'],
      }, // 支付宝小程序marker
      {
        from: './src/public/components/native/', // 原生组件
        to: 'dist/weapp/components/', // 会复制到 dist/weapp/
      },
    ]
  } else {
    copyPatterns = [
      {
        from: 'src/modules/kye-miniapp-waybill/src/pages/waybill-route/components/routeMap/utils/alipay/mapLayout',
        to: 'dist/alipay/layout/',
        ignore: ['*.js'],
      }, // 支付宝小程序marker
      {
        from: './src/public/components/native/', // 原生组件
        to: 'dist/weapp/components/', // 会复制到 dist/weapp/
      },
    ]
  }

  if (isBuildH5) {
    copyPatterns.push({
      from: './src/assets/',
      to: 'dist/h5/assets/',
    })
  }

  return copyPatterns
}

const copyConfig = {
  patterns: initCopyPatterns(),
  options: {},
}

export default copyConfig
