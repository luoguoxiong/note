interface LoadedScripts {
  [url: string]: boolean
}

export class ScriptLoader {
  private static loadedScripts: LoadedScripts = {}

  public static load(url: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (ScriptLoader.loadedScripts[url]) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.type = 'text/javascript'

      script.onload = () => {
        ScriptLoader.loadedScripts[url] = true
        resolve(true)
      }

      script.onerror = () => {
        reject(new Error(`load script error: ${url}`))
      }

      script.src = url
      document.getElementsByTagName('head')[0].appendChild(script)
    })
  }
}
