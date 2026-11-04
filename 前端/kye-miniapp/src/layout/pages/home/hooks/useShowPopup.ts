import { computed, toRefs } from 'vue'
import { useHomeStore } from '../store'

export const useShowPopup = () => {
  const homeStore = useHomeStore()

  const { data } = toRefs(homeStore)

  const hotlinePopupInfo = computed(() => data.value.hotlinePopupInfo)

  const showHotline = computed(() => hotlinePopupInfo.value.showHotline)

  const showLuckPopup = computed(() => data.value.luckyPopup.show)

  const showBirthdayPopup = computed(() => data.value.birthdayPopupInfo.isNeedPopUp)

  const showCoupon = computed(() => data.value.couponPopup.show)

  return {
    showHotline,
    showLuckPopup,
    showBirthdayPopup,
    showCoupon,
  }
}
