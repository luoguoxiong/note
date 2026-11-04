import Taro from '@tarojs/taro'

export const getLocationValueWithAuth = async () => {
  let result = { lat: '', lng: '', location_has_auth: '否', location_error_msg: '' }
  try {
    const { authSetting } = (await Taro.getSetting({})) || {}
    // 检查'scope.userLocation'是否授权
    if (authSetting['scope.userLocation']) {
      const location = await Taro.getLocation({ type: 'gcj02' })

      if (location && location.errMsg === 'getLocation:ok') {
        result['location_has_auth'] = '是'
        result = Object.assign(result, { lat: location.latitude, lng: location.longitude })
      } else {
        result['location_error_msg'] = (location && location.errMsg) || '未获取到定位'
      }
    } else {
      result['location_error_msg'] = '用户未授权'
    }
  } catch (e) {
    console.log(e)
  }
  return result
}

export const is_sign_in_h5 = (url: string) => {
  let result = false
  try {
    const decodeUrl = decodeURIComponent(url)
    result = decodeUrl.includes('sign-in')
  } catch (e) {
    console.log(e)
  }
  return result
}
