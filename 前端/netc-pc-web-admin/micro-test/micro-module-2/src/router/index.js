import Dashboard from '../views/Dashboard.vue';
import Products from '../views/Products.vue';
import Orders from '../views/Orders.vue';

export const storeKey = Symbol('store');

export const routes = [
  {
    path: '/admin/order/dashboard',
    name: 'SubApp2Dashboard',
    component: Dashboard,
    meta: { title: '数据仪表盘' },
  },
  {
    path: '/admin/order/products',
    name: 'SubApp2Products',
    component: Products,
    meta: { title: '商品管理' },
  },
  {
    path: '/admin/order/manager',
    name: 'SubApp2Orders',
    component: Orders,
    meta: { title: '订单管理' },
  },
  {
    path: '/admin/order/vuex-counter',
    name: 'SubApp2VuexCounter',
    component: () => import('../views/VuexCounter.vue'),
    meta: { title: 'Vuex 计数器' },
  },
];
