export const getURLParam = (key) => {
  const urlParams = new URLSearchParams(window.location.search);

  if (!urlParams.has(key)) {
    return "";
  }

  return urlParams.get(key);
};

export const removeEmptyKeys = (obj) => {
  Object.keys(obj).forEach(
    (key) => (obj[key] === undefined || obj[key] === "") && delete obj[key]
  );
  return obj;
};

export const getUserInsightLocalStorage = () => {
  if (!localStorage.userInsight)
    localStorage.userInsight = JSON.stringify({ count: 0, level: 20, ids: [] });

  return JSON.parse(localStorage.userInsight);
};

export const saveUserInsightLocalStorage = (count, level, ids) => {
  const ret = JSON.parse(localStorage.userInsight);
  if (count) ret.count = count;
  if (level) ret.level = level;
  if (Array.isArray) ret.ids = ids;
  else ret.ids.push(ids);

  localStorage.userInsight = JSON.stringify(ret);
};
