/** Чтение обротов и смена имитирумого сопротивления по GPIO */

const { Gpio } = require('pigpio');
const EventEmitter = require('events');
const { INPUT_PIN, OUTPUT_PIN, GROUND_RESISTANCE } = require('../constants');

class GPIOManager extends EventEmitter {
  constructor() {
    super();
    this.rpmInput = new Gpio(INPUT_PIN, { mode: Gpio.INPUT, alert: true });
    this.dmOutput = new Gpio(OUTPUT_PIN, { mode: Gpio.OUTPUT });
    this.dmOutput.hardwarePwmWrite(100000, GROUND_RESISTANCE.low.dutyCycle);
    this.rpsCount = 0;
    setInterval(this.emitRPM.bind(this), 1000);
    this.rpmInput.on('alert', this.handleAlert.bind(this));
  }

  changeDriveMode(mode) {
    this.dmOutput.hardwarePwmWrite(100000, GROUND_RESISTANCE[mode].dutyCycle);
  }

  emitRPM() {
    this.emit('rpmMeasure', this.rpsCount * 60);
    this.rpsCount = 0;
  }

  handleAlert(level) {
    if (level) this.rpsCount++;
  }
}

module.exports = GPIOManager;
