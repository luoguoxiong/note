<template>
  <div>
    <BottomPopup
      v-model:show="show"
      :showFooter="operationType === OperationTypes.加入标签"
      @onClose="close"
      @onConfirm="confirm"
      footerText="确定"
    >
      <template #header>
        <div class="address-label-header">
          {{ operationType === OperationTypes.加入标签 ? '加入标签' : '管理标签' }}
          <span class="header-tips" v-if="operationType !== OperationTypes.加入标签">长按标签可拖动调整排序</span>
        </div>
      </template>
      <div class="e-label-c">
        <div
          item-key="id"
          v-bind="dragOptions"
          :disabled="operationType === OperationTypes.加入标签"
          v-for="(element, index) in _list"
          :class="{
            'draggable-dragging': element.itemType === 'dragging',
          }"
        >
          <div
            class="edit-label-item"
            :class="{ itemActive: selectLabelCode === element.labelCode }"
            @click.stop="doChoose(element.labelCode, element.labelName)"
          >
            <template v-if="operationType === OperationTypes.加入标签">
              <SvgIcon :name="'checked-round'" class="icon" v-if="selectLabelCode === element.labelCode" />
              <SvgIcon :name="'no-check-icon'" class="icon" v-else />
            </template>
            <span
              class="item-left"
              :class="{ disabled: ['20', '30'].includes(element.labelCode), dragHandle: true }"
              @touchstart.stop="startDrag(index, $event)"
              @touchmove="moveDrag($event)"
              @touchend="endDrag"
              @touchcancel="endDrag"
            >
              {{ element.labelName }}
            </span>
            <div class="item-right" v-if="operationType !== OperationTypes.加入标签">
              <SvgIcon
                :imgUrl="aIcon"
                class="tag-svg-box"
                @click.stop="edit(element)"
                v-if="!['20', '30'].includes(element.labelCode)"
              />
              <SvgIcon
                :imgUrl="bIcon"
                class="tag-svg-box"
                @click.stop="del(element.labelCode, element.labelName)"
                v-if="!['20', '30'].includes(element.labelCode)"
              />
              <SvgIcon
                :imgUrl="cIcon"
                class="adjust-icon dragHandle"
                @touchstart.stop="startDrag(index, $event)"
                @touchmove="moveDrag($event)"
                @touchend="endDrag"
                @touchcancel="endDrag"
              />
            </div>
          </div>
        </div>

        <div
          class="edit-label-item draggable-dragging clone-item"
          v-show="cloneItem.labelCode !== '10' && clonePosition.visible"
          :class="{ itemActive: selectLabelCode === cloneItem.labelCode }"
          :style="{
            top: clonePosition.top + 'px',
            left: clonePosition.left + 'px',
          }"
        >
          <template v-if="operationType === OperationTypes.加入标签">
            <SvgIcon :name="'checked-round'" class="icon" v-if="selectLabelCode === cloneItem.labelCode" />
            <SvgIcon :name="'no-check-icon'" class="icon" v-else />
          </template>
          <span class="item-left" :class="{ disabled: ['20', '30'].includes(cloneItem.labelCode), dragHandle: true }">
            {{ cloneItem.labelName }}
          </span>
          <div class="item-right" v-if="operationType !== OperationTypes.加入标签">
            <SvgIcon :imgUrl="aIcon" class="tag-svg-box" v-if="!['20', '30'].includes(cloneItem.labelCode)" />
            <SvgIcon :imgUrl="bIcon" class="tag-svg-box" v-if="!['20', '30'].includes(cloneItem.labelCode)" />
            <SvgIcon :imgUrl="cIcon" class="adjust-icon dragHandle" />
          </div>
        </div>

        <!-- 添加按钮 -->
        <div class="add-label-bottom-btn" @click.stop="add" :class="{ disabledbtn: listLengthComp.length - 1 >= 5 }">
          <span class="add-plus">+</span>
          添加 ({{ listLengthComp.length - 1 }}/5)
        </div>
      </div>
    </BottomPopup>
  </div>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { computed, ref, reactive, nextTick } from 'vue'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import { showKyDialog } from '@order-public-sub-public/validate/effect/effectDialog'
import { showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { AddressLabel } from '@order-public-sub-public/apis/address/types'
import { EAddressPermissionTab } from '../../types'
import { clk_express_book_address_tag_management_v1 } from '../../page/report/index'

const aIcon = 'https://ic-img.ky-express.com/netc/20251103_87767_!!1762138823462_48_48.svg+xml'
const bIcon = 'https://ic-img.ky-express.com/netc/20251103_98614_!!1762138814803_48_48.svg+xml'
const cIcon = 'https://ic-img.ky-express.com/netc/20251103_91857_!!1762139443705_48_48.svg+xml'

const props = defineProps({
  list: {
    type: Array<AddressLabel>,
    default: () => [],
  },
  recognitionType: {
    type: String,
    default: '',
  },
})

const listLengthComp = computed(() => {
  changeList()
  return props.list?.filter(
    (item) =>
      ![EAddressPermissionTab.共享地址, EAddressPermissionTab.我的地址].includes(
        item.labelCode as EAddressPermissionTab,
      ),
  )
})

const _list = ref(props.list)
enum OperationTypes {
  管理标签 = 10,
  加入标签 = 20,
}
const emit = defineEmits(['update', 'add', 'delete', 'addAddressToAddressLabel'])

const show = ref(false)

const operationType = ref<OperationTypes>(OperationTypes.管理标签)
const open = async (type?: OperationTypes) => {
  show.value = true
  if (type) {
    operationType.value = OperationTypes.加入标签
  } else {
    operationType.value = OperationTypes.管理标签
  }
  changeList()
  await nextTick()
  getAllElementsPosition()
}

const changeList = () => {
  if (operationType.value === OperationTypes.加入标签) {
    _list.value = props.list?.filter(
      (item) =>
        ![EAddressPermissionTab.共享地址, EAddressPermissionTab.我的地址, EAddressPermissionTab.全部地址].includes(
          item.labelCode as EAddressPermissionTab,
        ),
    )
  } else {
    _list.value = props.list?.filter(
      (item) => ![EAddressPermissionTab.全部地址].includes(item.labelCode as EAddressPermissionTab),
    )
  }
}

const close = () => {
  _list.value = []
  selectLabelCode.value = ''
  selectLabelName.value = ''
  show.value = false
  try {
    clk_express_book_address_tag_management_v1('关闭', props.recognitionType)
  } catch (error) {
    console.error(error)
  }
}

const dragOptions = ref({
  animation: 200,
  group: 'description',
  disabled: false,
  ghostClass: 'ghost',
  handle: '.dragHandle',
  dragClass: 'drag',
})

const del = async (labelCode: string, labelName: string) => {
  try {
    clk_express_book_address_tag_management_v1('删除', props.recognitionType)
  } catch (error) {
    console.error(error)
  }
  try {
    const res = await showKyDialog({
      title: '温馨提示',
      message: `删除标签后，对应的地址将不再标记为【${labelName}】，确定删除吗？`,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: '取消',
      confirmButtonText: '确定',
      zIndex: 1000,
    })
    if (res === true) {
      emit('delete', labelCode)
    }
  } catch (error) {
    console.log('取消删除')
  }
}

// 排序
const change = () => {
  emit('update', _list.value)
}

// 新增标签
const add = () => {
  try {
    clk_express_book_address_tag_management_v1('添加标签', props.recognitionType)
  } catch (error) {
    console.error(error)
  }
  if (listLengthComp.value.length - 1 >= 5) {
    showToast('最多可添加5个标签')
    return
  }
  emit('add')
}

// 管理标签
const edit = (val: AddressLabel) => {
  try {
    clk_express_book_address_tag_management_v1('编辑', props.recognitionType)
  } catch (error) {
    console.error(error)
  }
  emit('add', val)
}

// 如果是加入标签 则标记当前选中的labelCode
const selectLabelCode = ref('')
const selectLabelName = ref('')
// 选择操作
const doChoose = (labelCode: string, labelName: string) => {
  if (operationType.value !== OperationTypes.加入标签) return
  selectLabelCode.value = labelCode
  selectLabelName.value = labelName
}

// 加入标签接口
const confirm = () => {
  if (!selectLabelCode.value) {
    showToast('请选择地址标签')
    return
  }
  emit('addAddressToAddressLabel', selectLabelCode.value, selectLabelName.value)
}

// 拖拽简单实现 --------------------
// 拖拽开始的index
const dragIndex = ref(-1)
// 开始的Y距离
let startY = 0
let startX = 0
// 偏移量
let touchOffsetX = 0
let touchOffsetY = 0
// 当前移动的Y
let currentX = 0
let currentY = 0
let itemDistance = 0
// 存储位置信息
const positionInfo = reactive({
  parent: { left: 0, top: 0, width: 0, height: 0 },
  children: [],
})

// 复制出来的数据
const cloneItem = ref({} as AddressLabel)
const clonePosition = reactive({
  visible: false,
  top: 0,
  left: 0,
})

// 获取所有元素位置信息
const getAllElementsPosition = async () => {
  return new Promise((resolve) => {
    // 获取父容器位置
    const query = Taro.createSelectorQuery()
    query.select('.e-label-c').boundingClientRect()
    query.selectAll('.edit-label-item').boundingClientRect()
    query.exec((res) => {
      if (res[0] && res[1]) {
        positionInfo.parent = {
          left: res[0].left,
          top: res[0].top,
          width: res[0].width,
          height: res[0].height,
        }

        positionInfo.children = res[1].map((rect, index) => ({
          index,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }))
        itemDistance = (positionInfo.children[0].height || 0) * (4 / 3)
        resolve(true)
      }
    })
  })
}

const setItemType = (index?, type?) => {
  _list.value = _list.value.map((item, i) => {
    if (i === index) {
      item.itemType = type || ''
    } else {
      item.itemType = ''
    }
    return item
  })
}

/**
 * 开始点击
 * @param index
 * @param event
 */
const startDrag = async (index, event) => {
  if (operationType.value === OperationTypes.加入标签) return
  await nextTick()
  dragIndex.value = index
  const touch = event.touches[0]
  startY = touch.clientY
  startX = touch.clientX
  currentY = startY

  // 点击到的子元素位置信息
  const childPos = positionInfo.children[index]
  clonePosition.left = childPos.left - positionInfo.parent.left
  clonePosition.top = childPos.top - positionInfo.parent.top

  // 计算偏移量
  touchOffsetX = startX - childPos.left
  touchOffsetY = startY - childPos.top
  clonePosition.visible = true

  cloneItem.value = {
    ..._list.value[index],
  }
  setTimeout(() => {
    setItemType(index, 'dragging')
  }, 200)
}

/**
 *
 * @param index 开始移动
 * @param event
 */
const moveDrag = (event) => {
  if (dragIndex.value === -1) return
  if (operationType.value === OperationTypes.加入标签) return

  const touch = event.touches[0]
  currentX = touch.clientX
  currentY = touch.clientY
  // const deltaY = currentY - startY
  // 设置复制元素的位置
  clonePosition.top = currentY - touchOffsetY - positionInfo.parent.top
  clonePosition.left = currentX - touchOffsetX - positionInfo.parent.left
  // 计算移动的项数
  // const moveSteps = Math.round(deltaY / 96)
  // let newIndex = dragIndex.value + moveSteps

  // // 限制索引范围
  // newIndex = Math.max(0, Math.min(newIndex, _list.value.length - 1))

  // 如果位置发生变化，更新数据
  // if (newIndex !== dragIndex.value) {
  //   const newList = [..._list.value]
  //   const [draggedItem] = newList.splice(dragIndex.value, 1)
  //   newList.splice(newIndex, 0, draggedItem)
  //   _list.value = newList
  //   dragIndex.value = newIndex
  //   startY = currentY
  //   nextTick(() => {
  //     getAllElementsPosition()
  //   })
  // }
}
const endDrag = () => {
  if (operationType.value === OperationTypes.加入标签) return
  if (cloneItem.value) {
    const deltaY = currentY - startY
    let moveSteps = 0
    if (deltaY > 0) {
      moveSteps = Math.floor(deltaY / itemDistance)
    } else {
      moveSteps = Math.round(deltaY / itemDistance)
    }

    let newIndex = dragIndex.value + moveSteps
    // 限制索引范围
    newIndex = Math.max(0, Math.min(newIndex, _list.value.length - 1))
    // 如果位置发生变化，更新数据
    if (newIndex !== dragIndex.value) {
      const newList = [..._list.value]
      const [draggedItem] = newList.splice(dragIndex.value, 1)
      newList.splice(newIndex, 0, draggedItem)
      _list.value = newList
      change()
    }
  }
  dragIndex.value = -1
  clonePosition.left = 0
  clonePosition.top = 0
  touchOffsetX = 0
  touchOffsetY = 0
  cloneItem.value = {} as AddressLabel
  clonePosition.visible = false
  getAllElementsPosition()
  setTimeout(() => {
    setItemType()
  }, 200)
}

// 拖拽简单实现 --------------------
defineExpose({
  open,
  close,
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
