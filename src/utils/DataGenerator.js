// Генератор случайных значений для проверки программы на windows
const { SEPARATORS } = require('../constants');
const EventEmitter = require('events');
const { randInt } = require('./numagic');
const DataHander = require('./DataHandler');

class DataGenerator extends EventEmitter {
  constructor() {
    super();
    this.handler = new DataHander();
    this.intervalID = 0;
    this.values = [3128, 10261, 0, 0, 1553, 5147, 357, 95, 0, 1443, 0, 1, 0];
    this.incrementers = [
      (n) => n - randInt(1),
      (n) => n - randInt(1),
      () => Number(this.values[0] < 3500),
      () => Number(this.values[0] < 3000),
      (n) => n - randInt(1),
      (n) => n - randInt(1),
      (n) => n + randInt(1),
      (n) => (this.values[6] > 380 ? 100 : 30),
      (n) => n,
      (n) => n,
      (n) => n + randInt(1),
      (n) => n,
      (n) => n,
    ];
    this.generator = this.createGenerator();
    this.start();
  }

  start() {
    this.intervalID = setInterval(this._writeRow.bind(this), 1000);
  }

  stop() {
    clearInterval(this.intervalID);
  }

  _writeRow() {
    this.emit(
      'data',
      this.handler.getHashMapFromBuffer(this.generator.next().value)
    );
  }

  *createGenerator() {
    while (1) {
      this.changeValues();
      yield Buffer.from(Array.from(SEPARATORS).concat(this.bufferReadyValues));
    }
  }

  changeValues() {
    for (let i = 0; i < this.values.length; i++) {
      this.values[i] = this.incrementers[i](this.values[i]);
    }
  }

  get bufferReadyValues() {
    let array = [];
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i] <= 100) array.push(this.values[i]);
      else {
        const big = (this.values[i] / 256) | 0;
        const little = this.values[i] % 256;
        array.push(big, little);
      }
    }
    return array;
  }
}

module.exports = DataGenerator;

// testGenerator();
