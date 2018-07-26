module.exports = (latitude, longitude, scale = 10) =>
  `https://yandex.ru/maps/?ll=${longitude}%2C${latitude}&z=${scale}&mode=search&text=${latitude}%2C%20${longitude}`;
