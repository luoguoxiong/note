const deep = (obj, map = new WeakMap()) => {
  if (map.get(obj)) {
    return obj;
  }
  const cloneObj = new obj.constructor();
  const type = Object.prototype.toString.call(obj);
  if (type === 'Object Set') {
    obj.forEach((element) => {
      cloneObj.add(deep(element));
    });
  } else if (type === 'Object Map') {
    obj.forEach((element) => {
      cloneObj.set(deep(element));
    });
  } else if (type === 'Object Object' || type === 'Object Array') {
    for (let key in obj) {
      cloneObj[key] = deep(obj[key], map);
    }
  } else {
    return obj;
  }
  return cloneObj;
};

const set = new Map();
set.set('key', { a: 2 });
set.set('key2', 2);
console.log(deep(set));
