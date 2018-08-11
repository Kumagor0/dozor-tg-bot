const help = require('./help.js');
const rstv = require('./rstv.js');
const morse = require('./morse.js');
const lya = require('./lya.js');
const greekAlphabet = require('./greekAlphabet');

const SendResponse = require('./sendResponse');
const onText = require('./onText');

const startTime = Date.now();
const logs = [];
const fs = require('fs');

module.exports = bot => {
  const sendResponse = SendResponse(bot);
  const handleCommands = onText(bot);

  bot.onText(/.+/, msg => {
    console.log(msg);
    logs.push(msg);
    fs.writeFileSync(`log_${startTime}.json`, JSON.stringify(logs));
  });

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

  handleCommands(
    [
      /^\/lya (-?\d+\.?\d*),? (-?\d+\.?\d*) ?(\d*)$/,
      /^lya (-?\d+\.?\d*),? (-?\d+\.?\d*) ?(\d*)$/,
      /^як (-?\d+\.?\d*),? (-?\d+\.?\d*) ?(\d*)$/,
    ],
    (msg, match) => {
      sendResponse(msg, lya(...match.slice(1, 4)));
    }
  );

  handleCommands([/^\/greek$/, /^greek$/, /^греч$/], msg => {
    sendResponse(
      msg,
      greekAlphabet
        .map(({ letter, name }, i) => `${i + 1} ${letter} ${name}`)
        .join('\n')
    );
  });
};
