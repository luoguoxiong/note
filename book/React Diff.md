# Diff算法

https://cloud.tencent.com/developer/article/1477707

```javascript
export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderExpirationTime: ExpirationTime,
) {
  // 首次渲染
  if (current === null) {
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime,
    );
  } else {
    // diff算法
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderExpirationTime,
    );
  }
}
```

```javascript
function reconcileChildFibers(
  returnFiber: Fiber, //是即将 Diff 的这层的父节点。
  currentFirstChild: Fiber | null, // 当前层的第一个 Fiber 节点。
  newChild: any, //是即将更新的 vdom 节点(可能是 TextNode、可能是 ReactElement，可能是数组)，不是 Fiber 节点
  expirationTime: ExpirationTime,
): Fiber | null {
  // 主要的 Diff 逻辑
}
```

**策略一（tree diff）：**
（1）React通过updateDepth对Virtual DOM树进行层级控制

（2）对树分层比较，两棵树 只对同一层次节点 进行比较。如果该节点不存在时，则该节点及其子节点会被完全删除，不会再进一步比较。

**策略二（component diff）：**
（1）同一类型的两个组件，按原策略（层级比较）继续比较Virtual DOM树即可
（2）同一类型的两个组件，组件A变化为组件B时，可能Virtual DOM没有任何变化，如果知道这点（变换的过程中，Virtual DOM没有改变），可节省大量计算时间，所以 用户 可以通过 shouldComponentUpdate() 来判断是否需要 判断计算
（3）不同类型的组件，将一个（将被改变的）组件判断为dirty component（脏组件），从而替换 整个组件的所有节点

**策略三（element diff）：**
（1）对于同一层级的一组子节点，通过唯一key区分。
（2）当节点处于同一层级时，diff提供三种节点操作：删除、插入、移动

![img](https://img-blog.csdnimg.cn/img_convert/8abbe9481f3d7f70a4d7b8edfcecd322.png)

如图：看着上图的 B，React先从新中取得B，然后判断旧中是否存在相同节点B，当发现存在节点B后，就去判断是否移动B。
B在旧 中的index=1，它的lastIndex=0，**不满足 index < lastIndex 的条件，因此 B 不做移动操作。此时，一个操作是，lastIndex=(index,lastIndex)中的较大数=1，**并将 B 的位置更新为新集合中的位置 `prevChild.`index` = nextIndex`，此时新集合中 `B.`index` = 0`，`nextIndex++` 进入下一个节点的判断。

看 A，A在旧的index=0，当前的lastIndex=1，**满足index<lastIndex**，因此，对A进行移动操作，此时**lastIndex=max(index,lastIndex)=1，**并将 A 的位置更新为新集合中的位置 `prevChild.`index` = nextIndex`，此时新集合中 `A.`index` = 1`，`nextIndex++` 进入下一个节点的判断。

**注意：lastIndex有点像浮标，或者说是一个map的索引，一开始默认值是0，它会与map中的元素进行比较，比较完后，会改变自己的值的（取index和lastIndex的较大数）。**