const fs = require('fs');
const rostovStreets = fs.readFileSync('./rostovStreets', 'utf8').split(/\n/g);

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const { ANUTA_TOKEN } = process.env;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(ANUTA_TOKEN, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/rstv (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const regexp = new RegExp(match[1], 'i');

  //   const foundStreet = rostovStreets.find(streetName => regexp.test(streetName));

  const allStreets = rostovStreets.filter(streetName =>
    regexp.test(streetName)
  );

  const chatId = msg.chat.id;

  // send back the matched "whatever" to the chat

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

// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', msg => {
//   const chatId = msg.chat.id;
//   console.log(msg);
//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
// });
