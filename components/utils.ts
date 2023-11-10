export const shortenAddress = (address, length = 10) =>
  `${address.slice(0, length)}...${address.slice(
    address.length - (length - 2),
    address.length
  )}`;

export const toParams = (params) =>
  Object.keys(params)
    .map(
      (key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
    )
    .join("&");

export const uniq = (arr) =>
  arr.reduce((acc, curr) => {
    if (!acc.includes(curr)) acc.push(curr);
    return acc;
  }, []);
