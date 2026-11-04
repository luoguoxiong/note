<template>
  <div id="greeting-module">
    <div ref="container" :class="['greeting-card', { narrow: isNarrow }]">
      <div class="greeting-left">
        <div class="date-row">
          <span class="date-text">{{ currentDate }}</span>
          <span class="date-divider">|</span>
          <span class="week-text">{{ currentWeek }}</span>
        </div>
        <div class="greeting-row">
          <span class="greeting-title">
            <KTooltip v-if="fullName" :content="fullName" :disabled="!isNameTruncated" placement="top-start">
              <span class="user-name">
                <span class="user-name-text">{{ displayName }}</span
                ><span class="narrow-comma" v-if="showComma">，</span>
              </span>
            </KTooltip>
            <span class="greeting-suffix"><span class="wide-comma" v-if="showComma">，</span>{{ greetingText }}</span>
          </span>
        </div>
        <div class="desc-row">
          <span>{{ greetingDesc }}</span>
        </div>
      </div>
      <div class="greeting-right">
        <Mascot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { KTooltip } from '@netc-design-pc/ui'
import { useHomeStore } from '@/hooks'
import { useNarrowContainer } from '../hooks/useNarrowContainer'
import Mascot from './mascot/index.vue'

const { greetingData } = useHomeStore()

// 兜底默认描述文案
const DEFAULT_GREETING_DESC = '小越越时刻在线，为您护航。'
const MAX_GREETING_DESC_LENGTH = 64

const container = ref<HTMLElement>()
const isNarrow = useNarrowContainer(container)

// 问候描述文案：优先使用后端接口配置（Store），兜底使用默认文案
const greetingDesc = computed(() => {
  const desc = greetingData.value?.content || DEFAULT_GREETING_DESC
  return Array.from(desc).slice(0, MAX_GREETING_DESC_LENGTH).join('')
})

// 完整用户名：用于 el-tooltip 悬停气泡展示
const fullName = computed(() => (greetingData.value?.userName || '').trim())
const nameChars = computed(() => Array.from(fullName.value))
const isNameTruncated = computed(() => nameChars.value.length > 7)

// 展示名称：最多7个字符，超出省略，避免截断生僻字。
const displayName = computed(() => nameChars.value.slice(0, 7).join('') + (isNameTruncated.value ? '...' : ''))

// 姓名为空或已显示省略号时，不显示逗号。
const showComma = computed(() => Boolean(fullName.value) && !isNameTruncated.value)

// 当前日期
const currentDate = computed(() => dayjs().format('YYYY-MM-DD'))

// 当前星期
const weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const currentWeek = computed(() => weekMap[dayjs().day()])

/**
 * 问候语时段规则：
 * 上午：06:00 — 11:59 → 上午好
 * 中午：12:00 — 13:59 → 中午好
 * 下午：14:00 — 17:59 → 下午好
 * 晚上：18:00 — 次日05:59 → 晚上好
 */
const getGreetingByHour = (hour: number): string => {
  if (hour >= 6 && hour < 12) return '上午好'
  if (hour >= 12 && hour < 14) return '中午好'
  if (hour >= 14 && hour < 18) return '下午好'
  return '晚上好'
}

const greetingText = computed(() => getGreetingByHour(dayjs().hour()))
</script>

<style scoped lang="scss">
#greeting-module {
  // margin-bottom: 16px;
  border-radius: 8px;
  overflow: visible;
  background: #ffffff;
}

.greeting-card {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px;
  min-height: 158px;
  overflow: visible;
  box-sizing: border-box;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 8px;

  .greeting-left {
    position: relative;
    z-index: 1;
    flex: none;
    width: calc(100% - 134px);
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .date-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 13px;
    color: var(---CG-Grey-08, rgba(104, 107, 117, 1));
    white-space: nowrap;

    .date-text {
      letter-spacing: 0.2px;
    }

    .date-divider {
      margin: 0 8px;
      color: #d6d9e0;
    }

    .week-text {
      color: #686b75;
    }
  }

  .greeting-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 12px;
    line-height: 1.35;

    .greeting-title {
      display: flex;
      max-width: 100%;
      min-width: 0;
      align-items: baseline;
      font-size: 24px;
      font-weight: 600;
      color: var(---CG-Grey-09, rgba(36, 38, 43, 1));
      line-height: 34px;

      span {
        font-weight: inherit;
      }
    }

    .user-name {
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .greeting-suffix {
      flex-shrink: 0;
      // margin-left: 2px;
    }

    .narrow-comma {
      display: none;
    }
  }

  .desc-row {
    font-size: 13px;
    line-height: 1.6;
    color: var(---CG-Grey-09, rgba(36, 38, 43, 1));
    word-break: break-word;
  }

  .greeting-right {
    position: absolute;
    top: -20px;
    right: -3px;
    display: flex;
    width: 158px;
    height: 158px;
    align-items: center;
    justify-content: center;
  }
}

// 小宽度响应式：按模块实际宽度换行，保持现有字体样式不变
.greeting-card.narrow {
  // min-height: 232px;
  align-items: flex-start;

  // .greeting-right {
  //   top: 14px;
  // }

  .greeting-left {
    width: calc(100% - 112px);
  }

  .greeting-row {
    display: block;

    .greeting-title {
      display: block;
    }

    .greeting-suffix {
      display: block;
      margin-left: 0;
    }

    .user-name {
      display: flex;
      max-width: 100%;

      .user-name-text {
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .narrow-comma {
      display: inline;
    }

    .wide-comma {
      display: none;
    }
  }
}
</style>
