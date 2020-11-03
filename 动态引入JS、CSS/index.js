const addResource = (() => {
  const head = document.getElementsByTagName('head')[0];

  const regTestFn = (reg) => {
    return (str) => {
      return reg.test(str);
    };
  };

  const isLoadResource = new Set();

  const isEndWithJs = regTestFn(/\.js$/);

  const isEndWithCss = regTestFn(/\.css$/);

  const loadJs = (path) => {
    return new Promise((res, rej) => {
      const script = document.createElement('script');
      script.src = path;
      script.type = 'text/javascript';
      head.appendChild(script);
      script.onload = () => {
        res(true);
      };
      script.onerror = () => {
        rej(false);
      };
    });
  };

  const loadCss = (path) => {
    return new Promise((res, rej) => {
      const link = document.createElement('link');
      link.href = path;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      head.appendChild(link);
      link.onload = () => {
        res(true);
      };
      link.onerror = () => {
        rej(false);
      };
    });
  };

  return (path) => {
    if (!isLoadResource.has(path)) {
      isLoadResource.add(path);
      if (isEndWithJs(path)) {
        return loadJs(path);
      } else if (isEndWithCss(path)) {
        return loadCss(path);
      } else {
        return Promise.reject('path is error');
      }
    }
  };
})();
addResource('https://mm.daodao.pro/vendors.614e3d46.async.js');

addResource('https://mm.daodao.pro/vendors.7cf20e14.chunk.css');

addResource('https://modao.pro/vendors.7cf20e14.chunk.css')
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
