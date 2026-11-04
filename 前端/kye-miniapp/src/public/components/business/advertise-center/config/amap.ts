import { AdvertismentConfig } from './type'

const config: AdvertismentConfig = {
  home: {
    pageCode: 'new_homePage_gd',
    appCode: 'KYE_GD',
    banner: {
      areaStyleCode: 'MP_BANNER_023',
      default: 'https://ic-img.ky-express.com/netc/20260330_69537_!!1774854125616_702_250.png',
    },
  },
  order: {
    pageCode: 'orderPage_gd',
    appCode: 'KYE_GD',
    banner: {
      areaStyleCode: 'MP_BANNER_024',
      default: 'https://ic-img.ky-express.com/netc/20251216_77510_!!1765888005891_750_330.png',
    },
    floatAdBanner: {
      areaStyleCode: 'MP_BANNER_041',
    },
  },
  mine: {
    pageCode: 'mine_gd',
    appCode: 'KYE_GD',
    floatAdBanner: {
      areaStyleCode: 'MP_BANNER_025',
    },
  },
}

export default config
