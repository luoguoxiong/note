<template>
  <div class="products-view">
    <div class="product-grid">
      <div class="product-card" v-for="product in products" :key="product.id">
        <div class="product-image">
          <span>{{ product.name.charAt(0) }}</span>
        </div>
        <div class="product-info">
          <h4>{{ product.name }}</h4>
          <p class="price">¥{{ product.price }}</p>
          <p class="stock">库存: {{ product.stock }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'

const products = ref([
  { id: 1, name: '无线耳机', price: 299, stock: 150 },
  { id: 2, name: '智能手表', price: 899, stock: 80 },
  { id: 3, name: '蓝牙音箱', price: 199, stock: 200 },
  { id: 4, name: '平板电脑', price: 2999, stock: 50 },
  { id: 5, name: '机械键盘', price: 399, stock: 120 },
  { id: 6, name: '电竞鼠标', price: 159, stock: 180 },
])
</script>

<style scoped>
.products-view h3 {
  color: #333;
  font-size: 22px;
  margin-bottom: 12px;
}

.products-view p {
  color: #666;
  margin-bottom: 24px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-image {
  height: 120px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 48px;
  font-weight: bold;
}

.product-info {
  padding: 16px;
}

.product-info h4 {
  color: #333;
  font-size: 16px;
  margin-bottom: 8px;
}

.price {
  color: #4facfe;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stock {
  color: #666;
  font-size: 12px;
}
</style>
