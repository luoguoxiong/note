import { ref } from 'vue'

export const orderWarehouseIn = ref(false)

export const orderWarehouseOut = ref(false)

export const useOrderWarehouseIn = () => {
  const setOrderWarehouseIn = (value: boolean) => {
    orderWarehouseIn.value = value
  }

  return { orderWarehouseIn, setOrderWarehouseIn }
}

export const useOrderWarehouseOut = () => {
  const setOrderWarehouseOut = (value: boolean) => {
    orderWarehouseOut.value = value
  }

  return { orderWarehouseOut, setOrderWarehouseOut }
}
