# Простой GUI для учебного стенда

## Установка готового образа raspberry os
Для установки потребуется загрузить образ raspberry os с яндекс [диска](https://disk.yandex.ru/d/dBhNBLJ7-WqVmA) на флешку.  

Теперь вставляем флешку в raspberry и запитываем её от 5 вольтового блока питания.  
Когда ОС загрузится завершаем работу текущей программы через alt+f4.  
Щелкаем правой кнопкой по рабочему столу, в контекстном меню выбираем file manager.  
В файловом менеджере находим файл ~/.config/openbox/autostart и отрывем редактором текста.  
Заменяем в файле название программы в автозапуске на car-ui и дописываем в начало строки sudo, для pi-4 так же надо добавить --no-sandbox, должно получиться:
```
sudo ~/inenergy-gui/dist/car-ui*.AppImage --no-sandbox > ~/.inenergy/car-ui.log
```
Перезапускаем систему через то же контекстное меню.

***
## Установка с чистой raspberry os
Для установки потребуется загрузить образ raspberry os lite на флешку. Это можно сделать с помощью [rapberry pi imager](https://www.raspberrypi.com/software/). Перед записью образа стоит настроить подключение к сети и пароль пользователя в настройках pi imager (шестеренка в правом нижнем углу).

После записи из файла cmdline.txt убираем фразу `console=serial0,115200`

Теперь вставляем флешку в raspberry и запитываем её от 5 вольтового блока питания.
Когда система загрузится необходимо установить дополнительный софт.
Для этого вводим комманды  
```sh
sudo apt-get update
sudo apt-get install -y git xorg openbox lightdm pcmanfm geany lxterminal chromium-browser libudev-dev libxss1
```
Так же нужно установить nvm  
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```
После установки нужно выйти из системы `exit` и войти обратно.  
Теперь надо установить node коммандой `nvm install 8`  
Можно проверить установку коммандой `node --version`

Затем нужно клонировать репозиторий и запустить установку программы:
```sh
git clone https://github.com/SonikDropout/car-ui.git  
cd car-ui  
./script/install.sh  
```
Теперь осталось включить автозапуск рабочего стола с помощью системной утилиты raspi-config. Вводим `sudo raspi-config` -> system options -> boot/auto login -> autologin to desktop  
Перезагрузка `sudo reboot`
***
## Подключение к стенду

Для подключения к стенду помимо очевидных манипулций для оживления экрана с помощью кабелей USB и HDMI потребуется подключить GPIO для чтения оборотов. Нам нужны пины GPIO12 и GPIO13. Схема распиновки:

![gpio](https://www.raspberrypi.com/documentation/computers/images/GPIO-Pinout-Diagram-2.png)

Пин GPIO12 использутеся для передачи, пин GPIO13 для приема сигнала.
