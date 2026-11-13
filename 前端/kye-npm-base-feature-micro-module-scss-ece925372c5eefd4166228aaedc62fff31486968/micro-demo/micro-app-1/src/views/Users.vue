<template>
  <div class="users-view">
    <table class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>用户名</th>
          <th>邮箱</th>
          <th>角色</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <span :class="['status', user.status]">{{
              user.status === 'active' ? '活跃' : '禁用'
            }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const users = ref([
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: '管理员',
    status: 'active',
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: '用户',
    status: 'active',
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    role: '用户',
    status: 'disabled',
  },
  {
    id: 4,
    name: '赵六',
    email: 'zhaoliu@example.com',
    role: '编辑',
    status: 'active',
  },
]);
</script>

<style scoped>
.users-view h3 {
  color: #333;
  font-size: 22px;
  margin-bottom: 12px;
}

.users-view p {
  color: #666;
  margin-bottom: 24px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-table th,
.user-table td {
  padding: 12px 16px;
  text-align: left;
}

.user-table th {
  background: #f5576c;
  color: white;
  font-weight: 600;
}

.user-table tr:nth-child(even) {
  background: #f8f9fa;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status.active {
  background: #d4edda;
  color: #155724;
}

.status.disabled {
  background: #f8d7da;
  color: #721c24;
}
</style>
