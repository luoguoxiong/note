<template>
  <view ref="targetRef" :class="['ky-popover-container', custClass]" :id="`target-${refRandomId}`">
    <slot name="reference"></slot>
    <view
      ref="contentRef"
      :id="`content-${refRandomId}`"
      :class="[
        'ky-popover-content',
        `ky-popover-thenme-${theme}`,
        isShow ? 'popover-enter-active' : '',
        isLeave ? 'popover-leave-active' : '',
        custClass
      ]"
      :style="contentStle"
    >
      <view
        :class="`ky-popover-arrow ky-popover-arrow-${computedLocation}`"
        v-if="showArrow"
        :style="getArrowOffset"
      ></view>
      <view class="ky-popover-box">
        <slot name="content"></slot>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { onMounted, ref, CSSProperties, watch, computed } from "vue";
import {
  PopoverTheme,
  PopoverProps,
  PopoverRootPosition,
  PopoverDirection,
  PopoverLocation,
} from "./types";
import Taro from "@tarojs/taro";
import { useTaroRect } from "./index";
import "./index.scss";

export type PopoverScreen = {
  height: number;
  width: number;
};

const props = withDefaults(defineProps<PopoverProps>(), {
  show: false,
  theme: "light",
  offset: [0, 10],
  arrowOffset: 30,
  showArrow: true,
  custClass: ''
});

const refRandomId = Math.random().toString(36).slice(-8);

const contentStle = ref({});

const targetRef = ref<HTMLElement | null>(null);

const contentRef = ref<HTMLElement | null>(null);

const screenRef = ref<PopoverScreen | null>(null);

const isShow = ref(false);

const isLeave = ref(false);

const targetRect = ref<PopoverRootPosition | null>(null);

const contentRect = ref<PopoverRootPosition | null>(null);

const computedLocation = ref<PopoverLocation>();

let timer: number = 0;

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
}>();

const setContentLocation = async () => {
  await Promise.all([getTargeRect(), getContentWh(), getScreen()]);
  contentStle.value = getRootPosition();
  isShow.value = true;
};

// 监听show，展示则计算位置，设置容器位置
watch(
  () => props.show,
  async () => {
    clearTimeout(timer);
    if (props.show) {
      isLeave.value = false;
      setContentLocation();
    } else {
      isShow.value = false;
      isLeave.value = true;
      timer = setTimeout(() => {
        contentStle.value = {
          visibility: "hidden",
        };
      }, 150);
    }
  }
);

onMounted(() => {
  Taro.nextTick(async () => {
    if (props.show) {
      setContentLocation();
    }
  });
});

const getTargeRect = async () => {
  targetRect.value = await useTaroRect(targetRef, Taro);
};

const getContentWh = async () => {
  const rect = await useTaroRect(contentRef, Taro);
  contentRect.value = rect;
};

const getScreen = () => {
  return new Promise((resolve) => {
    const query = Taro.createSelectorQuery();
    query.selectViewport().boundingClientRect();
    query.exec((res) => {
      screenRef.value = res[0];
      resolve(res[0]);
    });
  });
};

const getNoOverFlowsDirction = (
  overflows: Record<PopoverDirection, boolean>,
  directions: PopoverDirection[],
  fallbackDirection: PopoverDirection
) => {
  if (!overflows[fallbackDirection]) return fallbackDirection;
  for (const dir of directions) {
    if (!overflows[dir]) {
      return dir;
    }
  }
  return fallbackDirection;
};

