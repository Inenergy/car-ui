/** Модуль обнаружения подключенной флэшки */

const usbDetect = require('usb-detection');
const EventEmitter = require('events');
const { exec } = require('child_process');
const { debounce } = require('./others');

const usbPort = new EventEmitter();
let connectedDevice;

const getDriveList = () => new Promise((resolve, reject) => {
  exec('lsblk -o +path --json', (err, output) => {
    if (err) reject(err);
    else resolve(JSON.parse(output).blockdevices);
  });
});

Object.defineProperty(usbPort, 'isDeviceConnected', {
  get: function() {
    return !!connectedDevice;
  },
});

const debouncedFind = debounce(findDrive, 1500);

usbDetect.startMonitoring();
usbDetect.on('add', debouncedFind);
usbDetect.on('remove', handleRemove);

function findDrive() {
  getDriveList()
    .then(drives => {
      const device = drives.find(dev => dev.rm);
      if (!device) return;
      if (device.children) {
        connectedDevice = device.children[0].path;
        mountDevice(connectedDevice);
      } else {
        connectedDevice = device.path;
        mountDevice(connectedDevice);
      }
    })
    .catch(err => console.error(err.message));
}

function mountDevice(device) {
  exec(
    `sudo mount ${device} /media/usb1 -o uid=1000`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(error.message);
        return;
      }
      if (stderr) {
        console.error(stderr);
        return;
      }
      usbPort.emit('add', '/media/usb1');
    }
  );
}

function handleRemove() {
  getDriveList()
    .then(devices => {
      const device = devices.find(dev => dev.rm);
      if (!device) {
        emitRemove();
        return;
      }
      if (device.children && device.children[0].path !== connectedDevice)
        emitRemove();
      else if (device.path !== connectedDevice) emitRemove();
    })
    .catch(err => {
      console.error(err.message);
      emitRemove();
    });
}

function emitRemove() {
  usbPort.emit('remove');
  connectedDevice = void 0;
}

usbPort.eject = () => {
  exec(`sudo umount ${connectedDevice}`, () => {
    connectedDevice = void 0;
  });
};

usbPort.init = findDrive;

module.exports = usbPort;
