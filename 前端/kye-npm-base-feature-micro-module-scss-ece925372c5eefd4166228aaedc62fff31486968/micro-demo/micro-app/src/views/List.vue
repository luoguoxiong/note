<template>
  <div class="list-view">
    <div class="card">
      <h2>列表页</h2>
      <p>子应用内部数据,运行在 MicroApp 沙箱内,与主应用状态隔离。</p>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>状态</th>
            <th>更新时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>
              <span
                class="tag"
                :class="item.status === 'active' ? 'tag--active' : 'tag--idle'"
              >
                {{ item.status }}
              </span>
            </td>
            <td>{{ item.updatedAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const items = ref([
  {
    id: 1,
    name: 'microApp 任务 A',
    status: 'active',
    updatedAt: '2026-07-01 09:12',
  },
  {
    id: 2,
    name: 'microApp 任务 B',
    status: 'idle',
    updatedAt: '2026-07-01 10:05',
  },
  {
    id: 3,
    name: 'microApp 任务 C',
    status: 'active',
    updatedAt: '2026-07-01 11:28',
  },
  {
    id: 4,
    name: 'microApp 任务 D',
    status: 'idle',
    updatedAt: '2026-07-01 13:40',
  },
]);
</script>

<style scoped>
.list-view {
  display: flex;
  justify-content: center;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 760px;
  width: 100%;
}

.card h2 {
  color: #333;
  font-size: 22px;
  margin-bottom: 8px;
}

.card p {
  color: #666;
  font-size: 14px;
  margin-bottom: 18px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 9px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #444;
}

.data-table th {
  background: #fafafa;
  color: #333;
  font-weight: 600;
}

.tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  color: white;
}

.tag--active {
  background: #e6a23c;
}

.tag--idle {
  background: #c0c4cc;
}
</style>
