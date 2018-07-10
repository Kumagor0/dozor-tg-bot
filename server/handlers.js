const help = require('./help.js');
const rstv = require('./rstv.js');

const SendResponse = require('./sendResponse');

module.exports = bot => {
  const sendResponse = SendResponse(bot);

  bot.onText(/^\/start$/, msg => {
    if (msg.chat.type === 'private') {
      bot.sendMessage(
        msg.chat.id,
        `
Привет! Для получения списка доступных команд напиши /help, для получения краткой справки по регулярным выражениям - /help_regex

Обратная связь - @kumagoro.
        `
      );
    }
  });

  bot.onText(/^\/lya (-?\d+\.?\d*) (-?\d+\.?\d*) ?(\d*)$/, (msg, match) => {
    sendResponse(
      msg,
      `https://yandex.ru/maps/?ll=${match[2]}%2C${match[1]}&z=${match[3] ||
        '10'}`
    );
  });

  help(bot);
  rstv(bot);
};
