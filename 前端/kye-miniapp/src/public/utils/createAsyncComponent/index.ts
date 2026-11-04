import { defineAsyncComponent } from 'vue'
import { sleep } from '../tools'

export const createAsyncComp = (loader: any, delay = 0) =>
  defineAsyncComponent(async () => {
    await sleep(delay)
    const comp = await loader()
    return comp.default
  })
