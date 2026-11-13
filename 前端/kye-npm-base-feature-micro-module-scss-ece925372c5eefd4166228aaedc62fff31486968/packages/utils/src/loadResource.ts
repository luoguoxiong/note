interface LoadedResources {
  [url: string]: boolean
}

interface LoadedTasks {
  [url: string]: Promise<any>
}

interface Resource {
  type: 'js' | 'css'
  url: string
}

export class ResourceLoader {
  private static loadedResources: LoadedResources = {}

  private static tasks: LoadedTasks = {}

  public static async load(resources: Resource[]): Promise<boolean[]> {
    const promises = resources.map((resource) => {
      const { type, url } = resource

      if (url in ResourceLoader.tasks) {
        return ResourceLoader.tasks[url]
      }

      ResourceLoader.tasks[url] = new Promise((resolve, reject) => {
        if (ResourceLoader.loadedResources[url]) {
          resolve(true)
          return
        }

        if (type === 'js') {
          const script = document.createElement('script')
          script.type = 'text/javascript'
          script.src = url

          script.onload = () => {
            ResourceLoader.loadedResources[url] = true
            resolve(true)
          }

          script.onerror = () => {
            reject(new Error(`Load script error: ${url}`))
          }

          document.getElementsByTagName('head')[0].appendChild(script)
        } else if (type === 'css') {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.type = 'text/css'
          link.href = url

          link.onload = () => {
            ResourceLoader.loadedResources[url] = true
            resolve(true)
          }

          link.onerror = () => {
            reject(new Error(`Load style error: ${url}`))
          }

          document.getElementsByTagName('head')[0].appendChild(link)
        }
      })

      return ResourceLoader.tasks[url]
    })

    return Promise.all(promises)
  }
}
