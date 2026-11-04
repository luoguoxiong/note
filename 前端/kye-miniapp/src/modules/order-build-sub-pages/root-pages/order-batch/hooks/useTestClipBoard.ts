import { tellClipBoard } from '@order-public-sub-public/validate/access'
import { CheckBeforeEnterType } from '@order-public-sub-public/constants'

export const TEST_BOARD_TEXT = `
  张出仓
  13888888888
  0755-23232111
  阿尔卑斯啵公司
  山东省青岛市崂山区秦岭路6号永新国际金融中心永新国际广场  阿尔卑斯啵公司 报关出仓
`
// 本地调试打开这里
// export const testClipBoardTexrt = location.hostname === 'localhost' ? TEST_BOARD_TEXT : ''
export const testClipBoardTexrt = ''

// 引入： import { activeClipBoard } from '@order-public-sub-root-pages/order-batch/hooks/useTestClipBoard'
export const activeClipBoard = () => {
  tellClipBoard({
    key: '',
    showType: 4, // 显示方式
    blockedFlag: false, // 是否阻塞下单
    content: '', //文案 统一按v-html处理,
    preLimitType: CheckBeforeEnterType.识别粘贴板,
    defer: true, //是否要在首页弹
  })
}
