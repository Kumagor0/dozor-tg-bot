module.exports = bot => (msg, response) =>
  bot.sendMessage(msg.chat.id, response, {
    reply_to_message_id: msg.message_id,
  });
