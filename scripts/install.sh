#!/bin/bash

# INSTALL REQUIRED PACKAGES
sudo apt-get update
sudo apt-get -y install libudev-dev libbluetooth-dev pigpio

# MAIN APP INSTALLATION
nvm use 8
ELECTRON_MIRROR="https://cdn.npm.taobao.org/dist/electron/"
npm i
npm run build

# MAIN APP AUTOSTART
chmod +x dist/car-ui*.AppImage
mkdir -p ~/inenergy-gui/dist
cp dist/car-ui*.AppImage ~/inenergy-gui/dist
mkdir ~/.car-ui
mkdir ~/.config/openbox
echo 'sudo ~/inenergy-gui/dist/car-ui*.AppImage --no-sandbox > ~/.car-ui/car-ui.log' > ~/.config/openbox/autostart
echo "{}" > ~/.car-ui/config.json
