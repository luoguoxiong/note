<template>
  <div class="wrap">
    <div class="scroll-wrap" ref="wrap" :onscroll="updatePosition">
      <div style="height: 300px; width: 100%"></div>
      <div style="height: 20px">
        <div style="height: 120px"></div>
        <div ref="el2" class="el2">Element 2</div>
      </div>
      <div style="height: 300px; width: 100%"></div>
    </div>
    <div ref="el1" class="el1">Element 1</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const el1 = ref(null)
const el2 = ref(null)
const wrap = ref(null)

const updatePosition = () => {
  if (!el1.value || !el2.value) return
  const { top } = wrap.value.getBoundingClientRect()
  const { top: top2 } = el2.value.getBoundingClientRect()
  const newTop = top2 - top
  el1.value.style.top = newTop + 'px'
}

onMounted(() => {
  updatePosition()
})
</script>

<style scoped>
.wrap {
  position: relative;
  height: 300px;
  width: 100px;
  background: green;
}
.scroll-wrap {
  width: 100px;
  height: 100%;
  overflow-y: auto;
}
.el2 {
  width: 100px;
  height: 100px;
  background-color: lightgreen;
}

.el1 {
  width: 100px;
  height: 100px;
  background-color: lightblue;
  position: absolute;
  left: 100%;
}
</style>
