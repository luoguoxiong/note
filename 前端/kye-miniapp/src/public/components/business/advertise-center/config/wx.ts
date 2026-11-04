import { AdvertismentConfig } from './type'

const config: AdvertismentConfig = {
  home: {
    pageCode: 'homePage',
    appCode: 'KYE_KYSY',
    banner: {
      areaStyleCode: 'MP_BANNER_002',
      default: 'https://ic-img.ky-express.com/netc/20260330_69537_!!1774854125616_702_250.png',
    },
  },
  order: {
    pageCode: 'orderPage',
    appCode: 'KYE_KYSY',
    banner: {
      areaStyleCode: 'MP_BANNER_001',
      default: 'https://ic-img.ky-express.com/netc/20251216_77510_!!1765888005891_750_330.png',
    },
    floatAdBanner: {
      areaStyleCode: 'MP_BANNER_039',
    },
  },
  mine: {
    pageCode: 'minePage',
    appCode: 'KYE_KYSY',
    floatAdBanner: {
      areaStyleCode: 'MP_BANNER_027',
    },
  },
}

export default config
