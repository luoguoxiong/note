import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getCornerResult, reportUserClickEvent } from '@/apis/corner'
import type { CornerItem } from '@/apis/corner/types'

/**
 * 菜单角标 store
 *
 * 生命周期说明（与 lightapp 菜单列表解耦）：
 * - 不做 localStorage 缓存：角标时效性强，每次进入基座拉一次即可
 * - 接口静默失败时角标为空，不影响菜单渲染
 * - 点击菜单后乐观移除本地角标，上报失败不回滚（下次刷新以服务端为准）
 */
export const useCornerStore = defineStore('corner', () => {
  const corners = ref<CornerItem[]>([])
  const fetched = ref(false)

  /** menuId -> CornerItem[] 映射，供菜单渲染直接消费 */
  const cornerMap = computed(() => {
    const map = new Map<string, CornerItem[]>()
    corners.value.forEach((corner) => {
      ;(corner.menuIdList || []).forEach((id) => {
        const key = String(id)
        map.set(key, [...(map.get(key) || []), corner])
      })
    })
    return map
  })

  /** menuId 类型新老项目 number/string 混用，统一 String() 归一匹配 */
  const getCornersByMenuId = (menuId: string | number) => cornerMap.value.get(String(menuId)) || []

  /** 拉取角标列表（幂等可重入，供子应用联动重复调用） */
  async function fetchCorners() {
    try {
      const { data } = await getCornerResult()
      corners.value = data || []
      fetched.value = true
    } catch (e) {
      console.warn('获取菜单角标失败', e)
    }
  }

  /** 点击菜单时上报并本地消除该菜单上的角标 */
  async function clickCorner(menuId: string | number) {
    const corner = getCornersByMenuId(menuId)[0]
    if (corner) await dismissCorner(corner)
  }

  /** 按角标实例消除（气泡关闭等场景，避免 menuId 反查歧义） */
  async function dismissCorner(corner: CornerItem) {
    corners.value = corners.value.filter((c) => c.cornerId !== corner.cornerId)
    try {
      await reportUserClickEvent({ cornerId: corner.cornerId })
    } catch {
      // 上报失败不回滚 UI，下次进入页面以服务端为准
    }
  }

  return { corners, fetched, fetchCorners, getCornersByMenuId, clickCorner, dismissCorner }
})
