function newObj(ctor, ...args) {
  const obj = Object.create(ctor.prototype);
  ctor.call(obj, ...args);
  return obj;
}

function Person(a) {
  this.a = a;
}
