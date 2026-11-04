// 定义 promisify 函数的返回值类型
function promisify<T>(request: IDBRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// 定义 DBFactory 类的类型
class DBFactory<T> {
  private dbPromise: Promise<IDBDatabase>
  private storeName: string

  constructor(dbName: string, storeName: string) {
    // 打开数据库
    this.storeName = storeName
    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(dbName)
      // 数据库升级时创建对象存储
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result
        console.log('db11111111', db)
        try {
          if (!db.objectStoreNames?.contains(storeName)) {
            db.createObjectStore(storeName)
          }
        } catch (e) {
          console.error(e)
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => {
        console.log('err:', request.error)
        reject(request.error)
      }
    })
  }

  // 获取 objectStore 的方法
  private async getStore(
    operationMode: 'readonly' | 'readwrite',
    storeName: string = this.storeName
  ): Promise<IDBObjectStore> {
    const db = await this.dbPromise
    return db.transaction(storeName, operationMode).objectStore(storeName)
  }

  // 设置一个 item，value 类型由泛型 T 推断
  async setItem<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    const store = await this.getStore('readwrite')
    return promisify(store.put(value, key as IDBValidKey))
  }

  // 获取一个 item，返回值类型由泛型 T 推断
  async getItem<K extends keyof T>(key: K): Promise<T[K] | undefined> {
    const store = await this.getStore('readonly')
    return promisify<T[K]>(store.get(key as IDBValidKey))
  }

  // 删除一个 item
  async removeItem<K extends keyof T>(key: K): Promise<void> {
    const store = await this.getStore('readwrite')
    return promisify(store.delete(key as IDBValidKey))
  }

  // 清除所有数据
  async clear(): Promise<void> {
    const store = await this.getStore('readwrite')
    return promisify(store.clear())
  }
}

export default DBFactory
