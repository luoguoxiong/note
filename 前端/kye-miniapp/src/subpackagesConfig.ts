/**
 * 子应用全局配置信息文件
 */
const path = require('path')

const reslovePath = (relativePath) => {
  const cwd = process.cwd()
  return path.join(cwd, relativePath)
}

module.exports.subPackagesConfig = [
  // FMS
  {
    name: 'fms-parkpay-corp',
    buildName: 'fms-build',
    src: reslovePath('src/modules/fms-parkpay-corp/src'),
    dest: reslovePath('src/modules/fms-build'),
    git: '',
    branch: '',
    customPage: true, // 标识读取子包自定义app.config.ts（页面为多级目录，不能直接扫描pages）
  },
  // 查件
  {
    name: 'kye-miniapp-waybill',
    buildName: 'waybill-build',
    src: reslovePath('src/modules/kye-miniapp-waybill/src'),
    dest: reslovePath('src/modules/waybill-build'),
    git: '',
    branch: '',
  },
  // // 下单
  {
    name: 'kye-miniapp-order',
    buildName: 'order-build',
    src: reslovePath('src/modules/kye-miniapp-order/src'),
    dest: reslovePath('src/modules/order-build'),
    git: '',
    branch: '',
    customPage: true, // 标识读取子包自定义app.config.ts
  },
]

module.exports.publicConfig = {
  name: 'public',
  src: reslovePath('src/public'),
  git: '',
  branch: '',
}

module.exports.excludeBaseModules = ['user', 'waybill', 'webview', 'setting', 'pay', 'app-plugin']
