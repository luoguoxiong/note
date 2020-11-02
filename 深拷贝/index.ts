const deep = (target: any, map = new WeakMap()): any => {
  const isObject = target !== null && (typeof target === 'object' || typeof target === 'function');
  // 过滤不是对象的target
  if (!isObject) {
    return target;
  } else {
    let cloneTarget = new target.constructor();
    if (map.get(target)) {
      return map.get(target);
    }
    map.set(target, cloneTarget);
    // Map数据
    if (Object.prototype.toString.call(target) === '[object Map]') {
      target.forEach((value: any, key: any) => {
        cloneTarget.set(key, deep(value, map));
      });
      return cloneTarget;
    }
    // Set数据
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
