# Hybrid 开发

### 一、优缺点

![img](https://user-gold-cdn.xitu.io/2020/4/22/171a0db08e03e681?imageslim)

### 二、JSBridge

![img](https://pic4.zhimg.com/80/v2-c678e0d357873aa2ff32dbb85bc531d7_1440w.jpg)

#### IOS

```js
window.webkit.messageHandlers.iosBridge.postMessage({
  name: 'goHome',
});
```

#### Android

```js
window.NativeController.goHome();
```

