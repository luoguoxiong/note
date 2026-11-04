export const exp_express_result_rotating_advertisement_v1 = (advertisementTitle: string) => {
  return {
    eventCode: 'exp_express_result_rotating_advertisement_v1',
    regionCode: 'page_express_result_v1',
    otherParams: () => {
      return {
        title: advertisementTitle,
      }
    },
  }
}

export const clk_express_result_rotating_advertisement_v1 = (advertisementTitle: string) => {
  return {
    eventCode: 'clk_express_result_rotating_advertisement_v1',
    regionCode: 'page_express_result_v1',
    otherParams: () => {
      return {
        title: advertisementTitle,
      }
    },
  }
}

export const clk_express_result_default_setting_popup_v1_type1 = () => {
  return {
    eventCode: 'clk_express_result_default_setting_popup_v1',
    regionCode: 'pop',
    otherParams: () => {
      return {
        button_name: '广告图',
      }
    },
  }
}

export const clk_express_result_default_setting_popup_v1_type2 = (selected: boolean) => {
  return {
    eventCode: 'clk_express_result_default_setting_popup_v1',
    regionCode: 'pop',
    otherParams: () => {
      return {
        button_name: '不再提醒',
        check_statu: selected ? '已勾选' : '未勾选',
      }
    },
  }
}

export const clk_express_result_default_setting_popup_v1_type3 = () => {
  return {
    eventCode: 'clk_express_result_default_setting_popup_v1',
    regionCode: 'pop',
    otherParams: () => {
      return {
        button_name: '关闭',
      }
    },
  }
}
