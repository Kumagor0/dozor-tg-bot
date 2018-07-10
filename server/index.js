const TelegramBot = require('node-telegram-bot-api');
const { ANUTA_TOKEN } = process.env;
const bot = new TelegramBot(ANUTA_TOKEN, { polling: true });

require('./handlers')(bot);
