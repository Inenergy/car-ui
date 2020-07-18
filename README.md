# Простой GUI для учебного стенда

### Установка
Для установки потребуется загрузить образ raspbian-lite-custom на флешку.

После загрузки образа вставляем флешку в raspberry и запитываем её от 5 вольтового блока питания.
Когда ОС загрузится жмем Enter и воодим логин pi, пароля нет.

Теперь нужно склонировать репозиторий коммандой `git clone https://github.com/SonikDropout/car-ui.git`   
Далее переходим в папку с кодом коммандой `cd car-ui`  
Меняем используемую версию nodejs `nvm use 8`
Теперь делаем исполняемым скрипт установки `chmod +x install.sh`  
И запускаем его `./install.sh`  
После установки raspberry перезагрузится и автоматом запустит нужное приложение.

### Подключение к стенду

Для подключения к стенду помимо очевидных манипулций для оживления экрана с помощью кабелей USB и HDMI потребуется подключить GPIO. Нам нужны 12 и 13 пины. Схема распиновки:

![gpio](https://www.raspberrypi.org/documentation/usage/gpio/images/GPIO.png)

Пин 12 использутеся для передачи, пин 13 для приема сигнала.