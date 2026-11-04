import Home from '../views/Home.vue';
import About from '../views/About.vue';
import List from '../views/List.vue';

// 子应用使用 hash 路由,路由为绝对路径
//  - 独立模式:http://localhost:8004#/、#/about、#/list
//  - 集成模式:MicroApp 虚拟路由隔离子应用 hash,主应用 URL 形如 ?app4=/about#/micro-app-4(默认 search 模式)
export const routes = [
  {
    path: '/',
    name: 'MicroApp4Home',
    component: Home,
    meta: { title: 'MicroApp 首页' },
  },
  {
    path: '/about',
    name: 'MicroApp4About',
    component: About,
    meta: { title: '关于' },
  },
  {
    path: '/list',
    name: 'MicroApp4List',
    component: List,
    meta: { title: '列表' },
  },
];

export default routes;
