import { http } from '@order-public-sub-public/utils/request'

import { NotepadItemConfig, AddResConfig } from '@order-public-sub-public/apis/notepad/type'
/**
 * @description 获取记事本列表
 * @param params
 * @returns
 */
export const notepadList = () => {
  return http<NotepadItemConfig[]>('web.order.configOrder.notepadSearch')
}

export const addNotepad = (params: { bizType: string; content: string }) => {
  return http<AddResConfig[]>('web.order.configOrder.notepadSave', params)
}

export const deleteNotepad = (params: { bizType: string; id: number }) => {
  return http<object>('web.order.configOrder.notepadDelete', params)
}

export const updateNotepad = (params: { bizType: string; id: number; content: string }) => {
  return http<object>('web.order.configOrder.notepadUpdate', params)
}
