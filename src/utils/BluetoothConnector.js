const noble = require('noble');
const EventEmitter = require('events');
const DataHandler = require('./DataHandler');
const {
  CONNECTION_TIMEOUT,
  CHARACTERISTIC_UUID,
  SERVICE_UUID,
  SEPARATORS,
  __,
} = require('../constants');
const fs = require('fs');
const carBtAddress = require('/home/pi/car-ui/config.json').MACAddress;

class BluetoothConnector extends EventEmitter {
  constructor() {
    super();
    this.timeout = 0;
    this.foundCars = [];
    this._connectedDevice = null;
    this.rememberPrevious = false;
    this.tryOpeningConnection();
  }

  startScanning(rememberPrevious) {
    this.foundCars = [];
    this.rememberPrevious = rememberPrevious;
    if (noble.state === 'poweredOn') {
      noble.startScanning([SERVICE_UUID]);
    } else {
      this._listenStateChange();
    }
  }

  tryOpeningConnection() {
    this._listenToDiscover();
  }

  _listenStateChange() {
    noble.on('stateChange', (state) => {
      if (state === 'poweredOn') {
        console.info('Noble start scanning');
        noble.startScanning([SERVICE_UUID]);
      } else {
        console.warn('Noble stop scanning');
        noble.stopScanning();
      }
    });
  }

  _listenToDiscover() {
    noble.on('discover', (device) => {
      this.foundCars.push(device);
      this.emit('carDiscovered', {
        address: device.address,
        name: device.advertisement.localName,
      });
      if (this.rememberPrevious && device.address === carBtAddress) {
        console.info('Noble found car');
        noble.stopScanning();
        this._connectToDevice(device);
      }
    });
  }

  connect(address) {
    fs.writeFile(
      '/home/pi/car-ui/config.json',
      JSON.stringify({ MACAddress: address }),
      () => {}
    );
    noble.stopScanning();
    this._connectToDevice(
      this.foundCars.find((dev) => dev.address === address)
    );
  }

  disconnect() {
    this._connectedDevice.disconnect();
  }

  _connectToDevice(device) {
    device.connect((err) => {
      if (err) {
        console.error(err.message);
        this.startScanning();
        return;
      }
      device.once('disconnected', () => {
        this.emit('disconnected');
        this.startScanning();
      });
      this._connectedDevice = device;
      device.discoverSomeServicesAndCharacteristics(
        [SERVICE_UUID],
        [CHARACTERISTIC_UUID],
        this._onServicesAndCharacteristicsDiscovered.bind(this)
      );
    });
  }

  _onServicesAndCharacteristicsDiscovered(err, services, characteristics) {
    if (err) {
      this._handleError(err);
      return;
    }
    console.log('Noble discovered characteristic');
    const characteristic = characteristics[0];
    if (!characteristic) {
      this._handleError({ message: 'Characteristic list is empty' });
      return;
    }
    this._subscribeToCharacteristic(characteristic);
    this._listenCharacteristicData(characteristic);
  }

  _subscribeToCharacteristic(characteristic) {
    characteristic.subscribe((err) => {
      if (err) {
        this._handleError(err);
        return;
      }
      console.log('Subscribed to characteristic');
      this.emit('connected');
    });
  }

  _listenCharacteristicData(characteristic) {
    const parser = new DataHandler();
    let firstChunk;
    const handleData = (data) => {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.startScanning();
        this.emit('disconnected');
      }, CONNECTION_TIMEOUT);
      if (data.indexOf(SEPARATORS) == 0) firstChunk = data;
      else if (firstChunk) {
        try {
          data = parser.getHashMapFromBuffer(Buffer.concat([firstChunk, data]));
          this.emit('data', data);
        } catch (e) {
          console.error(e.message);
        } finally {
          firstChunk = null;
        }
      }
    };
    characteristic.on('data', handleData);
  }

  _handleError(err) {
    console.error(err.message);
    this.startScanning();
  }
}

module.exports = BluetoothConnector;
