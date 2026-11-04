import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
// 关闭绑码提示条
export const useAddressSuggest = (address_id: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_addassociation_v1  ',
    },
    {
      address_id: address_id,
    },
  )
}
