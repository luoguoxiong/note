<template>
  <div v-if="visible && floatList.length" class="float-advertisement" v-drag>
    <div class="float-advertisement__list">
      <img
        v-for="item in floatList"
        :key="item.advertisementCode"
        class="float-advertisement__item"
        :src="item.advertisementFloatDto.posterLink"
        alt=""
        draggable="false"
        @click="onItemClick(item)"
      />
    </div>
    <div v-if="allowClose" class="float-advertisement__close" @click="onClose">
      <i class="iconfont icon-window-close"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { advertisementConfirmByUser } from '@/apis/home'
import type { AdvertisementFloatDto } from '@/apis/home/types'
import { useAdvertisementJump, useHomeStore } from '@/hooks'

interface FloatItem {
  advertisementCode: string
  pushToStyle?: number
  advertisementFloatDto: AdvertisementFloatDto
}

const { jumpByAdvertisement } = useAdvertisementJump()
const { floatAdData } = useHomeStore()

const visible = ref(true)
/** 是否展示关闭按钮（组件内部状态） */
const allowClose = ref(true)
/** 拖拽后不触发点击 */
const moved = ref(false)

// 是否展示由是否有 floatAdData 决定；关闭后本会话内隐藏
const floatList = computed<FloatItem[]>(() => floatAdData.value || [])

const onItemClick = (item: FloatItem) => {
  if (moved.value) return
  const dto = item.advertisementFloatDto
  if (!dto) return
  void jumpByAdvertisement(dto, { pushToStyle: item.pushToStyle })
}

const onClose = () => {
  visible.value = false
  const advertisementCodeList = floatList.value.map((i) => i.advertisementCode)
  advertisementConfirmByUser({
    advertisementCodeList,
    channelSource: 'pc',
    eventType: 2,
  }).catch(() => undefined)
}

/** 上下拖拽（仅纵向），参考 side-navigation 的 vDrag */
const vDrag = {
  mounted: (el: HTMLElement) => {
    el.onmousedown = (e: MouseEvent) => {
      moved.value = false
      const disY = e.clientY - el.getBoundingClientRect().top
      const startY = e.clientY
      e.preventDefault()
      document.onmousemove = (ev: MouseEvent) => {
        if (Math.abs(ev.clientY - startY) > 3) moved.value = true
        let top = ev.clientY - disY
        const maxTop = document.body.clientHeight - el.clientHeight - 60
        if (top < 60) top = 60
        if (top > maxTop) top = maxTop
        el.style.top = top + 'px'
        el.style.bottom = 'unset'
      }
      document.onmouseup = () => {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.float-advertisement {
  position: fixed;
  right: 8px;
  bottom: 96px;
  z-index: 99;
  cursor: move;
  user-select: none;

  .float-advertisement__list {
    display: flex;
    flex-direction: column;
    align-items: center;

    .float-advertisement__item {
      width: 56px;
      height: 56px;
      cursor: pointer;
      display: block;

      & + .float-advertisement__item {
        margin-top: 8px;
      }
    }
  }

  .float-advertisement__close {
    width: 18px;
    height: 18px;
    margin: 8px auto 0;
    background: #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    .iconfont {
      font-size: 10px;
      color: #666666;
    }
  }
}
</style>
