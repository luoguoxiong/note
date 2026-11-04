import { defaultApplication } from './weapp.esm'
function removeVersion(url) {
  return url.replace(/\/\d+(?:\.\d+)+\//, '/')
}
const data = defaultApplication.map((item) => {
  const lightApplicationInfos = item.lightApplicationInfos.map((item) => {
    return {
      menuName: item.menuName,
      menuCode: item.menuCode,
      applicationCode: item.applicationCode,
      menuIcon: item.menuIcon,
      smallIcon: item.smallIcon,
      menuBackground: item.menuBackground,
      menuContent: item.menuContent,
      routePath: item.routePath,
      accessMode: item.accessMode,
      loadAddress: removeVersion(item.loadAddress),
      menuCustomParam: item.menuCustomParam,
      customParam: item.customParam,
      loginType: item.loginType,
      menuIconType: item.menuIconType,
      menuIconContent: item.menuIconContent,
      smallIconType: item.smallIconType,
      smallIconContent: item.smallIconContent,
      needGray: item.needGray,
      grayHeader: item.grayHeader,
    }
  })
  return {
    ...item,
    lightApplicationInfos,
  }
})

console.error('JSON.stringify(data)', JSON.stringify(data))
