import { AdvertismentConfig } from './type'

const config: AdvertismentConfig = {
  home: {
    pageCode: 'homePage_zfb',
    appCode: 'KYE_ZFB',
    banner: {
      areaStyleCode: 'MP_BANNER_016',
      default: 'https://ic-img.ky-express.com/netc/20260330_69537_!!1774854125616_702_250.png',
    },
  },
  order: {
    pageCode: 'orderPage_zfb',
    appCode: 'KYE_ZFB',
    banner: {
      areaStyleCode: 'MP_BANNER_021',
      default: 'https://ic-img.ky-express.com/netc/20251216_77510_!!1765888005891_750_330.png',
    },
    floatAdBanner: {
      areaStyleCode: 'MP_BANNER_040',
    },
  },
  mine: {
    pageCode: 'mine',
    appCode: 'KYE_ZFB',
    floatAdBanner: {
      areaStyleCode: 'MP_BANNER_019',
    },
  },
}

export default config
