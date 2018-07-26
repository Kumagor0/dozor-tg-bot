const help = require('./help.js');
const rstv = require('./rstv.js');
const morse = require('./morse.js');
const lya = require('./lya.js');
const greekAlphabet = require('./greekAlphabet');

const SendResponse = require('./sendResponse');

module.exports = bot => {
  const sendResponse = SendResponse(bot);

  help(bot);
  rstv(bot);
  morse(bot);

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

  bot.onText(/^\/lya (-?\d+\.?\d*),? (-?\d+\.?\d*) ?(\d*)$/, (msg, match) => {
    sendResponse(msg, lya(...match.slice(1, 4)));
  });

  bot.onText(/^\/greek$/, msg => {
    sendResponse(
      msg,
      greekAlphabet
        .map(({ letter, name }, i) => `${i + 1} ${letter} ${name}`)
        .join('\n')
    );
  });
};
