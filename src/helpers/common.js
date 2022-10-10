const boolToNumber = bool => {
  return Number(Boolean(bool));
};

const toFixedNumber = (number, fixed = 4) => {
  return Number(number.toFixed(fixed));
};

module.exports = { boolToNumber, toFixedNumber };
