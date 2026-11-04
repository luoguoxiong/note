/**
 * 菜单角标列表 mock
 * 出参：{ code, msg, data: CornerItem[] }
 * style：1-自定义图片；2-数字微标；30-常规红点；40-气泡文案
 * menuId 对应菜单 mock（web.lightApplication.getApplicationInfoListByArea.js）中的菜单：
 *   308-首页 / 822-单票寄件 / 823-批量寄件 / 824-整车寄件
 */
module.exports = {
  enable: true,
  data: {
    code: 0,
    msg: 'OK',
    data: [
      // 常规红点：首页
      { cornerId: 1001, code: 'HOME_DOT', style: 30, menuIdList: ['308'] },
      // 数字微标：整车寄件（超 99 验证 99+ 截断）
      { cornerId: 1002, code: 'VTS_NUM', style: 2, content: '120', menuIdList: ['824'] },
      // 气泡文案：单票寄件
      { cornerId: 1003, code: 'SINGLE_BUBBLE', style: 40, content: '新', menuIdList: ['822'] },
      // 自定义图片：批量寄件
      {
        cornerId: 1004,
        code: 'BATCH_IMG',
        style: 1,
        pictureLink: 'https://ic-img.ky-express.com/netc/20260904_61476_!!1788512589773_188_48.png',
        menuIdList: ['823'],
      },
    ],
  },
}
