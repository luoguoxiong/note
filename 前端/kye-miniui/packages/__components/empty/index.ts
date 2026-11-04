import { App } from 'vue'

const Empty: any = {
  name: 'ky-empty',
  install: (app: App): void => {
    import('./src/empty.vue').then((mod) => {
      const comp = mod.default
      comp.name = 'ky-empty'
      app.component('ky-empty', comp)
    })
  },
}

export default Empty
