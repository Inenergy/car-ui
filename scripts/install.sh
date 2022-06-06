#!/bin/bash

set -e

# INSTALL REQUIRED PACKAGES
sudo apt-get update
sudo apt-get -y install libudev-dev libbluetooth-dev pigpio

# MAIN APP INSTALLATION
nvm use 8
ELECTRON_MIRROR="https://cdn.npm.taobao.org/dist/electron/"
npm i
npm run build

# MAIN APP AUTOSTART
echo 'sudo /home/pi/car-ui/dist/linux-armv7l-unpacked/car-ui' > ~/.xinitrc
chmod +x ~/.xinitrc
mkdir ~/.car-ui
echo "{}" > ~/.car-ui/config.json
