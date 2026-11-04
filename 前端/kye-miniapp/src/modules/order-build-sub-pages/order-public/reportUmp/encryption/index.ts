// import { JSEncrypt } from 'jsencrypt'
// import baseReportInstance from '../base'
//
// export const rsaEncrypt = (data: string) => {
//   // 公钥,
//   const PUBLIC_KEY = baseReportInstance.get('key', 'storeParams')
//   console.log('密钥', PUBLIC_KEY)
//   // 使用公钥加密
//   const encrypt = new JSEncrypt()
//   encrypt.setPublicKey(PUBLIC_KEY)
//   const result = encrypt.encrypt(data)
//   return result
// }
// export function rsaDecrypt(data: string) {
//   //私钥，复制对应的私钥用于解密
//   const PRIVATE_KEY = '' //使用私钥解密
//   const decrypt = new JSEncrypt()
//   decrypt.setPrivateKey(PRIVATE_KEY)
//   const result = decrypt.decrypt(data)
//   return result
// }
