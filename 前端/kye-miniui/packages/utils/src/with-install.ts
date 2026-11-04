import type { App, Component } from 'vue'

export type WithInstall<T> = T & {
  name?: string
  install(app: App): void
}

export const withInstall = <T extends Component>(comp: T, name?: string) => {
  const _comp = comp as WithInstall<T>
  _comp.name = _comp.name || name
  _comp.install = (app: App) => {
    if (_comp.name) {
      app.component(_comp.name, _comp)
    }
  }

  return _comp as WithInstall<T>
}
