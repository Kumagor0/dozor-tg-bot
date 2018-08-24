const SendResponse = require('./sendResponse');
const onText = require('./onText');

const twoDigitNumber = n => (n > 9 ? `${n}` : `0${n}`);

module.exports = bot => {
  const sendResponse = SendResponse(bot);

  onText(bot)([/^\/points (.+)/, /^points (.+)/, /^тчк (.+)/], (msg, match) => {
    try {
      sendResponse(
        msg,
        match[1]
          .split(', ')
          .map((str, i) => `${twoDigitNumber(i + 1)}) ${str}`)
          .join('\n')
      );
    } catch (err) {
      console.log(err);
    }
  });
};
