export const _alive = obj => {
  return !obj || !Object.keys(obj).lenth;
};

export const phoneFormatter = input => {
  const digits = [];
  if (input.length > 0) digits.push(input.substring(0, 3));
  if (input.length >= 4) digits.push(input.replace(/-/g, '').substring(3, 6));
  if (input.length >= 8) digits.push(input.replace(/-/g, '').substring(6, 10));
  return digits.join('-');
};
