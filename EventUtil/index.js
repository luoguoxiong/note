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
