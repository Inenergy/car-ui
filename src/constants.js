const { readFileSync, writeFile } = require('fs');
const path = require('path');
const i18n = require('./utils/translator');

// загрузка локалей
i18n.loadJSON(path.join(__dirname, '..', 'locale', 'ru.json'), 'ru');
i18n.loadJSON(path.join(__dirname, '..', 'locale', 'de.json'), 'de');
i18n.loadJSON(path.join(__dirname, '..', 'locale', 'en.json'), 'en');
i18n.setLocale(process.env.LANG.slice(0, 2));

const isPi = process.platform === 'linux' && process.arch === 'arm';

// максимально хранимое количество точек графика
const MAX_POINTS = 2000;

// таймаут подключения bluetooth
const CONNECTION_TIMEOUT = 30000;

// разделители в двоичном виде
const SEPARATORS = Buffer.from([161, 178, 195, 195, 212, 247]);

// идентификаторы bluetooth модулей машинки
const SERVICE_UUID = 'ffe0';
const CHARACTERISTIC_UUID = 'ffe1';

// пины GPIO для чтения оборотов в минуту
const OUTPUT_PIN = 12;
const INPUT_PIN = 13;

// нижня граница давления при которой появится индикатор разряженного баллона
const HYDROGEN_CRITICAL_PRESSURE = 0.3;

// характеристики батареи, передаваемые по bluetooth
const BATTERY_CHARACTERISTICS = {
  batteryVoltage: {
    label: i18n.__('voltage'),
    units: i18n.__('V'),
    type: 'numeric',
    icon: 'volts',
    bytes: 2,
    offset: 6,
    divider: 1000,
  },
  batteryCurrent: {
    label: i18n.__('current'),
    units: i18n.__('A'),
    type: 'numeric',
    icon: 'amps',
    bytes: 2,
    offset: 8,
    divider: 1000,
  },
  batteryMode: {
    label: i18n.__('mode'),
    type: 'textFlag',
    bytes: 1,
    offset: 24,
    posText: i18n.__('charge'),
    negText: i18n.__('discharge'),
  },
  rechargingAvailable: {
    label: i18n.__('charge possible'),
    type: 'semaphorFlag',
    bytes: 1,
    offset: 10,
  },
  dischargingAvailable: {
    label: i18n.__('discharge possible'),
    type: 'semaphorFlag',
    bytes: 1,
    offset: 11,
  },
};

// характеристики ТЭ, передаваемые по bluetooth
const FUEL_CELL_CHARACTERISTICS = {
  fuelCellMode: {
    label: i18n.__('state'),
    type: 'textFlag',
    bytes: 1,
    offset: 19,
    posText: i18n.__('on'),
    negText: i18n.__('off'),
  },
  fuelCellVoltage: {
    label: i18n.__('voltage'),
    units: i18n.__('V'),
    type: 'numeric',
    icon: 'volts',
    bytes: 2,
    offset: 12,
    divider: 1000,
  },
  fuelCellCurrent: {
    label: i18n.__('current'),
    units: i18n.__('A'),
    type: 'numeric',
    icon: 'amps',
    bytes: 2,
    divider: 1000,
    offset: 14,
  },
  fuelCellTemp: {
    label: i18n.__('temperature'),
    units: '\u2103',
    type: 'numeric',
    icon: 'heat',
    bytes: 2,
    offset: 16,
    divider: 10,
  },
  hydrogenConsumption: {
    label: i18n.__('hydrogen consumption'),
    units: i18n.__('ml/min'),
    type: 'numeric',
    icon: 'hydrogen',
    bytes: 2,
    offset: 20,
  },
  hydrogenPressure: {
    label: i18n.__('hydrogen pressure'),
    units: i18n.__('bar'),
    type: 'restricted',
    bytes: 2,
    offset: 22,
    divider: 1000,
    criticalValue: HYDROGEN_CRITICAL_PRESSURE,
    warningMessage: i18n.__('change cartridge'),
  },
};

// все характеристики, передаваемы по bluetooth, собранные в одну структуру
const CAR_CHARACTERISTICS = Object.assign(
  {},
  BATTERY_CHARACTERISTICS,
  FUEL_CELL_CHARACTERISTICS,
  {
    recuperation: {
      label: i18n.__('recuperation'),
      type: 'textFlag',
      bytes: 1,
      offset: 25,
      posText: i18n.__('no'),
      negText: i18n.__('yes'),
    },
  }
);

// общая длина принимаемого массива в байтах для проверки посылки
const BUFFER_LENGTH = Object.values(CAR_CHARACTERISTICS).reduce(
  (sum, ch) => sum + ch.bytes,
  0
);

// значения, которые пишутся в лог и на график
const STORED_VALUES = [
  'time',
  'batteryVoltage',
  'batteryCurrent',
  'fuelCellVoltage',
  'fuelCellCurrent',
  'fuelCellTemp',
  'hydrogenConsumption',
];

// какой-то костыль
STORED_VALUES.numOfBatteryValues = 2;

// дефолтный ШИМ для иммитации сопротивления грунта
const GROUND_RESISTANCE = {
  low: {
    dutyCycle: 0,
    label: i18n.__('low'),
  },
  medium: {
    dutyCycle: 128 * 4000,
    label: i18n.__('medium'),
  },
  high: {
    dutyCycle: 132 * 4000,
    label: i18n.__('high'),
  },
  veryHigh: {
    dutyCycle: 148 * 4000,
    label: i18n.__('veryHigh'),
  },
};

// путь к сохраненному ID машинки для автоматического подключения bluetooth
const CONFIG_PATH = isPi ? `~/.car-ui/config.json` : `config.json`;
let CONFIG = {};

// считывание настроек ШИМ из файла, если они есть
try {
  CONFIG = JSON.parse(readFileSync(CONFIG_PATH));
  for (const key in GROUND_RESISTANCE) {
    if (typeof CONFIG[key] == 'number')
      GROUND_RESISTANCE[key].dutyCycle = CONFIG[key] * 4000;
  }
} catch (e) {
  for (let key in GROUND_RESISTANCE) {
    CONFIG[key] = GROUND_RESISTANCE[key].dutyCycle / 4000;
  }
  writeFile(CONFIG_PATH, JSON.stringify(CONFIG), Function.prototype);
}

// границы осей графиков
const CHART_CONSTRAINTS = {
  time: [0, 10],
  batteryVoltage: [6, 9],
  batteryCurrent: [0, 20],
  fuelCellVoltage: [0, 15],
  fuelCellCurrent: [0, 6],
  fuelCellTemp: [0, 60],
  hydrogenConsumption: [0, 800],
};

module.exports = {
  SERVICE_UUID,
  CHARACTERISTIC_UUID,
  CAR_CHARACTERISTICS,
  BATTERY_CHARACTERISTICS,
  FUEL_CELL_CHARACTERISTICS,
  GROUND_RESISTANCE,
  STORED_VALUES,
  SEPARATORS,
  CONNECTION_TIMEOUT,
  BUFFER_LENGTH,
  INPUT_PIN,
  OUTPUT_PIN,
  MAX_POINTS,
  CHART_CONSTRAINTS,
  CONFIG,
  CONFIG_PATH,
  isPi,
  __: i18n.__.bind(i18n),
};
