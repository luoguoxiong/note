import { defineAsyncComponent } from 'vue'
import AdvertiseBanner from './banner/index.vue'
import AdvertiseNotice from './notice/index.vue'
import AdvertiseNoticeNew from './notic-new/index.vue'
import AdvertiseFloatPanel from './float-panel/index.vue'
import { useFetchAdvertisDetail } from './hooks/useFetchAdvertisDetail'
import Splash from './splash/index.vue'
import { splashManager } from './splash/SplashManager'

const AdvertisePopup = defineAsyncComponent(() => import('./popup/index.vue'))

export {
  AdvertiseBanner,
  AdvertiseNotice,
  AdvertiseNoticeNew,
  AdvertisePopup,
  AdvertiseFloatPanel,
  useFetchAdvertisDetail,
  Splash,
  splashManager,
}
