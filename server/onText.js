module.exports = bot => (regexArr, handler) =>
  regexArr.map(regex => bot.onText(regex, handler));
