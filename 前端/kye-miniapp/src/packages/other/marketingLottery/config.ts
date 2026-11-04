// 系统模板1
export const DEFAULT_MODEL_0 = 0
// 系统模板2
export const DEFAULT_MODEL_1 = 1
// 系统模板 type
export const DEFAULT_MODEL_TYPE = 0
// 自定义模板 type
export const AUTO_MODEL_TYPE = 1

// 系统模板
export const MODEL_IMG_OP = {
    initBg: {
        backgroundColor: '#4d46fa',
        backgroundImg: 'https://erphostjs.kye-erp.com/crm/crm-marketing/img03.png',
    },
    initBgNew: {
        backgroundColor: '#4d46fa',
        backgroundImg: 'https://erphostjs.kye-erp.com/crm/crm-marketing/img04.png',
    },
    lotteryBg: {
        backgroundColor: '#4d46fa',
        backgroundImg: 'https://ic-img.ky-express.com/netc/20230408_47959016110_!!1680938682778_750_1624.jpeg?imageMogr2/format/webp',
    },
    lotteryBgNew: {
        backgroundColor: '#4d46fa',
        backgroundImg: 'https://ic-img.ky-express.com/default/20230315_52959032953_!!1678883737113_750_1624.png',
    },
    endBg: {
        backgroundColor: '#4d46fa',
        backgroundImg: 'https://ic-h5.kye-erp.com/intro/miniprogram/marketing-lottery/end-bg.png',
    },
    endBgNew: {
        backgroundColor: '#4d46fa',
        backgroundImg: 'https://ic-img.ky-express.com/default/20230315_32959032925_!!1678883737096_750_1624.png',
    }
}
export const NOT_MATCH_BG = 'https://erphostjs.kye-erp.com/crm/crm-marketing/not-match.png'

// 是否是自定义模板
export const isAutoModel = (activityInfo?: any) => {
    const { luckyActivityTemplate } = activityInfo || {}
    const { templateType } = luckyActivityTemplate || {}
    return templateType && templateType === 1
}


