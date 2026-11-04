<template>
  <div class="button-demo">
    <div class="demo-row">
      <div class="demo-col">
        <h4>面性按钮</h4>
        <div class="button-group">
          <!-- 默认 -->
          <k-button @click="handleClick">默认按钮</k-button>

          <!-- 带图标 -->
          <k-button :icon="Search">使用icon属性</k-button>
          <k-button>
            <template #icon>
              <k-icon><Duplicate /></k-icon>
            </template>
            使用icon插槽
          </k-button>

          <!-- loading -->
          <k-button loading>默认按钮</k-button>

          <!-- disabled -->
          <k-button disabled>默认按钮</k-button>
        </div>
      </div>

      <div class="demo-col">
        <h4>紫色描边 + 紫色背景</h4>
        <div class="button-group">
          <k-button plain>默认按钮</k-button>

          <!-- 带图标 -->
          <k-button plain :icon="Search">默认按钮</k-button>

          <!-- loading -->
          <k-button plain loading>默认按钮</k-button>

          <!-- disabled -->
          <k-button plain disabled>默认按钮</k-button>
        </div>
      </div>

      <div class="demo-col">
        <h4>默认按钮（灰描边）</h4>
        <div class="button-group">
          <!-- 默认 -->
          <k-button type="default">默认按钮</k-button>

          <!-- 带图标 -->
          <k-button type="default" :icon="Search">默认按钮</k-button>

          <!-- loading -->
          <k-button type="default" loading>默认按钮</k-button>

          <!-- disabled -->
          <k-button type="default" disabled>默认按钮</k-button>
        </div>
      </div>
    </div>

    <div class="demo-row">
      <div class="demo-col">
        <h4>紫色描边 + 白色背景</h4>
        <div class="button-group">
          <!-- 默认 -->
          <k-button plain type="default">默认按钮</k-button>

          <!-- 带图标 -->
          <k-button plain type="default" :icon="Search">默认按钮</k-button>

          <!-- loading -->
          <k-button plain type="default" loading>默认按钮</k-button>

          <!-- disabled -->
          <k-button plain type="default" disabled>默认按钮</k-button>
        </div>
      </div>

      <div class="demo-col">
        <h4>文字按钮</h4>
        <div class="button-group">
          <!-- 默认 -->
          <k-button text>文字按钮</k-button>

          <!-- 带图标 -->
          <k-button text :icon="Search">文字按钮</k-button>

          <!-- loading -->
          <k-button text loading :icon="Search">文字按钮</k-button>

          <!-- disabled -->
          <k-button text disabled>文字按钮</k-button>

          <div>
            <k-button text :is-text-black="true">文字按钮(黑色)</k-button>
            <k-button text :icon="Search" :is-text-black="true">文字按钮(黑色)</k-button>
            <k-button text loading :icon="Search" :is-text-black="true">文字按钮(黑色)</k-button>
            <k-button text disabled :is-text-black="true">文字按钮(黑色)</k-button>
          </div>
        </div>
      </div>

      <div class="demo-col">
        <h4>链接按钮</h4>
        <div class="button-group">
          <!-- 默认 -->
          <k-button link>删除</k-button>

          <!-- 带图标 -->
          <k-button link :icon="Duplicate">删除</k-button>

          <!-- loading -->
          <k-button link loading :icon="Duplicate">删除中...</k-button>

          <!-- 纯图标 -->
          <k-button link :icon="Duplicate" />

          <!-- disabled -->
          <k-button link disabled :icon="Duplicate">删除</k-button>
        </div>
      </div>

      <div class="demo-col">
        <h4>尺寸</h4>
        <div class="button-group">
          <k-button size="large">large尺寸-40px</k-button>
          <k-button size="default">default尺寸-32px</k-button>
          <k-button size="medium">medium尺寸-28px</k-button>
          <k-button size="small">small尺寸-24px</k-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KButton, KIcon } from '@netc-design-pc/ui'
import { Duplicate, Search } from '@netc-design-pc/icons'

const handleClick = () => {
  console.log('click')
}
</script>

<style scoped lang="scss">
.button-demo {
  .demo-row {
    margin-bottom: 25px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .demo-col {
    margin-bottom: 20px;

    h4 {
      font-size: 14px;
      color: #606266;
      margin: 0 0 12px 0;
      font-weight: 500;
    }

    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }
  }
}
</style>
