async function authorizedLogin(formData, authorizedType = 3) {
  const { phone, smsCode } = formData
  const { wxCode, deviceCode, version, deviceType, systemVersion } = wechatAuthorized.value
  const { appletLoginPhone } = onWechatBindInfo.value

  // 登录-微信一键绑定-2 使用小程序手机号
  const phoneValue = authorizedType === 3 ? phone : authorizedType === 2 ? appletLoginPhone : ''
  const params = {
    wxCode,
    authorizedType: authorizedType,
    from: fromRef.value,
    phone: phoneValue,
    smsCode: smsCode,
    deviceCode,
    version,
    deviceType,
    systemVersion,
  }
  const res = await bindPhoneApi.authorizedLoginByRisk(params)
  if (res.code === 0 && res.data && native_wxauth) {
    await native_wxauth.wxLoginCallback(JSON.stringify(res.data))
    native_wxauth.closeWindow()
  }
  return res
}
