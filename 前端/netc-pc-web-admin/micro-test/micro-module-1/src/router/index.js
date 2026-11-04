export const routes = [
  {
    path: '/admin/user/home',
    name: 'SubApp1Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '子应用1首页',
    },
  },
  {
    path: '/admin/user/manager',
    name: 'SubApp1Users',
    component: () => import('../views/Users.vue'),
    meta: {
      title: '用户管理',
    },
  },
  {
    path: '/admin/user/setting',
    name: 'SubApp1Settings',
    component: () => import('../views/Settings.vue'),
    meta: {
      title: '系统设置',
    },
  },
  {
    path: '/admin/user/sandbox-test',
    name: 'SubApp1SandboxTest',
    component: () => import('../views/SandboxTest.vue'),
    meta: {
      title: '沙箱测试',
    },
  },
  {
    path: '/admin/user/vuex-counter',
    name: 'SubApp1VuexCounter',
    component: () => import('../views/VuexCounter.vue'),
    meta: {
      title: 'Vuex 计数器',
    },
  },
];

export default routes;
