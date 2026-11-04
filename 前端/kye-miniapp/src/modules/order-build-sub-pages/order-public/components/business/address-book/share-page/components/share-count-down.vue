<template>
  <div class="share-count-down-container">
    <div class="share-msg">
      <div class="left">
        <img class="img" src="https://ic-img.ky-express.com/netc/20260204_35054_!!1770187527121_220_220.png" />
      </div>
      <div class="right">
        <div class="name">你的好友：{{ waybillDelivery?.person }}</div>
        <div class="tips">有一个包裹要寄给你，请尽快填写地址！</div>
      </div>
    </div>
    <div class="share-count-down">
      <div class="rest">剩余时间</div>
      <span class="count">{{ hours }}</span>
      <span>:</span>
      <span class="count">{{ minutes }}</span>
      <span>:</span>
      <span class="count">{{ seconds }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCountdown } from '@/public/utils/useCountdown'
import { computed } from 'vue'
// import { Any } from '@/public/utils/types'
// import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

// 定义 props
const props = defineProps({
  // 距离结束的时间（毫秒）
  duration: {
    type: Number,
    required: true,
  },
  waybillDelivery: {
    type: Object,
  },
})

const timeNumber = computed(() => props.duration)

const { minutes, seconds, hours, isFinished } = useCountdown(timeNumber, {
  isAuto: true,
})

// 定义三个 ref 变量
// const hours = ref('00')
// const minutes = ref('00')
// const seconds = ref('00')
// const isCountdownEnded = ref(false)

// // 结束时间戳（毫秒）
// const endTime = ref(0)
// // 定时器 ID
// let timerId = null

// // 格式化时间（确保两位数）
// const formatTime = (num) => {
//   return Math.floor(num).toString().padStart(2, '0')
// }

// // 更新时间
// const updateTime = () => {
//   const now = Date.now()
//   const remaining = Math.max(endTime.value - now, 0)

//   if (remaining <= 0) {
//     // 倒计时结束
//     isCountdownEnded.value = true
//     hours.value = '00'
//     minutes.value = '00'
//     seconds.value = '00'
//     if (timerId) {
//       clearTimeout(timerId as Any)
//       timerId = null
//     }
//     return
//   }

//   // 计算时分秒
//   const totalSeconds = Math.floor(remaining)
//   hours.value = formatTime(totalSeconds / 3600)
//   minutes.value = formatTime((totalSeconds % 3600) / 60)
//   seconds.value = formatTime(totalSeconds % 60)

//   // 计算下一次更新时间
//   // 使用 setTimeout 确保每秒更新，并修正时间误差
//   const nextUpdate = remaining % 1000 || 1000
//   timerId = setTimeout(updateTime, nextUpdate) as Any
// }

// // 开始倒计时
// const startCountdown = () => {
//   endTime.value = Date.now() + props.duration
//   updateTime()
// }

// // 组件挂载时开始倒计时
// onMounted(() => {
//   if (props.duration > 0) {
//     startCountdown()
//   }
// })

// // 清理定时器
// onBeforeUnmount(() => {
//   if (timerId) {
//     clearTimeout(timerId)
//     timerId = null
//   }
// })

// // 监听 duration 变化重新开始倒计时
// watch(
//   () => props.duration,
//   (newDuration) => {
//     if (timerId) {
//       clearTimeout(timerId)
//       timerId = null
//     }

//     if (newDuration > 0) {
//       startCountdown()
//     } else {
//       hours.value = '00'
//       minutes.value = '00'
//       seconds.value = '00'
//     }
//   },
//   { immediate: false },
// )

// // 判断是否倒计时已结束
// const checkIfCountdownEnded = () => {
//   return isCountdownEnded.value || props.duration === 0
// }
defineExpose({
  isFinished,
})
</script>

<style lang="scss">
.share-count-down-container {
  width: 100%;
  height: 350px;
  box-sizing: border-box;
  padding: 48px 46px 62px 48px;
  background: url('https://ic-img.ky-express.com/netc/20260115_48096_!!1768476549240_750_350.webp') no-repeat;
  background-size: 100%;
  .share-msg {
    width: 100%;
    display: flex;
    .left {
      margin-right: 16px;
      width: 110px;
      height: 110px;
      img {
        width: 110px;
        height: 110px;
      }
    }
    .right {
      .name {
        font-size: 34px;
        color: #24262b;
        font-weight: 600;
      }
      .tips {
        color: #24262b;
        font-size: 28px;
        margin-top: 2px;
        margin-left: 14px;
      }
    }
  }
  .share-count-down {
    width: 100%;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: url('https://ic-img.ky-express.com/netc/20260115_48188_!!1768484169333_654_90.png') no-repeat;
    background-size: 100%;
    margin-top: 32px;
    font-size: 26px;
    color: #24262b;
    .rest {
      margin-right: 21px;
    }
    .h5-span {
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #24262b;
      font-weight: 600;
    }
    .count {
      width: 42px;
      height: 42px;
      background: #f2effe;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #5700f9;
      font-size: 26px;
      border-radius: 8px;
    }
  }
}
</style>
