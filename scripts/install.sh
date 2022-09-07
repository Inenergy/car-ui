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
mkdir ~/.car-ui
echo 'sudo ~/inenergy-gui/dist/car-ui*.AppImage > ~/.car-ui/car-ui.log' > ~/.config/openbox/autostart
echo "{}" > ~/.car-ui/config.json
