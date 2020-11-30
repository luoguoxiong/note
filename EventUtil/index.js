const EventUtil = {
  addHandle: (element, type, handle) => {
    if (element.addEventListener) {
      element.addEventListener(type, handle, false); // false冒泡阶段；true捕获阶段
    } else if (element.attachEvent) {
      element.attachEvent('on' + type, handle); // IE默认冒泡阶段
    } else {
      element['on' + type] = handle;
    }
  },
  removeHandle: (element, type, handle) => {
    if (element.removeEventListener) {
      element.removeEventListener(type, handle, false);
    } else if (element.detachEvent) {
      element.detachEvent('on' + type, handle);
    } else {
      element['on' + type] = null;
    }
  },
  getEvent: (event) => {
    return event || window.event;
  },
  getTarget: (event) => {
    return event.target || event.srcElement;
  },
  preventDefault: (event) => {
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
  },
  stopPropagation: (event) => {
    if (event.stopPropagation) {
      event.stopPropagation();
    } else {
      event.cancelBubble = true;
    }
  },
};

function EventTarget() {
  this.handlers = {};
}

EventTarget.prototype = {
  constructor: EventTarget,
  addHandler: function (type, handler) {
    if (typeof this.handlers[type] == 'undefined') {
      this.handlers[type] = [];
    }
    this.handlers[type].push(handler);
  },
  fire: function (event) {
    if (!event.target) {
      event.target = this;
    }
    if (this.handlers[event.type] instanceof Array) {
      var handlers = this.handlers[event.type];
      for (var i = 0, len = handlers.length; i < len; i++) {
        handlers[i](event); //绑定上的监听全部都要执行一遍
      }
    }
  },
  removeHandler: function (type, handler) {
    if (this.handlers[type] instanceof Array) {
      var handlers = this.handlers[type];
      for (var i = 0, len = handlers.length; i < len; i++) {
        if (handlers[i] == handler) {
          break;
        }
      }
      handlers.splice(i, 1);
    }
  },
};

// // 创建主体对象
// var target = new EventTarget();

// //添加一个事件
// target.addHandler('message', handleMeessage);

// //触发事件
// target.fire({ type: 'message', message: 'hello' });

// // 删除事件
// target.removeHandler('message', handleMeessage);

// //再次触发事件
// target.fire({ type: 'message', message: 'hello' });
