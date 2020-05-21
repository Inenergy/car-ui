# Простой GUI для учебного стенда

### Установка
Для установки потребуется загрузить образ raspbian lite на флешку. Скачать его можно с [официального сайта](https://www.raspberrypi.org/downloads/raspbian/). Для загрузки образа хорошо подойдет вот эта [утилита](https://www.balena.io/etcher/).

После загрузки образа вставляем флешку в raspberry и запитываем её от 5 вольтового блока питания.
Стандартные логин - pi, пароль - raspberry. Можно удалить пароль коммандой `sudo passwd -d pi`

Программа написана под 7-дюймовый экран waveshare. Для его корректной работы с raspberry необходимо отредактировать загрузочный конфигурационный файл. Файл находится по пути /boot/config.txt Открываем его в текстовом редакторе (vi или nano) и добавляем в конец строки  
  max_usb_current=1  
  hdmi_group=2  
  hdmi_mode=87  
  hdmi_cvt 1024 600 60 6 0 0 0  
  hdmi_drive=1  

Для установки программы так же потребутся подключиться к wi-fi. Сделать это можно с помощью утилиты raspi-config. Запускается она командой `sudo raspi-config`. Инструкция по использованию так же есть на [оф сайте](https://www.raspberrypi.org/documentation/configuration/raspi-config.md).

Перезагружаемся командой reboot

Теперь нужно установить git командой `sudo apt install git`  
После утановки скачиваем репозиторий коммандой `git clone https://github.com/SonikDropout/car-ui.git`   
Далее следует постедовательность комманд:  
  `cd car-ui`  
  `chmod +x install.sh`  
  `./install.sh`  

Это запустит установочный скрипт. Далее нашего участия не требутеся.

### Подключение к стенду

Для подключения к стенду помимо очевидных манипулций для оживления экрана с помощью кабелей USB и HDMI потребуется подключить GPIO. Нам нужны 12 и 13 пины. Схема распиновки:

![gpio](https://www.raspberrypi.org/documentation/usage/gpio/images/GPIO.png)

Пин 12 использутеся для передачи, пин 13 для приема сигнала.