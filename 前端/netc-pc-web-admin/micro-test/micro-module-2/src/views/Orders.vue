<template>
  <div class="orders-view">
    <div class="order-list">
      <div class="order-item" v-for="order in orders" :key="order.id">
        <div class="order-header">
          <span class="order-id">订单号: {{ order.id }}</span>
          <span :class="['order-status', order.status]">{{
            order.status === 'pending' ? '待处理' : order.status === 'shipped' ? '已发货' : '已完成'
          }}</span>
        </div>
        <div class="order-details">
          <p>商品: {{ order.items.join(', ') }}</p>
          <p>金额: ¥{{ order.amount }}</p>
          <p>时间: {{ order.time }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const orders = ref([
  {
    id: 'ORD-001',
    items: ['无线耳机', '蓝牙音箱'],
    amount: 498,
    status: 'completed',
    time: '2024-01-15 10:30',
  },
  {
    id: 'ORD-002',
    items: ['智能手表'],
    amount: 899,
    status: 'shipped',
    time: '2024-01-15 11:45',
  },
  {
    id: 'ORD-003',
    items: ['平板电脑', '机械键盘'],
    amount: 3398,
    status: 'pending',
    time: '2024-01-15 14:20',
  },
  {
    id: 'ORD-004',
    items: ['电竞鼠标'],
    amount: 159,
    status: 'pending',
    time: '2024-01-15 15:00',
  },
])
</script>

<style scoped>
.orders-view h3 {
  color: #333;
  font-size: 22px;
  margin-bottom: 12px;
}

.orders-view p {
  color: #666;
  margin-bottom: 24px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-id {
  font-weight: 600;
  color: #333;
}

.order-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.order-status.pending {
  background: #fff3cd;
  color: #856404;
}

.order-status.shipped {
  background: #cce5ff;
  color: #004085;
}

.order-status.completed {
  background: #d4edda;
  color: #155724;
}

.order-details p {
  color: #666;
  font-size: 14px;
  margin: 4px 0;
}
</style>
