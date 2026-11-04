<template>
  <div class="component-library">
    <!-- 左侧导航 -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">N</span>
        <span class="logo-text">Netc Design</span>
      </div>
      <nav class="sidebar-nav">
        <div
          v-for="item in navList"
          :key="item.id"
          class="nav-item"
          :class="{ active: activeComponent === item.id }"
          @click="scrollTo(item.id)"
        >
          {{ item.label }}
        </div>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="content-header">
        <h1 class="page-title">组件库</h1>
        <p class="page-desc">Netc Design PC 组件库预览</p>
      </header>

      <div class="demo-wrapper">
        <!-- Button 按钮 -->
        <section id="button" class="demo-section">
          <h2 class="section-title">Button 按钮</h2>
          <p class="section-desc">常用的操作按钮。</p>
          <div class="section-block">
            <h3 class="block-title">基础用法</h3>
            <p class="block-desc">按钮的展示形式包括：主按钮、二级按钮、三级按钮，支持多种尺寸。</p>
            <div class="block-content">
              <ButtonDemo />
            </div>
          </div>
        </section>

        <!-- Input 输入框 -->
        <section id="input" class="demo-section">
          <h2 class="section-title">Input 输入框</h2>
          <p class="section-desc">通过鼠标或键盘输入内容，是最基础的表单域的包装。</p>
          <div class="section-block">
            <h3 class="block-title">基础用法</h3>
            <div class="block-content">
              <InputDemo />
            </div>
          </div>
        </section>

        <!-- Select 选择器 -->
        <section id="select" class="demo-section">
          <h2 class="section-title">Select 选择器</h2>
          <p class="section-desc">当选项过多时，使用下拉菜单展示并选择内容。</p>
          <div class="section-block">
            <h3 class="block-title">基础用法</h3>
            <div class="block-content">
              <SelectDemo />
            </div>
          </div>
        </section>

        <!-- Switch 开关 -->
        <section id="switch" class="demo-section">
          <h2 class="section-title">Switch 开关</h2>
          <p class="section-desc">用于控制某个功能的开启或关闭。</p>
          <div class="section-block">
            <h3 class="block-title">基础用法</h3>
            <div class="block-content">
              <SwitchDemo />
            </div>
          </div>
        </section>

        <!-- Radio 单选框 -->
        <section id="radio" class="demo-section">
          <h2 class="section-title">Radio 单选框</h2>
          <p class="section-desc">在一组相关选项中进行单选。</p>
          <div class="section-block">
            <h3 class="block-title">基础用法</h3>
            <div class="block-content">
              <RadioDemo />
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ButtonDemo from './components/ButtonDemo.vue'
import InputDemo from './components/InputDemo.vue'
import SelectDemo from './components/SelectDemo.vue'
import SwitchDemo from './components/SwitchDemo.vue'
import RadioDemo from './components/RadioDemo.vue'

const activeComponent = ref('button')

const navList = [
  { id: 'button', label: 'Button 按钮' },
  { id: 'input', label: 'Input 输入框' },
  { id: 'select', label: 'Select 选择器' },
  { id: 'switch', label: 'Switch 开关' },
  { id: 'radio', label: 'Radio 单选框' },
]

const scrollTo = (id: string) => {
  activeComponent.value = id
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped lang="scss">
// @import url('netc-design-pc/dist/style.css');

.component-library {
  display: flex;
  height: 100%;
  background: #f5f7fa;
}

.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  flex-shrink: 0;

  .sidebar-logo {
    display: flex;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e4e7ed;

    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      margin-right: 10px;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .sidebar-nav {
    padding: 10px 0;

    .nav-item {
      padding: 12px 20px;
      cursor: pointer;
      transition: all 0.3s;
      color: #606266;
      font-size: 14px;

      &:hover {
        background: #f5f7fa;
        color: #409eff;
      }

      &.active {
        background: #ecf5ff;
        color: #409eff;
        border-right: 3px solid #409eff;
      }
    }
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  .content-header {
    margin-bottom: 30px;
    padding: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: #fff;

    .page-title {
      font-size: 28px;
      margin: 0 0 10px 0;
      font-weight: 600;
    }

    .page-desc {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }
  }

  .demo-wrapper {
    .demo-section {
      background: #fff;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      .section-title {
        font-size: 22px;
        color: #303133;
        margin: 0 0 10px 0;
        font-weight: 600;
      }

      .section-desc {
        color: #909399;
        font-size: 14px;
        margin: 0 0 25px 0;
      }

      .section-block {
        margin-bottom: 25px;

        &:last-child {
          margin-bottom: 0;
        }

        .block-title {
          font-size: 16px;
          color: #303133;
          margin: 0 0 15px 0;
          font-weight: 500;
          padding-left: 12px;
          border-left: 3px solid #409eff;
        }

        .block-desc {
          color: #606266;
          font-size: 14px;
          margin: 0 0 15px 0;
        }

        .block-content {
          padding: 20px;
          background: #fafafa;
          border-radius: 6px;
          border: 1px solid #ebeef5;
        }
      }
    }
  }
}
</style>
