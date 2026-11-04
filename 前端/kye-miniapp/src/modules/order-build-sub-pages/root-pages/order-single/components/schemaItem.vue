<script lang="tsx">
import { defineComponent, inject } from 'vue'
import { ItemPropsDefine } from '@order-public-sub-public/types'
import { renderComponent } from './index'
import { OrderPageType } from '@order-public-sub-public/constants'

// 中转站
const SchemaItem = defineComponent({
  name: 'SchemaItem',
  props: ItemPropsDefine,
  setup(props) {
    const orderPageType = inject('orderPageType') as OrderPageType
    return () => {
      if (props.layout.length === 0) return null
      return props.layout.map((layout) => renderComponent(layout, orderPageType))
    }
  },
})

export default SchemaItem
</script>
