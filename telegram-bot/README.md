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
├── bot.py              # Основной код бота
├── requirements.txt    # Python-зависимости
├── .env.example        # Пример конфигурации
└── README.md           # Документация
```
