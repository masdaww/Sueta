# 🤖 Telegram-бот с ИИ

Простой Telegram-бот с нейросетью. Основной провайдер — **Google Gemini API** (быстро и есть бесплатный тариф). Если Gemini временно недоступен, бот переключается на бесплатный no-key fallback **Pollinations AI**.

## Возможности

- **Диалог с ИИ** — бот помнит контекст беседы
- **Команды:**
  - `/start` — приветствие
  - `/help` — справка
  - `/reset` — сбросить контекст диалога
- **Gemini как основной быстрый провайдер**
- **Pollinations fallback** без API-ключей
- **Retry и fallback** при временных сбоях AI-провайдера
- **Настраиваемый системный промпт**

## Быстрый старт

### 1. Получить токены

1. Создай бота у [@BotFather](https://t.me/BotFather) в Telegram и скопируй токен.
2. Получи бесплатный Gemini API key: [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### 2. Настроить окружение

```bash
cd telegram-bot
cp .env.example .env
```

Заполни `.env`:

```
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
GEMINI_API_KEY=AIza...
```

### 3. Установить зависимости

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Запустить бота

```bash
python bot.py
```

Бот начнёт слушать сообщения. Напиши ему в Telegram — и получишь ответ от ИИ.

## Бесплатный запуск 24/7

Для постоянной работы нужен сервер, который всегда включён. Из бесплатных вариантов самый надёжный — **Oracle Cloud Always Free VPS**:

- сайт: https://www.oracle.com/cloud/free/
- тип сервера: Ubuntu, Ampere A1 / Always Free
- минус: при регистрации обычно нужна банковская карта для проверки

### Запуск через Docker на VPS

1. Установи Docker:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

2. Скопируй проект на сервер и перейди в папку бота:

```bash
cd telegram-bot
cp .env.example .env
nano .env
```

3. Заполни `.env`:

```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
GEMINI_API_KEY=AIza...
```

4. Запусти бота:

```bash
sudo docker compose up -d --build
```

5. Посмотреть логи:

```bash
sudo docker compose logs -f
```

6. Остановить:

```bash
sudo docker compose down
```

`restart: unless-stopped` в `docker-compose.yml` автоматически перезапустит бота после сбоя или перезагрузки VPS.

### Автодеплой через GitHub Actions

GitHub не может держать Telegram-бота включённым 24/7 внутри себя, но может автоматически деплоить его на VPS после каждого push в `main`.

Workflow уже добавлен: `.github/workflows/deploy-telegram-bot.yml`.

1. На VPS один раз создай SSH-ключ для GitHub Actions или используй отдельный deploy-key.

2. В GitHub открой:

```text
Settings → Secrets and variables → Actions → New repository secret
```

3. Добавь secrets:

| Secret | Что положить |
|--------|--------------|
| `VPS_HOST` | IP-адрес VPS |
| `VPS_USER` | пользователь на VPS, например `ubuntu` |
| `VPS_SSH_KEY` | приватный SSH-ключ для подключения к VPS |
| `VPS_PORT` | SSH-порт, обычно `22` (необязательно) |
| `TELEGRAM_BOT_TOKEN` | токен бота от @BotFather |
| `GEMINI_API_KEY` | ключ Gemini API |

4. После merge в `main` workflow сам:

- подключится к VPS по SSH;
- установит Git/Docker, если их нет;
- скачает или обновит репозиторий;
- создаст `.env` из GitHub Secrets;
- запустит `sudo docker compose up -d --build`.

5. Вручную запустить деплой можно на вкладке:

```text
Actions → Deploy Telegram AI Bot → Run workflow
```

## Переменные окружения

| Переменная           | Обязательная | Описание                                           |
|----------------------|:------------:|----------------------------------------------------|
| `TELEGRAM_BOT_TOKEN` | ✓            | Токен бота от @BotFather                           |
| `GEMINI_API_KEY`     |              | Gemini API key; если нет, используется fallback    |
| `GEMINI_MODEL`       |              | Gemini модель (по умолчанию `gemini-2.5-flash`)    |
| `GEMINI_FALLBACK_MODELS` |          | Gemini fallback-модели через запятую               |
| `AI_MODEL`           |              | Pollinations fallback (`openai-fast`)              |
| `AI_FALLBACK_MODEL`  |              | Резервная Pollinations модель (`openai`)           |
| `SYSTEM_PROMPT`      |              | Системный промпт для настройки «характера» бота    |

## Провайдеры ИИ

1. **Google Gemini** — основной провайдер, быстрее и стабильнее. Бот пробует несколько Gemini-моделей подряд.
2. **Pollinations AI** — fallback без API-ключей, используется при сбое Gemini или если `GEMINI_API_KEY` не задан.

## Структура

```
telegram-bot/
├── Dockerfile          # Docker-образ для деплоя
├── bot.py              # Основной код бота
├── docker-compose.yml  # Запуск 24/7 через Docker
├── requirements.txt    # Python-зависимости
├── .env.example        # Пример конфигурации
└── README.md           # Документация
```
