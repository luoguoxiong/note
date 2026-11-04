import { onBeforeUnmount, onMounted, h, ref, defineComponent } from 'vue'

const delayRender = (delayTime) => (Component) => {
  const DelayedComponent = defineComponent({
    props: Component.props,
    setup(props, { slots }) {
      const isRendered = ref(false)
      let timer: any = null

      // 组件挂载时启动定时器
      onMounted(() => {
        timer = setTimeout(() => {
          isRendered.value = true
          console.log(isRendered.value, 'isRenderedisRendered')
        }, delayTime * 10)
      })

      // 组件卸载时清除定时器
      onBeforeUnmount(() => {
        clearTimeout(timer)
      })

      return () => {
        return isRendered.value ? h(Component, props, { default: slots.default }) : null
      }
    },
  })
  return DelayedComponent
}

export default delayRender
