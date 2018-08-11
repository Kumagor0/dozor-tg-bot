const fs = require('fs');
const rostovStreets = fs.readFileSync('./rostovStreets', 'utf8').split(/\n/g);
const R = require('ramda');
const rostovStreetsNamesOnlyArrays = R.compose(
  R.map(R.split('')),
  R.map(R.toLower),
  R.uniq
)(fs.readFileSync('./rostovStreetsNamesOnly', 'utf8').split(/\n/g));
const lya = require('./lya.js');

const permutations = require('./permutations');
const SendResponse = require('./sendResponse');
const onText = require('./onText');
const isSubset = require('./isSubset');

const getSearchResultsString = (query, results) => {
  if (results.length > 30) {
    return `Всего найдено улиц по маске ${query}: ${
      results.length
    }\nПоказываю первые 30:\n${results.slice(0, 30).join('\n')}`;
  } else {
    return `Всего найдено улиц по маске ${query}: ${
      results.length
    }\n${results.join('\n')}`;
  }
};

module.exports = bot => {
  const sendResponse = SendResponse(bot);

  const handleCommands = onText(bot);

  handleCommands(
    [/^\/rstv (.+)/, /^\/r (.+)/, /^r (.+)/, /^р (.+)/],
    (msg, match) => {
      const regexp = new RegExp(match[1], 'i');

      const allStreets = rostovStreets.filter(streetName =>
        regexp.test(streetName)
      );

      if (allStreets.length) {
        if (allStreets.length > 30) {
          sendResponse(
            msg,
            `Всего найдено улиц по маске ${match[1]}: ${
              allStreets.length
            }\nПоказываю первые 30:\n${allStreets.slice(0, 30).join('\n')}`
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
    }
  );

  handleCommands(
    [/^\/rstv_ngrm (.+)/, /^\/an (.+)/, /^an (.+)/, /^ан (.+)/],
    (msg, match) => {
      if (match[1].length > 9) {
        return sendResponse(
          msg,
          `Строка слишком длинная (максимум 9 символов)`
        );
      }

      const results = permutations(match[1])
        .map(permutation => {
          const regexp = new RegExp(permutation, 'i');

          return {
            permutation,
            streets: rostovStreets.filter(streetName =>
              regexp.test(streetName)
            ),
          };
        })
        .filter(({ streets }) => streets.length > 0);

      if (!results.length) return sendResponse(msg, `Ничего не нашлось!`);

      const answer = results.map(({ permutation, streets }) =>
        getSearchResultsString(permutation, streets)
      );
      sendResponse(msg, answer.join('\n\n'));
    }
  );

  const mil = 1000000;

  const minLatitude = 46899000;
  const maxLatitude = 47525000;
  const minLongitude = 39338000;
  const maxLongitude = 40427800;

  const latitudeSegments = 107;

  const longitudeSegmentNames = require('./rstvStarmapLongitudeSegmentNames');
  const longitudeSegments = longitudeSegmentNames.length;

  const parseCoord = coord => parseFloat(coord) * mil;

  const calculateSegment = (min, max, segmentsNumber, number) =>
    Math.ceil((number - min) / ((max - min) / segmentsNumber));

  const greekAlphabet = require('./greekAlphabet');

  handleCommands(
    [
      /^\/rstv_starmap (\d\d\.\d*),? ?(\d\d\.\d*)/,
      /^\/sm (\d\d\.\d*),? ?(\d\d\.\d*)/,
      /^sm (\d\d\.\d*),? ?(\d\d\.\d*)/,
      /^см (\d\d\.\d*),? ?(\d\d\.\d*)/,
      /^зк (\d\d\.\d*),? ?(\d\d\.\d*)/,
    ],
    (msg, match) => {
      const latitude = parseCoord(match[1]);
      const longitude = parseCoord(match[2]);

      if (!(minLatitude <= latitude && latitude <= maxLatitude)) {
        sendResponse(
          msg,
          `Широта должна быть от ${minLatitude / mil} до ${maxLatitude / mil}`
        );
        return;
      }

      if (!(minLongitude <= longitude && longitude <= maxLongitude)) {
        sendResponse(
          msg,
          `Долгота должна быть от ${minLongitude / mil} до ${maxLongitude /
            mil}`
        );
        return;
      }

      const latitudeSegmentNumber =
        latitudeSegments +
        1 -
        calculateSegment(minLatitude, maxLatitude, latitudeSegments, latitude);

      const longitudeSegmentNumber = calculateSegment(
        minLongitude,
        maxLongitude,
        longitudeSegments,
        longitude
      );

      const longitudeSegmentName =
        longitudeSegmentNames[longitudeSegmentNumber - 1];

      const getLongitudeSegmentNameRus = name =>
        name
          .split('')
          .map(
            greekLetter =>
              greekAlphabet.find(({ letter }) => letter === greekLetter).name
          )
          .join(' ');

      const longitudeSegmentNameRus = getLongitudeSegmentNameRus(
        longitudeSegmentName
      );

      sendResponse(
        msg,
        `${latitudeSegmentNumber} ${longitudeSegmentName} (${longitudeSegmentNameRus}, ${longitudeSegmentNumber})`
      );
    }
  );

  const rstvStarmapGetTileCenter = (
    latitudeSegmentNumber,
    longitudeSegmentNumber
  ) =>
    lya(
      (
        minLatitude / mil +
        (latitudeSegments - latitudeSegmentNumber + 0.5) *
          ((maxLatitude - minLatitude) / mil / latitudeSegments)
      ).toFixed(6),
      (
        minLongitude / mil +
        (longitudeSegmentNumber - 1 + 0.5) *
          ((maxLongitude - minLongitude) / mil / longitudeSegments)
      ).toFixed(6),
      13
    );

  handleCommands(
    [
      /^\/rstv_starmap (\d+),? ?(\d+|\D+)/,
      /^\/sm (\d+),? ?(\d+|\D+)/,
      /^sm (\d+),? ?(\d+|\D+)/,
      /^см (\d+),? ?(\d+|\D+)/,
      /^зк (\d+),? ?(\d+|\D+)/,
    ],
    (msg, match) => {
      const latitudeSegmentNumber = parseInt(match[1]);

      if (!latitudeSegmentNumber || latitudeSegmentNumber > latitudeSegments) {
        sendResponse(
          msg,
          `Некорректное обозначение широты. Допустимы целые числа от 1 до ${latitudeSegments}`
        );
        return;
      }

      let longitudeSegmentNumber = parseInt(match[2]);

      if (
        longitudeSegmentNumber &&
        longitudeSegmentNumber <= longitudeSegments
      ) {
        sendResponse(
          msg,
          rstvStarmapGetTileCenter(
            latitudeSegmentNumber,
            longitudeSegmentNumber
          )
        );
        return;
      }

      let longitudeSegmentName = match[2];

      if (
        longitudeSegmentName &&
        longitudeSegmentNames.includes(longitudeSegmentName)
      ) {
        sendResponse(
          msg,
          rstvStarmapGetTileCenter(
            latitudeSegmentNumber,
            longitudeSegmentNames.indexOf(longitudeSegmentName) + 1
          )
        );
        return;
      }

      const longitudeSegmentNameRus = match[2];

      longitudeSegmentName = longitudeSegmentNameRus
        .split(' ')
        .map(letterNameRus => {
          const greekLetter = greekAlphabet.find(
            ({ name }) => name === letterNameRus
          );

          return greekLetter && greekLetter.letter;
        })
        .join('');

      if (
        longitudeSegmentName &&
        longitudeSegmentNames.includes(longitudeSegmentName)
      ) {
        sendResponse(
          msg,
          rstvStarmapGetTileCenter(
            latitudeSegmentNumber,
            longitudeSegmentNames.indexOf(longitudeSegmentName) + 1
          )
        );
        return;
      }

      sendResponse(
        msg,
        `Некорректное обозначение долготы. Допустимые варианты: целые числа от 1 до ${longitudeSegments}, либо одна или несколько прописных греческих букв (без пробелов), либо русские названия одной или нескольких греческих букв, разделённые пробелами (см. /greek).`
      );
      return;
    }
  );

  handleCommands(
    [/^\/rstv_nb (.+)/, /^\/nb (.+)/, /^nb (.+)/, /^нб (.+)/],
    (msg, match) => {
      const letters = match[1];
      const lettersArr = letters.split('').map(R.toLower);
      const allStreets = rostovStreetsNamesOnlyArrays
        .filter(street => isSubset(street, lettersArr))
        .map(street => street.join(''));

      if (allStreets.length) {
        if (allStreets.length > 30) {
          sendResponse(
            msg,
            `Всего найдено улиц по набору букв ${letters}: ${
              allStreets.length
            }\nПоказываю первые 30:\n${allStreets.slice(0, 30).join('\n')}`
          );
        } else {
          sendResponse(
            msg,
            `Всего найдено улиц по набору букв ${letters}: ${
              allStreets.length
            }\n${allStreets.join('\n')}`
          );
        }
      } else {
        sendResponse(msg, `Ничего не нашлось!`);
      }
    }
  );
};
