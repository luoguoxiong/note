<template>
  <div
    class="notepad-item"
    :class="`item-${index}`"
    @touchstart="handleTouch($event, true)"
    @touchend="handleTouch($event, false)"
    @touchcancel="handleTouch($event, false)"
  >
    <div class="notepad-item__content">
      <div class="notepad-item__content-front" ref="textcontent" :class="`text-content-${info.id}`" @click="onSelect">
        {{ info.content }}
      </div>
      <!-- <div class="notepad-item__content-back">
        {{ info.content }}
        <div class="notepad-item__operate" v-if="isShowExpand">
          <span :class="`notepad-item__operate-more ${isExpand ? 'expand' : ''}`" @click.stop="onExpand">
            {{ isExpand ? '收起' : '展开' }}
            <SvgIcon class="required more-expand" name="expand"></SvgIcon>
          </span>
        </div>
      </div> -->
    </div>
    <div class="notepad-item__foot">
      <span class="notepad-item__foot-btn" @click.stop="onDel">
        <SvgIcon class="required" name="delete"></SvgIcon>
        <span>删除</span>
      </span>
      <span class="notepad-item__foot-btn" @click.stop="onEdit">
        <SvgIcon class="required" name="icon-edit"></SvgIcon>
        <span>编辑</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
// import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { showDialog } from '@ky-miniui-lib/ky-miniui-lib'
import { deleteNotepad } from '@order-public-sub-public/apis/notepad/index'
import { NotepadItemConfig } from '@order-public-sub-public/apis/notepad/type'
interface NotepadProps {
  info: NotepadItemConfig
  index: number
}
const textcontent = ref<Element>()
const props = withDefaults(defineProps<NotepadProps>(), {
  info: () => {
    return {
      id: 1,
      bizType: '10',
      content: ``,
      updationDate: '2023-08-17',
    }
  },
  index: 0,
})
const emits = defineEmits<{
  (event: 'edit', data: NotepadItemConfig): void
  (event: 'select', data: NotepadItemConfig): void
  (event: 'reload'): void
}>()

const isShowExpand = ref(false)

const isExpand = ref(false)

const onExpand = () => {
  isExpand.value = !isExpand.value
}

const onDel = () => {
  showDialog({
    parentClassName: 'ka-customer-map-notepad', // 就近的根节点class
    title: '温馨提示',
    confirmButtonText: '确定',
    message: '确定要删除该模板吗？',
    showCancelButton: true,
  })
    .then(() => {
      delNotepadItem()
    })
    .catch((err) => {
      console.log(err)
    })
}

const delNotepadItem = async () => {
  if (props.info.id) {
    const params = {
      bizType: '10',
      id: props.info.id,
    }
    let res = await deleteNotepad(params)
    if (res) {
      showToast('删除成功')
      emits('reload')
    }
  }
}

const onEdit = (e: Event) => {
  e?.stopPropagation()
  emits('edit', props.info)
}
const onSelect = (e: Event) => {
  e?.stopPropagation()
  emits('select', props.info)
}

/**
 * 触摸当前元素添加样式
 * @param event 触摸回调参数
 * @param isTouch true 触摸开始 false 触摸结束
 */
const handleTouch = (event: MouseEvent | TouchEvent, isTouch: boolean) => {
  const eventTargetDom = event.target as HTMLElement
  const currentElement = document.querySelectorAll('.notepad-item')?.[props.index] as HTMLElement | null
  if (!isTouch) {
    return currentElement && (currentElement.style.background = '#fff')
  }

  if (eventTargetDom.localName !== 'span' && eventTargetDom.localName !== 'use') {
    currentElement && (currentElement.style.background = 'rgb(79 9 217 / 6%)')
  }
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
