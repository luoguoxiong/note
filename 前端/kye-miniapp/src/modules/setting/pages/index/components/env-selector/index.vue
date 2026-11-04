<template>
  <ky-popup :show="show" position="bottom" round @update:show="emit('update:show', $event)">
    <view class="env-popup">
      <view class="env-title">{{ title }}</view>

      <scroll-view :scroll-y="true" class="env-list">
        <view
          v-for="env in envList"
          :key="env.envId || 'default'"
          class="env-item"
          :class="{
            active: modelValue === env.envId,
            'env-item-default': !env.envId,
          }"
          @click="selectEnv(env)"
        >
          <view class="env-name">
            <text v-if="env.envId" class="env-id">{{ env.envId }}</text>
            <text v-if="env.envId" class="env-sep"> - </text>
            <text>{{ env.envName }}</text>
          </view>

          <view v-if="modelValue === env.envId" class="env-check"> ✓ </view>
        </view>
      </scroll-view>
    </view>
  </ky-popup>
</template>

<script setup lang="ts">
interface EnvItem {
  envId: string
  envName: string
}

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    default: '',
  },
  envList: {
    type: Array as () => EnvItem[],
    default: () => [],
  },
  title: {
    type: String,
    default: '选择环境',
  },
})

const emit = defineEmits(['update:modelValue', 'update:show', 'change'])

const selectEnv = (env: EnvItem) => {
  emit('update:modelValue', env.envId)
  emit('change', env)
  emit('update:show', false)
}
</script>

<style lang="scss">
.env-popup {
  padding: 24px 20px 40px;
}

.env-title {
  font-size: 32px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 24px;
}

.env-list {
  height: 500px; /* scroll-view 必须固定高度 */
}

.env-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 24px 20px;
  margin-bottom: 16px;

  border-radius: 16px;
  background: #f7f8fa;

  transition: all 0.2s;
}

.env-item.active {
  background: #e8f3ff;
  border: 2px solid #3b82f6;
}

.env-name {
  font-size: 28px;
}

.env-check {
  font-size: 30px;
  color: #3b82f6;
}
.env-item-default {
  background: #fff7e6;
  border: 2px dashed #faad14;
}

.env-item-default .env-name {
  font-weight: 600;
  color: #d48806;
}
.env-id {
  font-size: 22px;
  padding: 4px 10px;
  border-radius: 8px;
  background: #e8f3ff;
  color: #1677ff;
  font-weight: 600;
}

.env-sep {
  margin: 0 6px;
}
</style>
