<template>
  <div class="counter">
    <h2>Vuex 计数器 (子应用1)</h2>
    <div class="counter__display">
      <span class="counter__value">{{ count }}</span>
    </div>
    <div class="counter__actions">
      <button class="counter__btn" @click="decrement">-</button>
      <button class="counter__btn counter__btn--reset" @click="reset">
        重置
      </button>
      <button class="counter__btn" @click="increment">+</button>
    </div>
    <p class="counter__double">双倍值: {{ doubleCount }}</p>
    <button class="counter__btn counter__btn--async" @click="asyncIncrement">
      异步 +1 (500ms)
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { storeKey } from '../store';

const store = useStore(storeKey);

const count = computed(() => store.state.count);
const doubleCount = computed(() => store.getters.doubleCount);

const increment = () => store.commit('increment');
const decrement = () => store.commit('decrement');
const reset = () => store.commit('reset');
const asyncIncrement = () => store.dispatch('incrementAsync');
</script>

<style scoped>
.counter {
  max-width: 400px;
  margin: 40px auto;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.counter h2 {
  margin: 0 0 20px;
  color: #333;
  font-size: 20px;
}

.counter__display {
  margin-bottom: 24px;
}

.counter__value {
  font-size: 64px;
  font-weight: bold;
  color: #667eea;
  line-height: 1;
}

.counter__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
}

.counter__btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  background: #667eea;
  color: white;
  transition: background 0.2s;
}

.counter__btn:hover {
  background: #5a6fd6;
}

.counter__btn--reset {
  width: auto;
  padding: 0 20px;
  background: #e74c3c;
}

.counter__btn--reset:hover {
  background: #c0392b;
}

.counter__btn--async {
  width: auto;
  padding: 0 20px;
  background: #2ecc71;
}

.counter__btn--async:hover {
  background: #27ae60;
}

.counter__double {
  color: #666;
  font-size: 14px;
  margin: 0 0 16px;
}
</style>
