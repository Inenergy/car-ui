/** Имитация GPIO на windows */

const EventEmitter = require('events');
const { randInt } = require('./numagic');

class GPIOMock extends EventEmitter {
  constructor() {
    super();
    this.rpm = 800;
    this.emitMockValue();
  }

  changeResistancePWM(key, dutyCycle) {
    console.log(`Changing ${key} dutyCycle to ${dutyCycle}`);
  }

  emitMockValue() {
    setInterval(() => {
      this.emit('rpmMeasure', this.rpm);
      this.rpm += randInt(-5, 5);
    });
  }

  changeDriveMode(mode) {
    console.log('Chnaging drive mode to:', mode);
  }
}

module.exports = GPIOMock;
