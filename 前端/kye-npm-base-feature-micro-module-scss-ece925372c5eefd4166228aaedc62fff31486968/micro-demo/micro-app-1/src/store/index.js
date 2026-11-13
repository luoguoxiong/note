import { createStore } from 'vuex';

export const storeKey = Symbol('store');

export default createStore({
  state: {
    count: 1,
  },
  mutations: {
    increment(state) {
      state.count++;
    },
    decrement(state) {
      state.count--;
    },
    reset(state) {
      state.count = 0;
    },
  },
  actions: {
    incrementAsync({ commit }) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('increment');
          resolve();
        }, 500);
      });
    },
  },
  getters: {
    doubleCount: (state) => state.count * 2,
  },
});
