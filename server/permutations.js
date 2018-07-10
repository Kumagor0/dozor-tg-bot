const R = require('ramda');

const permute = (leftoverArray, definedValues = []) => {
  if (leftoverArray.length === 1) return [...definedValues, leftoverArray[0]];

  return R.flatten(
    leftoverArray.map((val, i) => {
      const splicedArray = Object.assign([], leftoverArray);
      const newDefinedValues = definedValues.concat(splicedArray.splice(i, 1));
      return permute(splicedArray, newDefinedValues);
    })
  );
};

module.exports = str => {
  return R.uniq(
    R.splitEvery(str.length, permute(str.split(''), [])).map(arr =>
      arr.join('')
    )
  );
};
