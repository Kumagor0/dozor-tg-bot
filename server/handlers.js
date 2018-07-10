const help = require('./help.js');
const rstv = require('./rstv.js');

module.exports = bot => {
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

  help(bot);
  rstv(bot);
};
