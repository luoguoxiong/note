<script lang="tsx">
import { PropType, defineComponent, toRaw } from 'vue'
import { SchemaLayout } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants/global'
import { useSchemaContext } from '../hooks/useContext'
import { findModule, getModuleVisible } from '../utils'
import { EXCLUDE_MODULES } from '@order-public-sub-public/configs/modules'

const Container = defineComponent({
  name: 'Container',
  props: {
    layout: {
      type: Array as PropType<SchemaLayout[]>,
      required: true,
    },
    type: {
      type: String as PropType<ModuleType.Block | ModuleType.Row>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const { layout: rLayout, type } = props
      const context = useSchemaContext()
      const { SchemaItem } = context
      const { module: allModule } = context.schema?.value

      const layout = toRaw(rLayout)
      const className = {
        [ModuleType.Block]: 'block',
        [ModuleType.Row]: 'row',
      }

      if (type === ModuleType.Row) {
        // let shouldRender = true
        // 遍历row，下面所有模块没有visible为true时不渲染
        const shouldRender = layout.every((item) => {
          const { moduleId } = item
          if (!moduleId) return false
          const moduleItem = findModule(allModule, moduleId)
          if (!moduleItem) return false
          const moduleVisible = getModuleVisible(moduleItem)
          if (!moduleVisible && !EXCLUDE_MODULES.includes(moduleId)) {
            console.log('不渲染当前模块', moduleId)
            // shouldRender = false
            return false
          }
          return true
        })
        if (!shouldRender) {
          console.warn(`当前row下没有visible为true的模块，不渲染`, layout)
          return null
        }
      }

      return (
        <div class={className[type]}>
          {layout.map((item, index) => {
            const itemLayout = [item]
            return <SchemaItem key={index} layout={itemLayout} />
          })}
        </div>
      )
    }
  },
})

export default Container
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