// 动态调整位置的边界检查函数
const adjustLocation = (
  direction: PopoverDirection,
  targetRect: PopoverRootPosition,
  popoverRect: PopoverRootPosition,
  screen: PopoverScreen
) => {
  // 判断是否超出屏幕边界
  const overflows: Record<PopoverDirection, boolean> = {
    // 顶部是否溢出：目标元素距离顶部距离 - 气泡高度 < 0 则溢出
    top: targetRect.top - popoverRect.height < 0,
    // 底部是否溢出：目标元素底部距离窗口距离 + 气泡高度 > 屏幕高度，则溢出
    bottom: targetRect.bottom + popoverRect.height > screen.height,
    //  左侧是否溢出：目标元素距离左边距离 - 气泡宽度 < 0 则溢出
    left: targetRect.left - popoverRect.width < 0,
    //  右侧是否溢出： 目标元素右边距离窗口左侧距离 + 气泡宽度 > 屏幕宽度，则溢出
    right: targetRect.right + popoverRect.width > screen.width,
  };

  const directionMap: Record<PopoverDirection, PopoverDirection[]> = {
    top: ["bottom", "left", "right"],
    bottom: ["top", "left", "right"],
    left: ["right", "top", "bottom"],
    right: ["left", "top", "bottom"],
  };

  return getNoOverFlowsDirction(overflows, directionMap[direction], direction);
};

const getRootPosition = () => {
  const styles: CSSProperties = {};

  // 如果 targetRect 或 contentRect 未准备好，隐藏内容
  if (!targetRect.value || !contentRect.value || !screenRef.value) {
    styles.visibility = "hidden";
    return styles;
  }

  // 获取 target 和 content 的尺寸
  const contentWidth = contentRect.value.width || 0;
  const contentHeight = contentRect.value.height || 0;
  const { width = 0, height = 0 } = targetRect.value;

  // 相对位置初始化
  styles.position = "absolute";

  const { location, offset } = props;
  let direction = location.split("-")[0] as PopoverDirection;
  const skew = location.split("-")[1] || "";

  direction = adjustLocation(
    direction,
    targetRect.value,
    contentRect.value,
    screenRef.value
  );

  computedLocation.value = [direction, ...(skew ? [skew] : [])].join(
    "-"
  ) as PopoverLocation;

  let crossOffset = 0; // 垂直或水平方向的偏移量

  let parallelOffset = 0; // 平行方向的偏移量

  // 解构偏移量
  if (Array.isArray(offset) && offset.length === 2) {
    crossOffset = Number(offset[1]) || 0;
    parallelOffset = Number(offset[0]) || 0;
  }

  // 根据方向设置位置
  if (["bottom", "top"].includes(direction)) {
    // 垂直方向计算
    const verticalPosition =
      direction === "bottom" ? height + crossOffset : -(contentHeight + crossOffset);
    styles.top = `${verticalPosition}px`;

    // 水平方向计算
    if (!skew) {
      styles.left = `${(width - contentWidth) / 2 + parallelOffset}px`;
    } else if (skew === "start") {
      styles.left = `${parallelOffset}px`;
    } else if (skew === "end") {
      styles.left = `${width - contentWidth + parallelOffset}px`;
    }
  }

  if (["left", "right"].includes(direction)) {
    // 水平方向计算
    const horizontalPosition =
      direction === "left" ? -(contentWidth + crossOffset) : width + crossOffset;
    styles.left = `${horizontalPosition}px`;

    // 垂直方向计算
    if (!skew) {
      styles.top = `${(height - contentHeight) / 2 + parallelOffset}px`;
    } else if (skew === "start") {
      styles.top = `${parallelOffset}px`;
    } else if (skew === "end") {
      styles.top = `${height - contentHeight + parallelOffset}px`;
    }
  }

  // 确保内容可见
  styles.visibility = "visible";
  return styles;
};

// 设置箭头偏移量
const getArrowOffset = computed(() => {
  if (!props.showArrow) return;
  const location = computedLocation.value;
  if (location === "top-start" || location === "bottom-start") {
    return {
      left: props.arrowOffset + "rpx",
    };
  }
  if (location === "top-end" || location === "bottom-end") {
    return {
      right: props.arrowOffset + "rpx",
    };
  }
  if (location === "left-start" || location === "right-start") {
    return {
      top: props.arrowOffset + "rpx",
    };
  }
  if (location === "left-end" || location === "right-end") {
    return {
      bottom: props.arrowOffset + "rpx",
    };
  }
  return {};
});
</script>
