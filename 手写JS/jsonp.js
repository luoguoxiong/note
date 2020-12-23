const jsonp = (url, callbackName) => {
  return new Promise((res) => {
    const link = document.createElement('script');
    link.src = url;
    document.body.appendChild(link);
    link.onload = () => {
      window[callbackName] = (data) => {
        res(data);
        document.body.removeChild(link);
      };
    };
  });
};
