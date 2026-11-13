import Home from '../views/Home.vue'
import Admin from '../views/admin.vue'
import SubAppError from '../views/SubAppError.vue'
import NativeIframe from '../views/NativeIframe.vue'
import NativeMicro from '../views/NativeMicro.vue'
import NativeStandalone from '../views/NativeStandalone.vue'
import SharedComponent from '../views/SharedComponent.vue'

export const routes = [
  {
    path: '/admin',
    component: Admin,
    name: 'admin',
    redirect: '/admin/home',
    children: [
      { path: '/admin/home', name: 'Home', component: Home },
      {
        path: '/sub-app-error',
        name: 'SubAppError',
        component: SubAppError,
        props: (route) => ({ app: route.query.app, from: route.query.from }),
      },
      {
        path: '/admin/nativeMicro',
        name: 'NativeMicro',
        component: NativeMicro,
      },
      {
        path: '/admin/nativeIframe',
        name: 'nativeIframe',
        component: NativeIframe,
      },
      {
        path: '/admin/nativeStandalone',
        name: 'nativeStandalone',
        component: NativeStandalone,
      },
      {
        path: '/admin/shared-component',
        name: 'sharedComponent',
        component: SharedComponent,
      },
    ],
  },
]
