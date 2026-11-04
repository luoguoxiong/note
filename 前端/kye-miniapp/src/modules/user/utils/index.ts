import JSEncrypt from 'jsencrypt'

/**
 * 获取微信一键登录login error错误信息
 * @param err
 * @returns {string|string|*}
 */
export const getLoginErrorMessage = (err) => {
  if (err && (err.msg || err.message || err.errMsg)) {
    return `${err.code ? 'code:' + err.code : ''}${err.msg || err.message || err.errMsg}`
  }
  return err ? (err.toString().indexOf('Error') !== -1 ? err.toString() : JSON.stringify(err)) : ''
}

/* eslint-disable-next-line */
export const filterEmojis =
  // eslint-disable-next-line no-misleading-character-class, no-useless-escape
  /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi

//过滤所有空格
export const filterAllSpace = (str: string): string => str?.replace(/\s+/g, '')

/**
 * 获取微信一键登录login error错误信息
 * @param err
 * @returns {{msg: string, errorString: string} | string}
 */
export const getLoginErrorMessageInfo = (err) => {
  let errorString
  if (err && (err.msg || err.message || err.errMsg)) {
    errorString = `${err.code ? 'code:' + err.code : ''}${err.msg || err.message || err.errMsg}`
  }
  errorString =
    errorString || (err ? (err.toString().indexOf('Error') !== -1 ? err.toString() : JSON.stringify(err)) : '')
  const msg = `${err?.msg || err?.message || err?.errMsg}`.replace(/Error:\s|AxiosError:\s|undefined|null/g, '') || ''
  return {
    errorString,
    msg,
  }
}

// 加密
const publicKey =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6UwXn4MUZIxurGpf7Y2bfOs/Db+je2OnN5FSefezhNt0VW6+pYq1InmhWgN+4+/9O3MXyZtVG5ChUEx2+tWwqpSxNiXsatPdLHgu70jPjGAe3lBG/mFWvw7+dl4pROza7hchJonwG8x2dhy/IpHMd/ffYUlBiRh3ceookPvRazSMpKbRBPJwyIiGUT32LytxAd/XTsK5YlsMz96JVbDYL53vrDhlcwOJsFJ53QJchYx0FMBx2meLrqB8z3JqYEcbSxBEVhGOmfnRhbjxZkeXdQh7nxhPfYcTFhrMd5rHVkiwckKKqi79BUvRY/hHbAya2/7WwJYnpqfJg5CRuEE4ZQIDAQAB'

export const setEncrypt = async (value) => {
  // 初始化用户数据
  // let encrypt = new JSEncrypt()
  // encrypt.setPublicKey(publicKey)
  // // 对aaa123456进行加密,得到加密后的字符串encrypted
  // let encrypted = await encrypt.encrypt(value)
  // console.log('加密密文', encrypted)
  // return encrypted
  return value
}

/**
 * ============== 自定义加密方案 ==============
 * 规则:
 * 1. 以 publicKey 作为基础串
 * 2. 从基础串不同偏移处,各收集 10 个【不重复】字符,组成 11 组映射表(对应手机号 11 位)
 * 3. 每组 10 个字符,索引 0-9 分别对应数字 0-9
 * 4. 加密:第 1 位数字用第 1 组,第 2 位用第 2 组…第 11 位用第 11 组,超出循环回第 1 组
 * 5. 解密:按位置取对应组,反查字符索引即得数字
 */

// 定义 11 组映射表(对应手机号 11 位):每组 10 个不重复字符,索引 0-9 对应数字 0-9
// 已将原基础串中的特殊字符 + 替换为 #,/ 替换为 @,保证 URL 安全传输(同一组内不重复)
const CIPHER_GROUPS = [
  'MIBjANgkqh', // 第 1 位
  'kqhiG9w0BA', // 第 2 位
  'AQEFOC8MIB', // 第 3 位
  '8AMIBCgKQE', // 第 4 位
  'AQE6UwXn4M', // 第 5 位
  'MUZIxurGpf', // 第 6 位
  '7Y2bfOs#D@', // 第 7 位
  '#je2OnN5FS', // 第 8 位
  'efzhNt0VW6', // 第 9 位
  '6#pYq1Inmh', // 第 10 位
  'WgN#4@9O3M', // 第 11 位
]

/**
 * 自定义加密:将数字字符串转换为密文
 * @param value 含数字的字符串(非数字字符会被过滤)
 * @returns 密文字符串
 */
export const customEncrypt = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  let result = ''
  for (let i = 0; i < digits.length; i++) {
    const digit = Number(digits[i])
    const group = CIPHER_GROUPS[i % 11]
    result += group[digit]
  }
  return result
}

/**
 * 自定义解密:将密文还原为数字字符串
 * @param encrypted 密文字符串
 * @returns 原始数字字符串
 */
export const customDecrypt = (encrypted: string): string => {
  let result = ''
  for (let i = 0; i < encrypted.length; i++) {
    const char = encrypted[i]
    const group = CIPHER_GROUPS[i % 11]
    const digit = group.indexOf(char)
    if (digit === -1) {
      throw new Error(`解密失败:位置 ${i + 1} 的字符 "${char}" 不在映射表中`)
    }
    result += digit
  }
  return result
}
