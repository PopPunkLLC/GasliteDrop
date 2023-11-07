export const shortenAddress = (address, length = 10) => {
  return `${address.slice(0, length)}...${address.slice(
    address.length - (length - 2),
    address.length
  )}`;
};
