/**
 * 营销抽奖活动 API 接口
 */
import { http } from '@public/utils/request'
import Taro from '@tarojs/taro'

// API 配置
const APPKEY = 55409

// 营销抽奖活动 API 类
export class MarketingLotteryAPI {
  /**
   * 获取摇奖活动信息
   * @param param 活动参数
   */
  static async getActivityInfo(param: { activityId: string }) {
    // 获取用户手机号
    const userInfo = Taro.getStorageSync('USER_INFO')
    const phone = userInfo?.phone || ''
    
    return http('crm.open.luckyActivity.getSingInStatus', { ...param, phone }, {
      appkey: APPKEY,
      hideToast: true
    })
  }

  /**
   * 摇奖活动用户签到
   * @param param 签到参数
   */
  static async sign(param: {
    activityId: string
    nickName: string
    mobile: string
    companyName?: string
    customerName?: string
    companyAddr?: string
  }) {
    // 获取用户手机号
    const userInfo = Taro.getStorageSync('USER_INFO')
    const phone = userInfo?.phone || ''
    
    return http('crm.open.luckyActivity.luckySignIn', { ...param, phone }, {
      appkey: APPKEY,
      hideToast: true
    })
  }

  /**
   * 摇奖活动更新用户信息
   * @param param 用户信息参数
   */
  static async saveUserInfo(param: {
    activityId: string
    nickName: string
    headImg: string
  }) {
    // 获取用户手机号
    const userInfo = Taro.getStorageSync('USER_INFO')
    const phone = userInfo?.phone || ''
    
    return http('crm.open.luckyActivity.saveLuckyUserInfo', { ...param, phone }, {
      appkey: APPKEY,
      hideToast: true
    })
  }

  /**
   * 获取中奖结果
   * @param param 活动参数
   */
  static async getLuckyResultByPc(param: { activityId: string }) {
    // 获取用户手机号
    const userInfo = Taro.getStorageSync('USER_INFO')
    const phone = userInfo?.phone || ''
    
    return http('crm.open.luckyActivity.getLuckyResultByPc', { ...param, phone }, {
      appkey: APPKEY,
      hideToast: true
    })
  }

  /**
   * 获取搜索地址
   * @param param 地址搜索参数
   */
  static async mapPosition(param: any) {
    return http('crm.open.common.mapPosition', param, {
      appkey: APPKEY,
      hideToast: true
    })
  }

  /**
   * 上传头像
   * @param filePath 文件路径
   * @param bizId 业务ID
   */
  static async uploadAvatar(filePath: string, bizId: string) {
    console.log('开始上传头像:', { filePath, bizId })
    
    // 获取上传 URL
    const getUploadUrl = () => {
      const ENV = process.env.TARO_APP_ENV || ''
      if (ENV.includes('stg')) {
        return 'https://edge-stg.kye-erp.com/router/upload'
      } else if (ENV.includes('uat')) {
        return 'https://edge.uat.kye-erp.com/router/upload'
      } else {
        return 'https://www.kye-erp.com/router/upload'
      }
    }
    
    // 使用 Taro.uploadFile 进行文件上传
    return new Promise((resolve, reject) => {
      Taro.uploadFile({
        url: getUploadUrl(),
        filePath,
        name: 'file',
        formData: {
          bizId,
          bizCode: 'erp_upload_image_preOrder'
        },
        success: (res) => {
          console.log('上传成功响应:', res)
          try {
            const data = JSON.parse(res.data)
            console.log('解析后的数据:', data)
            if (data.code === 0) {
              resolve({ data: data.data })
            } else {
              reject(new Error(data.msg || '上传失败'))
            }
          } catch (error) {
            console.error('解析响应失败:', error)
            reject(new Error('解析响应失败'))
          }
        },
        fail: (error) => {
          console.error('上传失败:', error)
          reject(error)
        }
      })
    })
  }
}

export default MarketingLotteryAPI
