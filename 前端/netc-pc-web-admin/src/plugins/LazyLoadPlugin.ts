import { App, Directive, Plugin, onUnmounted } from 'vue'

interface LazyLoadOptions {
  src: string
  placeholder?: string
  error?: string
}

/**
 * LazyLoadDirective: img标签图片懒加载、其他元素背景图懒加载
 */
const LazyLoadDirective: Directive = {
  beforeMount(el, binding) {
    const options = binding.value as LazyLoadOptions
    const imageSrc = options.src
    const placeholderSrc = options.placeholder || '' // 占位图片的路径
    const errorSrc = options.error || '' // 失败图片的路径

    const setElementUrl = (el: HTMLDivElement | HTMLElement, url: string) => {
      if (el instanceof HTMLImageElement) {
        el.src = url
      } else {
        el.style.backgroundImage = `url(${url})`
      }
    }

    setElementUrl(el, placeholderSrc)

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = new Image()
          img.src = imageSrc
          img.onload = () => {
            setElementUrl(el, imageSrc)
            observer.unobserve(el)
          }
          img.onerror = () => {
            setElementUrl(el, errorSrc)
            observer.unobserve(el)
          }
        }
      })
    })
    observer.observe(el)

    onUnmounted(() => {
      observer.unobserve(el)
    })
  },
}

const LazyLoadPlugin: Plugin = {
  install(app: App) {
    app.directive('lazyload', LazyLoadDirective)
  },
}

export default LazyLoadPlugin
