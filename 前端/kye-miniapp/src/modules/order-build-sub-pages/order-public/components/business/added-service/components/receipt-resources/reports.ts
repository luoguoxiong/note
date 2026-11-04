import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { isWxPcAppletEnv } from '@/public/utils'

// 下单_资料_上传方式_微信_点击
export const uploadToWXListClickReport = () => {
  console.log('lllllllasdfasfsaf')
  umpOtherReport('CLK', {
    eventCode: 'clk_express_file_uploadtype_wechat_v1',
  })
}

// 下单_资料_上传方式_手机_点击 or 手机_点击
export const uploadToPhoneOrPcClickReport = () => {
  const eventCode = isWxPcAppletEnv ? 'clk_express_file_uploadtype_computer_v1' : 'clk_express_file_uploadtype_phone_v1'
  umpOtherReport('CLK', {
    eventCode,
  })
}

// 下单_资料_上传方式_页面浏览
export const uploadPageExpressReport = () => {
  umpOtherReport('EXP', {
    eventCode: 'page_express_file_uploadtype_v1',
  })
}
