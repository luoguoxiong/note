import { report_EXP_event, report_other_event, report_CLK_event } from '@public/utils/reportUtil'
import { computed } from 'vue'
import { useRealNameStore } from '../store'
const realNameStore = useRealNameStore()
const forceVerifyObj = computed(() => realNameStore.getForceVerifyObj || { forceFlag: '', isFromBaqiang: '' })
export const reportSource = computed(() => {
  return forceVerifyObj.value?.forceFlag + '' === '10'
    ? '下单成功页'
    : forceVerifyObj.value?.isFromBaqiang === 'true'
      ? '巴枪'
      : '个人中心'
})

// 个人中心_实名认证页_个人认证页_确认修改昵称弹窗
export const exp_id_personal_modify_delivery = (params) => {
  report_EXP_event('exp_id_personal_modify_delivery', {
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_确认修改昵称弹窗_点击
export const clk_id_personal_modify_button = (params) => {
  report_CLK_event('clk_id_personal_modify_button', {
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_同步设置昵称弹窗
export const exp_id_personal_set_delivery = (params) => {
  report_EXP_event('exp_id_personal_set_delivery', {
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_同步设置昵称弹窗_点击
export const clk_id_personal_set_button = (params) => {
  report_CLK_event('clk_id_personal_set_button', {
    ...params,
  })
}

export const clk_id_personal = (params) => {
  report_CLK_event('clk_id_personal', {
    button_name: '提交',
    ...params,
  })
}

// 个人中心_实名认证页_认证成功页_点击
export const clk_id_id_success_button = (params) => {
  report_CLK_event('clk_id_id_success_button', {
    ...params,
  })
}

// 个人中心_实名认证页_认证成功页_页面类型
export const other_id_id_success = (params) => {
  report_other_event('other_id_id_success', {
    ...params,
  })
}

// 个人中心_实名认证页_分享实名卡片_个人认证页
export const exp_share_real_name_card_personal = (params) => {
  report_EXP_event('exp_share_real_name_card_personal', {
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_证件类型_填写
export const other_center_id_personal_type = (params) => {
  report_other_event('other_center_id_personal_type', {
    source: reportSource.value,
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_证件姓名_填写
export const other_center_id_personal_id_name = (params) => {
  report_other_event('other_center_id_personal_id_name', {
    source: reportSource.value,
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_证件号_填写
export const other_center_id_personal_id_number = (params) => {
  report_other_event('other_center_id_personal_id_number', {
    source: reportSource.value,
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_提交按钮_点击
export const clk_center_id_personal_button = (params) => {
  report_CLK_event('clk_center_id_personal_button', {
    source: reportSource.value,
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_提交结果
export const other_center_id_personal_button = (params) => {
  report_other_event('other_center_id_personal_button', {
    source: reportSource.value,
    ...params,
  })
}

export const other_id_personal_launch = (params) => {
  report_other_event('other_id_personal_launch', {
    source: reportSource.value,
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页曝光
export const exp_center_id_personal = (params) => {
  report_EXP_event('exp_center_id_personal', {
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_点击上传身份证
export const clk_center_id_personal_upload_identity_photo_button = (params) => {
  report_CLK_event('clk_center_id_personal_upload_identity_photo_button', {
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_上传身份证回填
export const other_center_id_personal_write = (params) => {
  report_other_event('other_center_id_personal_write', {
    ...params,
  })
}

// 个人中心_实名认证页_企业认证页
export const exp_center_id_company = (params) => {
  report_EXP_event('exp_center_id_company', {
    ...params,
  })
}

// 个人中心_实名认证页_企业认证页_点击上传营业执照
export const clk_center_id_company_upload_business_license_button = (params) => {
  report_CLK_event('clk_center_id_company_upload_business_license_button', {
    ...params,
  })
}

// 个人中心_实名认证页_企业认证页_上传营业执照回填
export const other_center_id_company_upload_business_license_write = (params) => {
  report_other_event('other_center_id_company_upload_business_license_write', {
    ...params,
  })
}

// 个人中心_实名认证页_企业认证页_点击上传身份证
export const clk_center_id_company_upload_identity_photo_button = (params) => {
  report_CLK_event('clk_center_id_company_upload_identity_photo_button', {
    ...params,
  })
}

// 个人中心_实名认证页_企业认证页_上传身份证回填
export const other_center_id_company_upload_identity_photo_write = (params) => {
  report_other_event('other_center_id_company_upload_identity_photo_write', {
    ...params,
  })
}

// 个人中心_实名认证页_企业认证页_提交按钮_点击
export const other_center_id_company_submit_button = (params) => {
  report_other_event('other_center_id_company_submit_button', {
    ...params,
  })
}

// 个人中心_实名认证页_消息落地页_曝光
export const exp_realname_check_message_landing_page = (params) => {
  report_EXP_event('exp_realname_check_message_landing_page', {
    ...params,
  })
}

// 个人中心_实名认证页_消息落地页_点击
export const clk_realname_check_message_landing_button = (params) => {
  report_CLK_event('clk_realname_check_message_landing_button', {
    ...params,
  })
}

// 个人中心_实名认证页_消息落地页_自定义事件
export const other_realname_check_message_landing_page = (params) => {
  report_other_event('other_realname_check_message_landing_page', {
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_删除按钮_点击
export const clk_id_personal_delete_button = (params) => {
  report_CLK_event('clk_id_personal_delete_button', {
    button_name: '删除',
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_删除实名弹窗_曝光
export const exp_id_personal_delete_popup = (params) => {
  report_EXP_event('exp_id_personal_delete_popup', {
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_删除实名弹窗_确定按钮_点击
export const clk_id_personal_delete_popup_sure_button = (params) => {
  report_CLK_event('clk_id_personal_delete_popup_sure_button', {
    button_name: '确定',
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_删除实名弹窗_确定_自定义事件
export const other_id_personal_delete_popup_sure = (params) => {
  report_other_event('other_id_personal_delete_popup_sure', {
    ...params,
  })
}

// 个人中心_实名认证页_企业认证页_更换实名信息按钮_点击
export const clk_id_company_change_information_button = (params) => {
  report_CLK_event('clk_id_company_change_information_button', {
    button_name: '更换实名信息',
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_更换实名信息按钮_点击
export const clk_id_personal_change_information_button = (params) => {
  report_CLK_event('clk_id_personal_change_information_button', {
    button_name: '更换实名信息',
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页_上传个人照片
export const other_id_personal_photo = (params) => {
  report_other_event('other_id_personal_photo', {
    ...params,
    source: reportSource.value,
  })
}

// 个人中心_实名认证页_企业认证页_上传企业照片
export const other_id_company_photo = (params) => {
  report_other_event('other_id_company_photo', {
    ...params,
    source: reportSource.value,
  })
}

export const other_id_company_launch = (params) => {
  report_other_event('other_id_company_launch', {
    ...params,
  })
}

// 实名认证-个人信息详情页曝光
export const page_edite_person_v1 = (params) => {
  report_EXP_event('page_edite_person_v1', {
    page_name: 'page_edite_person_v1',
    eventCode: 'page_edite_person_v1',
    ...params,
  })
}

// 个人中心_实名认证页_个人认证页
export const page_id_personal = (params) => {
  report_EXP_event('page_id_personal', {
    source: reportSource.value,
    ...params,
  })
}

// 个人中心_实名认证企业认证页
export const page_id_company = (params) => {
  report_EXP_event('page_id_company', {
    source: reportSource.value,
    page_name: 'page_id_company',
    eventCode: 'page_id_company',
    ...params,
  })
}

// 个人中心_实名认证页_认证成功页
export const page_id_id_success = (params) => {
  report_EXP_event('page_id_id_success', {
    source: reportSource.value,
    page_name: 'page_id_id_success',
    eventCode: 'page_id_id_success',
    ...params,
  })
}
