const deep = (target: any, map = new WeakMap()): any => {
  // WeakMap 对象是一组键值对的集合，其中的键是弱引用对象，而值可以是任意。
  const isObject = target !== null && (typeof target === 'object' || typeof target === 'function');
  // 过滤不是对象的target
  if (!isObject) {
    return target;
  } else {
    let cloneTarget = new target.constructor();
    // 避免指针循环
    if (map.get(target)) {
      return map.get(target);
    }
    map.set(target, cloneTarget);
    // Map数据 set、get、has、delete、clear
    // keys()=>[...key]
    // values()=>[...value]
    // forEach((value,key)=>{})
    if (Object.prototype.toString.call(target) === '[object Map]') {
      target.forEach((value: any, key: any) => {
        cloneTarget.set(key, deep(value, map));
      });
      return cloneTarget;
    }
    // Set数据 add、delete、has、clear,keys(),values(),forEach((value)=>{})
    else if (Object.prototype.toString.call(target) === '[object Set]') {
      target.forEach((value: any) => {
        cloneTarget.add(deep(value, map));
      });
      return cloneTarget;
    }
    // 函数
    else if (Object.prototype.toString.call(target) === '[object Function]') {
      console.log(target.toString);
      return null;
    }
    // 对象、数组
    else {
      for (let key in target) {
        cloneTarget[key] = deep(target[key], map);
      }
      return cloneTarget;
    }
  }
};
