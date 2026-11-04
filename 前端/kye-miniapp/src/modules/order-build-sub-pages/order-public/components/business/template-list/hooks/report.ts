export const exp_sendtemplate_itc = (total: number) => {
  return {
    eventCode: 'exp_sendtemplate_itc',
    otherParams: () => {
      return {
        template_type: total > 0 ? '有寄件模板' : '无寄件模板',
      }
    },
  }
}

/**
 *
 * @param total
 * @param button_name
 * 0、下拉框
 * 1、常规
 * 2、寄件模板
 * 3、管理模板
 * 4、添加模板
 */
export const clk_sendtemplate_itc = (total: number, button_name: string | undefined) => {
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_sendtemplate_itc',
    },
    {
      template_type: total > 0 ? '有寄件模板' : '无寄件模板',
      button_name,
    }
  )
}
