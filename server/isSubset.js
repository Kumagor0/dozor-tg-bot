module.exports = (bigArrOriginal, arrOriginal) => {
  const bigArr = Object.assign([], bigArrOriginal);
  const arr = Object.assign([], arrOriginal);

  while (arr.length > 0) {
    const curElement = arr.pop();
    const index = bigArr.indexOf(curElement);

    if (index === -1) {
      return false;
    } else {
      bigArr.splice(index, 1);
    }
  }
  return true;
};
