/**
 * @Desc: type
 * @Date: 2025/12/18
 */
import type { Ref } from 'vue'

export type ChildrenContext<Child, Extra extends Record<string, any> = {}> = {
  linkChildren: (child: Child) => void
  unlinkChildren: (child: Child) => void
  children: Ref<Child[]>
} & Extra
