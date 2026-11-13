<template>
  <div class="settings-view">
    <form class="settings-form">
      <div class="form-group">
        <label>应用名称</label>
        <input type="text" v-model="settings.appName" />
      </div>
      <div class="form-group">
        <label>主题颜色</label>
        <select v-model="settings.theme">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </div>
      <div class="form-group">
        <label>语言</label>
        <select v-model="settings.language">
          <option value="zh-CN">中文</option>
          <option value="en-US">英文</option>
        </select>
      </div>
      <div class="form-group">
        <label>通知开关</label>
        <input type="checkbox" v-model="settings.notifications" />
      </div>
      <button type="button" class="save-btn" @click="saveSettings">
        保存设置
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const settings = ref({
  appName: '子应用1',
  theme: 'light',
  language: 'zh-CN',
  notifications: true,
});

const saveSettings = () => {
  alert('设置已保存！');
};
</script>

<style scoped>
.settings-view h3 {
  color: #333;
  font-size: 22px;
  margin-bottom: 12px;
}

.settings-view p {
  color: #666;
  margin-bottom: 24px;
}

.settings-form {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input[type='text'],
.form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input[type='text']:focus,
.form-group select:focus {
  outline: none;
  border-color: #f5576c;
}

.form-group input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.save-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.save-btn:hover {
  transform: translateY(-2px);
}
</style>
