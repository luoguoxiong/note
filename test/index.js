const instans = (left, ori) => {
  let leftProto = Object.getPrototypeOf(left);
  while (true) {
    if (leftProto === null) {
      return false;
    }
    if (leftProto === ori.prototype) {
      return true;
    }
    leftProto = Object.getPrototypeOf(leftProto);
  }
};

const Person = function (name) {
  this.name = name;
};

console.log(instans([], Person));
