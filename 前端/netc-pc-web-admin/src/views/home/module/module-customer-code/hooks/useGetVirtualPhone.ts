/**
 * 虚拟号工具(TS 版)
 * 来源: customer-code 引用的 @/views/setting/user/hooks/useGetVirtualPhone (netc-pc-web)
 */
export default function useGetVirtualPhone() {
  /**
   * 过滤非数字
   * @param phone 手机号码
   */
  const handleInputFormat = (phone: string): string => {
    return phone.replace(/[^\d]/g, '')
  }

  /**
   * 中文名字除首字母脱敏：李**
   * @param name 姓名
   */
  const formatName = (name: string): string => {
    if (!name) {
      return ''
    }
    let str = name.substring(0, 1)
    for (let i = 0; i < name.length - 1; i++) {
      str += '*'
    }
    return str
  }

  return {
    handleInputFormat,
    formatName,
  }
}
