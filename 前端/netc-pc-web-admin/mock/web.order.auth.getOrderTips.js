/**
 * 下单权限查询 mock（未申请场景：弹「立即申请」+「取消」）
 * 出参：{ checkResultList: [{ blockedFlag, content, extraData: { haveApply: { haveApply, authPersonName } } }] }
 */
module.exports = {
  enable: false,
  data: {
    code: 0,
    msg: '',
    data: {
      checkResultList: [
        {
          blockedFlag: true,
          content:
            '您暂无【小艺哥牛杂粉二】公司下单权限，可联系贵司【主授权人】【牛*粉 173****2222】开通或点击立即申请',
          extraData: {
            haveApply: {
              // '10' 未申请（弹立即申请）；改 '20' 可测「审核中-我知道了」场景
              haveApply: '10',
              authPersonName: '牛*粉 173****2222',
            },
          },
        },
      ],
    },
  },
}
