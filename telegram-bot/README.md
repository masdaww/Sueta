# 🤖 Telegram-бот с ИИ

Простой Telegram-бот, подключённый к нейросети через OpenAI API. Бот принимает текстовые сообщения, отправляет их в ChatGPT и возвращает ответ прямо в чат.

## Возможности

- **Диалог с ИИ** — бот помнит контекст беседы (последние сообщения)
- **Команды:**
  - `/start` — приветствие
  - `/help` — справка
  - `/reset` — сбросить контекст диалога
- **Настраиваемый системный промпт** — можно задать «характер» бота
- **Выбор модели** — gpt-3.5-turbo, gpt-4o и другие

## Быстрый старт

### 1. Получить токены

1. Создай бота у [@BotFather](https://t.me/BotFather) в Telegram и скопируй токен
2. Получи API-ключ на [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 2. Настроить окружение

```bash
cd telegram-bot
cp .env.example .env
```

Заполни `.env` своими токенами:

```
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
OPENAI_API_KEY=sk-...
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

Бот начнёт слушать сообщения. Напиши ему в Telegram — и получишь ответ от ИИ!

## Переменные окружения

| Переменная           | Обязательная | Описание                                    |
|----------------------|:------------:|---------------------------------------------|
| `TELEGRAM_BOT_TOKEN` | ✓            | Токен бота от @BotFather                    |
| `OPENAI_API_KEY`     | ✓            | Ключ API OpenAI                             |
| `OPENAI_MODEL`       |              | Модель (по умолчанию `gpt-3.5-turbo`)       |
| `SYSTEM_PROMPT`      |              | Системный промпт для настройки «характера»  |

## Структура

```
telegram-bot/
├── bot.py              # Основной код бота
├── requirements.txt    # Python-зависимости
├── .env.example        # Пример конфигурации
└── README.md           # Документация
```
