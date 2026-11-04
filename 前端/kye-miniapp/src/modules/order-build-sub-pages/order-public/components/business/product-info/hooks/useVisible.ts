import { ref } from 'vue'

export const popupVisible = ref(false)

export const usePopupVisible = () => {
  const setPopupVisible = (value: boolean) => {
    popupVisible.value = value
  }

  return { popupVisible, setPopupVisible }
}
