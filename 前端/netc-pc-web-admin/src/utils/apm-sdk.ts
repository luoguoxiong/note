import md5 from 'js-md5'
class Apm {
  // 自定义上报用户ID
  setUserId(phone: string) {
    const puid = md5(`${phone}netc`)
    console.log('userId===>', puid)
    // setUserConfig({ puid })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _apm && _apm('set', 'puid', puid)
  }

  // 错误上报
  reportError(error: Error) {
    // captureException && captureException(error)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    _apm && _apm('captureException', error)
  }
}

export default new Apm()
