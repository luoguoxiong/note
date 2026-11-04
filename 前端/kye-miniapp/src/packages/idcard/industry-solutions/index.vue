<template>
  <view class="idcard-industry-solutions-page">
    <!-- 有数据 -->
    <view v-if="hasListDataLen" class="list-warp">
      <view class="list-item__title">
        <text class="list-item__title-text">内容设置</text>
        <text class="list-item__title-sub-text">按下拖动按钮调整顺序</text>
      </view>
      <view class="list-item__content">
        <view v-for="(item, index) in list" :key="item.contentId" class="list-item__content-item">
          <!-- 左边内容 -->
          <view class="left-content">
            <view class="list-item__content-item__left">
              <view class="pre-line"></view>
              <text class="title-text">{{ item.title }}</text>
            </view>
            <ky-switch
              class="left-switch"
              inactive-color="#ebedf5"
              active-color="#8365F6"
              :model-value="item.showSwitch"
              @change="() => handleToggle(item)"
            ></ky-switch>
            <text v-if="!item.showSwitch" class="noshow-text">不展示</text>
          </view>

          <!-- 右边内容 -->
          <view class="right-content">
            <text
              class="`movetext light-text upmove"
              :class="{ 'move-disabled': index === 0 }"
              @tap="() => handleMoveToggle(item, index, MoveType.Up)"
            >
              上移
            </text>
            <text
              class="movetext light-text bottommove"
              :class="{ 'move-disabled': index === list.length - 1 }"
              @tap="() => handleMoveToggle(item, index, MoveType.Bottom)"
            >
              下移
            </text>
          </view>
        </view>
      </view>

      <view class="list-submit-btn">
        <button class="submit-btn" @click="handleSubmit">保存</button>
      </view>
    </view>

    <!-- 没有数据 -->
    <view v-else class="no-data">
      <image
        class="no-data_img"
        src="https://ic-img.ky-express.com/netc/20250208_9256630117_!!1738996884768_608_608.png"
      />
      <text class="no-data_text">暂无数据</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { editIdcardContent } from '@/packages/idcard/api/index'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { trackEvent, reportPagePv } from './industry-solutions-report'
import type { contentEditAPIRquest } from '@/packages/idcard/api/types/index'

const router = useRouter()
const { businessCardId, menuId, employeeId } = router.params

enum MoveType {
  Up = 'up',
  Bottom = 'bottom',
}

const list = ref<contentEditAPIRquest.EditIdcardContentRequestContent[]>([])

const hasListDataLen = computed(() => {
  return list.value && list.value.length > 0
})

const handleToggle = (item) => {
  try {
    const clkCode = `clk_scheme_editor_edit_${!item.showSwitch ? 'open' : 'close'}`
    trackEvent(clkCode, item.title, {
      employee_id: employeeId,
      sales_id: employeeId,
    })

    // 计算当前 list 中 showSwitch 为 true 的项
    const activeItems = list.value.filter((listItem) => listItem.showSwitch)

    // 如果点击的是唯一一个 showSwitch 为 true 的项，并且它是最后一个 true 的项，则不允许其变为 false
    if (activeItems.length === 1 && item.showSwitch === true) {
      Taro.showToast({
        icon: 'none',
        title: '最少要有一个解决方案哦',
      })
      return // 如果唯一的 true 项被点击且本身是 true，就不执行任何操作
    }

    let tempList = list.value.map((listItem) => {
      if (listItem.contentId === item.contentId) {
        return {
          ...listItem,
          showSwitch: !listItem.showSwitch,
        }
      } else {
        return {
          ...listItem,
        }
      }
    })
    list.value = tempList
  } catch (error) {
    console.log('开关错误防御', error)
  }
}

const handleMoveToggle = (item, index: number, type: MoveType) => {
  try {
    const clkCode = `clk_scheme_editor_edit_${type === MoveType.Up ? 'upward' : 'move_down'}_plan`
    trackEvent(clkCode, item.title, {
      employee_id: employeeId,
      sales_id: employeeId,
    })

    // 边界判断：第一个元素不能上移，最后一个元素不能下移
    if (type === MoveType.Up && index === 0) return
    if (type === MoveType.Bottom && index === list.value.length - 1) return

    // 根据操作类型计算目标索引
    const targetIndex = type === MoveType.Up ? index - 1 : index + 1

    // 复制列表数据（深拷贝每个对象），避免直接修改 state
    const newList = list.value.map((listItem) => ({ ...listItem }))

    // 交换当前项和目标项的位置，使用临时变量
    const temp = newList[index]
    newList[index] = newList[targetIndex]
    newList[targetIndex] = temp

    // 根据新顺序更新每个元素的 sort 属性（从 0 开始）
    const updatedList = newList.map((newListItem, idx) => ({
      ...newListItem,
      sort: idx,
    }))

    // 更新状态，触发组件重新渲染
    list.value = updatedList
  } catch (error) {
    console.log('移动函数错误: ', error)
  }
}

const handleSubmit = async () => {
  trackEvent('clk_scheme_ditor_edit_submit', '保存', {
    employee_id: employeeId,
    sales_id: employeeId,
  })
  try {
    let params = {
      businessCardId: businessCardId,
      contentList: [...list.value],
      menuId: menuId,
    }
    await editIdcardContent(params as contentEditAPIRquest.EditIdcardContentRequest)
    Taro.showToast({
      title: '保存成功',
      icon: 'none',
    })
    Taro.disableAlertBeforeUnload()
    setTimeout(() => {
      Taro.navigateBack()
    }, 1000)
  } catch (error) {
    console.log('error')
  }
}

// 初始化
const init = async () => {
  reportPagePv({
    employee_id: employeeId,
    sales_id: employeeId,
  })
  let data = Taro.getStorageSync('idcard-func')
  list.value = JSON.parse(data) || []
}

// 使用 onMounted 只在组件挂载时调用一次 init
onMounted(() => {
  try {
    init()
    Taro.enableAlertBeforeUnload({
      message: '内容未保存，是否退出?',
      success(res) {
        console.log('success:', res)
      },
      fail(res) {
        console.log('fail:', res)
      },
      complete(res) {
        console.log('complete:', res)
      },
    })
  } catch (error) {
    console.log('行业解决方案错误报错:', error)
  }
})
</script>

<style lang="scss">
@import './index.scss';
</style>
