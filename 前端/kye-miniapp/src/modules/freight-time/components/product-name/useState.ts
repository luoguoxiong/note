import { ref } from 'vue'

export const goodsType = ref('')

export const setGoodsType = (value: string) => {
  goodsType.value = value
}

export const linkContentVisible = ref(false)

export const setLinkContentVisible = (value: boolean) => {
  linkContentVisible.value = value
}
