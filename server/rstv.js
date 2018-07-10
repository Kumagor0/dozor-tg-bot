const fs = require('fs');
const rostovStreets = fs.readFileSync('./rostovStreets', 'utf8').split(/\n/g);

const permutations = require('./permutations');
const SendResponse = require('./sendResponse');

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

module.exports = bot => {
  const sendResponse = SendResponse(bot);

  bot.onText(/\/rstv (.+)/, (msg, match) => {
    const regexp = new RegExp(match[1], 'i');

    const allStreets = rostovStreets.filter(streetName =>
      regexp.test(streetName)
    );

    if (allStreets.length) {
      if (allStreets.length > 10) {
        sendResponse(
          msg,
          `Всего найдено улиц по маске ${match[1]}: ${
            allStreets.length
          }\nПоказываю первые 10:\n${allStreets.slice(0, 10).join('\n')}`
        );
      } else {
        sendResponse(
          msg,
          `Всего найдено улиц по маске ${match[1]}: ${
            allStreets.length
          }\n${allStreets.join('\n')}`
        );
      }
    } else {
      sendResponse(msg, `Ничего не нашлось!`);
    }
  });

  bot.onText(/\/rstv_ngrm (.+)/, (msg, match) => {
    if (match[1].length > 9) {
      return sendResponse(msg, `Строка слишком длинная (максимум 9 символов)`);
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

    if (!results.length) return sendResponse(msg, `Ничего не нашлось!`);

    const answer = results.map(({ permutation, streets }) =>
      getSearchResultsString(permutation, streets)
    );
    sendResponse(msg, answer.join('\n\n'));
  });
};
