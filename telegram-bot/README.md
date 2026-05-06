# 🤖 Telegram-бот с ИИ

Простой Telegram-бот с нейросетью. **Бесплатно, без API-ключей для ИИ.** Использует Pollinations AI — OpenAI-compatible endpoint `https://text.pollinations.ai/openai`.

## Возможности

- **Диалог с ИИ** — бот помнит контекст беседы
- **Команды:**
  - `/start` — приветствие
  - `/help` — справка
  - `/reset` — сбросить контекст диалога
- **Бесплатный AI-провайдер** — не нужен OpenAI/Gemini API key
- **Настраиваемый системный промпт**

## Быстрый старт

### 1. Получить токен бота

Создай бота у [@BotFather](https://t.me/BotFather) в Telegram и скопируй токен.

### 2. Настроить окружение

```bash
cd telegram-bot
cp .env.example .env
```

Заполни `.env` токеном бота:

```
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
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
| `AI_MODEL`           |              | Модель (по умолчанию `openai-fast`)                     |
| `SYSTEM_PROMPT`      |              | Системный промпт для настройки «характера» бота    |

## Провайдер ИИ

По умолчанию бот использует Pollinations AI без ключей:

- Endpoint: `https://text.pollinations.ai/openai`
- Основная модель: `openai-fast` (более быстрый бесплатный вариант)
- Резервная модель: `openai`
- При временных ошибках 5xx бот делает несколько повторных попыток

Это не официальный OpenAI API и стабильность/доступность зависит от Pollinations.

## Структура

```
telegram-bot/
├── bot.py              # Основной код бота
├── requirements.txt    # Python-зависимости
├── .env.example        # Пример конфигурации
└── README.md           # Документация
```
