/**
 * 手机号 AES 加密
 * 来源: netc-pc-web/src/utils/cryptoJs.js encryptPhone(AES-256-CBC + 随机 IV + PKCS7)
 * 实现: 浏览器原生 WebCrypto(零依赖), IV 拼接密文后统一 Base64, 与老基座 CryptoJS 版本语义等价
 */

const AES_KEY_HEX = '4a2bdbd575d5397cae8e3f95e3121b248ff1b48e196b7026b9681ad497fecdc5'

const hexToBytes = (hex: string) => {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export const encryptPhone = async (plainPhone: string) => {
  try {
    const subtle = window.crypto?.subtle
    if (!subtle) return ''
    const key = await subtle.importKey('raw', hexToBytes(AES_KEY_HEX), { name: 'AES-CBC' }, false, ['encrypt'])
    const iv = window.crypto.getRandomValues(new Uint8Array(16)) // 每次随机 16 字节 IV
    const cipher = await subtle.encrypt({ name: 'AES-CBC', iv }, key, new TextEncoder().encode(plainPhone))
    // IV(16字节) 与密文拼接后统一 Base64
    const ivAndCipher = new Uint8Array(iv.length + cipher.byteLength)
    ivAndCipher.set(iv)
    ivAndCipher.set(new Uint8Array(cipher), iv.length)
    return bytesToBase64(ivAndCipher)
  } catch (e) {
    console.error('手机号加密异常', e)
    return '' // 加密异常时返回空串，后端按明文兜底
  }
}
