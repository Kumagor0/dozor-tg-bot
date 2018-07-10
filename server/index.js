const fs = require('fs');
const rostovStreets = fs.readFileSync('./rostovStreets', 'utf8').split(/\n/g);

const TelegramBot = require('node-telegram-bot-api');
const { ANUTA_TOKEN } = process.env;
const bot = new TelegramBot(ANUTA_TOKEN, { polling: true });

const permutations = require('./permutations');

bot.onText(/\/rstv (.+)/, (msg, match) => {
  const regexp = new RegExp(match[1], 'i');

  const allStreets = rostovStreets.filter(streetName =>
    regexp.test(streetName)
  );

  const chatId = msg.chat.id;

  if (allStreets.length) {
    if (allStreets.length > 10) {
      bot.sendMessage(
        chatId,
        `Всего найдено улиц по маске ${match[1]}: ${
          allStreets.length
        }\nПоказываю первые 10:\n${allStreets.slice(0, 10).join('\n')}`
      );
    } else {
      bot.sendMessage(
        chatId,
        `Всего найдено улиц по маске ${match[1]}: ${
          allStreets.length
        }\n${allStreets.join('\n')}`
      );
    }
  } else {
    bot.sendMessage(chatId, `Ничего не нашлось!`);
  }
});

bot.onText(/\/rstv_ngrm (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  if (match[1].length > 9) {
    return bot.sendMessage(
      chatId,
      `Строка слишком длинная (максимум 9 символов)`
    );
  }

  const results = permutations(match[1])
    .map(permutation => {
      const regexp = new RegExp(permutation, 'i');

      return {
        permutation,
        streets: rostovStreets.filter(streetName => regexp.test(streetName)),
      };
    })
    .filter(({ streets }) => streets.length > 0);

  if (!results.length) return bot.sendMessage(chatId, `Ничего не нашлось!`);

  const answer = results.map(({ permutation, streets }) =>
    getSearchResultsString(permutation, streets)
  );
  bot.sendMessage(chatId, answer.join('\n\n'));
});

const getSearchResultsString = (query, results) => {
  if (results.length > 10) {
    return `Всего найдено улиц по маске ${query}: ${
      results.length
    }\nПоказываю первые 10:\n${results.slice(0, 10).join('\n')}`;
  } else {
    return `Всего найдено улиц по маске ${query}: ${
      results.length
    }\n${results.join('\n')}`;
  }
};
