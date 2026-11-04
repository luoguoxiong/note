import { AdvertismentConfig } from './type'

const config: AdvertismentConfig = {
  home: {
    pageCode: 'homePage_fs',
    appCode: 'KYE_FS',
    banner: {
      areaStyleCode: 'MP_BANNER_035',
      default: 'https://ic-img.ky-express.com/netc/20260330_69537_!!1774854125616_702_250.png',
    },
  },
  order: {
    pageCode: 'orderPage_fs',
    appCode: 'KYE_FS',
    banner: {
      areaStyleCode: 'MP_LAMP_014',
      default: 'https://ic-img.ky-express.com/netc/20251216_77510_!!1765888005891_750_330.png',
    },
    floatAdBanner: {
      areaStyleCode: 'MP_BANNER_042',
    },
  },
  mine: {
    pageCode: 'mine_fs',
    appCode: 'KYE_FS',
    floatAdBanner: {
      areaStyleCode: 'MP_BANNER_037',
    },
  },
}

export default config
