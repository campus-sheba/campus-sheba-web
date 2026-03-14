export const removeNumberPrefix = number => {
  let numberStr = number.toString();
  if (numberStr.startsWith('+88')) {
    return numberStr.substring(3);
  } else {
    return numberStr;
  }
};
