import { defineStore } from 'pinia'

export const useOrderStore = defineStore('orderPreload', {
  state: () => ({
    orderConfig: null,
  }),
  getters: {
    orderConfig: (state) => state.orderConfig,
  },
  actions: {
    updateOrderConfig(orderConfig: any) {
      this.$state.orderConfig = orderConfig
    },
  },
})
