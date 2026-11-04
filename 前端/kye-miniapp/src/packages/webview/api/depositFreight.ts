import { http } from '@public/utils/request'

export class WebviewAPI {
  /**
   * 预存运费检查参数
   * @param param 参数对象
   * @param param.scene 场景参数
   * @param param.type 类型参数
   */
  static async prestoreCheckParam(param: { scene: string; type: string }) {
    return http('web.prestore.checkParam', param, {
      hideToast: true
    })
  }
}

export default WebviewAPI
