module.exports = bot => {
  bot.onText(/^\/help$/, msg => {
    if (msg.chat.type === 'private') {
      bot.sendMessage(
        msg.chat.id,
        `
/rstv _регулярка_

Поиск улиц Ростова-на-Дону по регулярке (см. /help_regex).
Примеры: 
/rstv ленина - найти все улицы в которых встречается "ленина".
/rstv л.нина - найти все улицы в которых встречается "л", потом любая буква, потом "нина"
/rstv (проспект|площадь).\\*\\d - найти все проспекты и площади, в названии которых есть любая цифра

/rstv\\_ngrm _маска_

Поиск улиц Ростова-на-Дону по анаграмме из маски. Максимальная длина маски - 9 символов. Допускается использование . в качестве "любого символа".
Пример: /rstv\\_ngrm  нин.ал
            `,
        { parse_mode: 'Markdown' }
      );
    }
  });

  bot.onText(/^\/help_regex/, msg => {
    if (msg.chat.type === 'private') {
      bot.sendMessage(
        msg.chat.id,
        `
. - любой символ
\\d - любая цифра

+ - 1 или больше раз
? - 0 или 1 раз
\\* - 0 или больше раз

_Например, ".+" означает "1 или больше любых символов",
а "\\d*" означает "0 или больше цифр" (то есть цифр в этом месте может вообще не быть)._

\\[] - любой символ в скобках

_Например, "[аб\\d]" означает "а, б или любая цифра"._

\\[^] - любой символ НЕ в скобках

_Например, "[^аоуэеёияюы]" означает "любой символ кроме гласных букв"._

(|) - "или". Работает похоже на [], но [] работает для отдельных символов, а | для выражений любой длины.

_Например, "(переулок|проспект|площадь)" означает "переулок", "проспект" или "площадь"._
            `,
        { parse_mode: 'Markdown' }
      );
    }
  });
};