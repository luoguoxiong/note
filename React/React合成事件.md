# React合成事件

https://cloud.tencent.com/developer/article/1516369

### 一、动机

1. **抹平不同浏览器之间的兼容性差异**。最主要的动机。

2. **事件"合成"，即事件自定义**。事件合成既可以处理兼容性问题，也可以用来自定义事件（例如 React 的 onChange 事件）。

3. **提供一个抽象跨平台事件机制**。类似 VirtualDOM 抽象了跨平台的渲染方式，合成事件（SyntheticEvent）提供一个抽象的跨平台事件机制。

4. **可以做更多优化**。例如利用事件委托机制，几乎所有事件的触发都代理到了 document，而不是 DOM 节点本身，简化了 DOM 事件处理逻辑，减少了内存开销。（React 自身模拟了一套事件冒泡的机制）

5. **可以干预事件的分发**。V16引入 Fiber 架构，React 可以通过干预事件的分发以优化用户的交互体验。

### 二、事件注册

React 的事件注册过程：1.document注册事件（事件委托）、2.存储事件回调

![img](https://img2020.cnblogs.com/blog/898684/202006/898684-20200624143507392-911347960.png)

#### 1. document注册

在 React 组件挂载阶段，根据组件内的声明的事件类型（onclick、onchange 等），在 document 上注册事件（使用addEventListener），并指定统一的回调函数 dispatchEvent。换句话说，document 上不管注册的是什么事件，都具有统一的回调函数 dispatchEvent。也正是因为这一事件委托机制，具有同样的回调函数 dispatchEvent，所以对于同一种事件类型，不论在 document 上注册了几次，最终也只会保留一个有效实例，这能减少内存开销。

#### 2. 存储事件回调

React 为了在触发事件时可以查找到对应的回调去执行，会把组件内的所有事件统一地存放到一个对象中（listenerBank）。而存储方式如上图，首先会根据事件类型分类存储，例如 click 事件相关的统一存储在一个对象中，回调函数的存储采用键值对（key/value）的方式存储在对象中，key 是组件的唯一标识 id，value 对应的就是事件的回调函数。

![img](https://img2020.cnblogs.com/blog/898684/202006/898684-20200624143524310-1842672426.png)

### 三、React事件分发

其大致流程如下：

1. 触发事件，开始 DOM 事件流，先后经过三个阶段：事件捕获阶段、处于目标阶段和事件冒泡阶段
2. 当事件冒泡到 document 时，触发统一的事件分发函数 `ReactEventListener.dispatchEvent`
3. 根据原生事件对象（nativeEvent）找到当前节点（即事件触发节点）对应的 ReactDOMComponent 对象
4. 事件的合成
   1. 根据当前事件类型生成对应的合成对象
   2. 封装原生事件对象和冒泡机制
   3. 查找当前元素以及它所有父级
   4. 在 listenerBank 中查找事件回调函数并合成到 events 中
5. 批量执行合成事件（events）内的回调函数
6. 如果没有阻止冒泡，会将继续进行 DOM 事件流的冒泡（从 curentTage 到 window），否则结束事件触发

![img](https://img2020.cnblogs.com/blog/898684/202006/898684-20200624143540789-1118047434.png)

```js
class TestComponent extends React.Component {

  componentDidMount() {
    this.parent.addEventListener('click', (e) => {
      console.log('dom parent');
    })
    this.child.addEventListener('click', (e) => {
      console.log('dom child');
    })
    document.addEventListener('click', (e) => {
      console.log('document');
    })
    document.body.addEventListener('click', (e) => {
      console.log('body');
    })
    window.addEventListener('click', (e) => {
      console.log('window');
    })
  }

  childClick = (e) => {
    console.log('react child');
  }

  parentClick = (e) => {
    console.log('react parent');
  }

  render() {
    return (
      <div class='parent' onClick={this.parentClick} ref={ref => this.parent = ref}>
        <div class='child' onClick={this.childClick} ref={ref => this.child = ref}>
          Click me!
        </div>
      </div>)
  }
}
```

![img](https://img2020.cnblogs.com/blog/898684/202006/898684-20200624143557043-627913590.png)