// 导出异步加密函数
export const encryptPhone = async (plainPhone: string): Promise<string> => {
  const { encryptPhoneSync } = await import('./crypto')
  return encryptPhoneSync(plainPhone)
}
