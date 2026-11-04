import { ComputedRef, inject } from 'vue'
import { CommonFieldType, Schema } from '@order-public-sub-public/types'

export const SchemaKey = Symbol('schema')

export type RegisterMap = Record<string, JSX.Element>
export type SchemaContext = {
  schema: ComputedRef<Schema>
  SchemaItem: CommonFieldType
  handleExistComponent: (key: string) => void
}

export function useSchemaContext() {
  // provide schema
  const context: SchemaContext | undefined = inject(SchemaKey) || {}

  if (!context) {
    throw Error('SchemaForm needed')
  }

  return context
}
