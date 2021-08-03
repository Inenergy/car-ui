const { readFileSync } = require('fs');
const { homedir } = require('os');
const path = require('path');
const i18n = require('./utils/translator');

i18n.loadJSON(path.join(__dirname, '..', 'locale', 'ru.json'), 'ru');
i18n.loadJSON(path.join(__dirname, '..', 'locale', 'de.json'), 'de');
i18n.loadJSON(path.join(__dirname, '..', 'locale', 'en.json'), 'en');
i18n.setLocale('ru');

const isPi = process.platform === 'linux' && process.arch === 'arm';

const MAX_POINTS = 2000;

const CONNECTION_TIMEOUT = 30000;

const SEPARATORS = Buffer.from([161, 178, 195, 195, 212, 247]);

const SERVICE_UUID = 'ffe0';
const CHARACTERISTIC_UUID = 'ffe1';

const OUTPUT_PIN = 12;
const INPUT_PIN = 13;

const HYDROGEN_CRITICAL_PRESSURE = 0.3;

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

const BUFFER_LENGTH = Object.values(CAR_CHARACTERISTICS).reduce(
  (sum, ch) => sum + ch.bytes,
  0
);

const STORED_VALUES = [
  'time',
  'batteryVoltage',
  'batteryCurrent',
  'fuelCellVoltage',
  'fuelCellCurrent',
  'fuelCellTemp',
  'hydrogenConsumption',
];

STORED_VALUES.numOfBatteryValues = 2;

const CONFIG = JSON.parse(
  readFileSync(
    isPi ? `${homedir()}/car-ui/config.json` : `config.json`
  )
);

const GROUND_RESISTANCE = {};

for (const key of ['low', 'medium', 'high', 'veryHigh']) {
  GROUND_RESISTANCE[key] = {
    dutyCycle: (CONFIG[key] || 0) * 4000,
    label: i18n.__(key),
  };
}

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
  isPi,
  __: i18n.__.bind(i18n),
};
