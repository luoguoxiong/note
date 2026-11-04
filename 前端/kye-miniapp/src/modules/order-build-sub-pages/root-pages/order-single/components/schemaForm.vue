<script lang="tsx">
import { PropType, computed, defineComponent, provide } from 'vue'
import { Schema } from '@order-public-sub-public/types'
import SchemaItem from './schemaItem.vue'
import { SchemaKey } from '../hooks/useContext'

export default defineComponent({
  name: 'SchemaForm',
  props: {
    schema: {
      type: Object as PropType<Schema>,
      required: true,
    },
  },
  setup(props) {
    const schemaRef = computed(() => props.schema)

    provide(SchemaKey, {
      schema: schemaRef,
      SchemaItem,
    })

    return () => {
      const {
        schema: { layout },
      } = props
      return layout?.length > 0 ? <SchemaItem layout={layout} /> : null
    }
  },
})
</script>
