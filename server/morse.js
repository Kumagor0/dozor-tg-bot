const SendResponse = require('./sendResponse');
const morsify = require('morsify');

module.exports = bot => {
  const sendResponse = SendResponse(bot);

  bot.onText(/\/morse (.+)/, (msg, match) => {
    try {
      sendResponse(
        msg,
        morsify.decode(match[1].replace('—', '--'), { space: ' ' }) +
          '\n' +
          morsify.decode(match[1].replace('—', '--'), {
            priority: 5,
            space: ' ',
          })
      );
    } catch (err) {
      console.log(err);
    }
  });
};
