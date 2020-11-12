function memo() {
  const cache = {};
  return function (arg) {
    if (cache[arg]) {
      return cache[arg];
    } else {
      cache[arg] = res;
      return res;
    }
  };
}

function pageCache() {
  const cache = {};
  return (pageId) => {
    if (cache[pageId]) {
      return Promise.resolve(cache[pageId]);
    } else {
      return axios.get(pageId).then((data) => {
        cache[pageId] = data;
        return data;
      });
    }
  };
}
