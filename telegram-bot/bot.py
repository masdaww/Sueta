"""
Telegram-бот с ИИ (OpenAI API).

Использует python-telegram-bot (async) и OpenAI Chat Completions API.
Переменные окружения:
    TELEGRAM_BOT_TOKEN  — токен бота от @BotFather
    OPENAI_API_KEY      — ключ OpenAI API
    OPENAI_MODEL        — модель (по умолчанию gpt-3.5-turbo)
    SYSTEM_PROMPT       — системный промпт для ИИ (опционально)
"""

import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import AsyncOpenAI
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    filters,
)

# ─── Загрузка переменных окружения ───────────────────────────────────────────
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

TELEGRAM_BOT_TOKEN: str = os.environ["TELEGRAM_BOT_TOKEN"]
OPENAI_API_KEY: str = os.environ["OPENAI_API_KEY"]
OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
SYSTEM_PROMPT: str = os.getenv(
    "SYSTEM_PROMPT",
    "Ты — дружелюбный и умный ИИ-ассистент. Отвечай кратко, по делу и на русском языке.",
)

# ─── Логирование ─────────────────────────────────────────────────────────────
logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# ─── OpenAI клиент ───────────────────────────────────────────────────────────
openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

# Хранилище контекста диалогов: chat_id → list[dict]
chat_histories: dict[int, list[dict[str, str]]] = {}
MAX_HISTORY = 20  # макс. пар сообщений на чат


# ─── Обработчики ─────────────────────────────────────────────────────────────

async def start(update: Update, _) -> None:
    """Команда /start — приветствие."""
    await update.message.reply_text(
        "Привет! 👋 Я бот-нейросеть.\n"
        "Напиши мне любое сообщение — и я отвечу с помощью ИИ.\n\n"
        "Команды:\n"
        "/start — начать заново\n"
        "/reset — очистить контекст диалога\n"
        "/help  — справка",
    )


async def help_command(update: Update, _) -> None:
    """Команда /help."""
    await update.message.reply_text(
        "Просто пиши мне текстовые сообщения — я передаю их нейросети и возвращаю ответ.\n\n"
        "Бот помнит контекст беседы (последние сообщения).\n"
        "Чтобы сбросить контекст, отправь /reset.",
    )


async def reset(update: Update, _) -> None:
    """Команда /reset — сброс истории диалога."""
    chat_histories.pop(update.effective_chat.id, None)
    await update.message.reply_text("Контекст диалога очищен. Начнём сначала! 🔄")


async def handle_message(update: Update, _) -> None:
    """Обработка текстовых сообщений — запрос к OpenAI."""
    chat_id = update.effective_chat.id
    user_text = update.message.text

    # Инициализируем историю при первом сообщении
    if chat_id not in chat_histories:
        chat_histories[chat_id] = []

    history = chat_histories[chat_id]
    history.append({"role": "user", "content": user_text})

    # Обрезаем историю, чтобы не превышать лимит
    if len(history) > MAX_HISTORY * 2:
        history[:] = history[-(MAX_HISTORY * 2):]

    messages = [{"role": "system", "content": SYSTEM_PROMPT}, *history]

    # Отправляем «печатает…»
    await update.effective_chat.send_action("typing")

    try:
        response = await openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )
        reply = response.choices[0].message.content.strip()
    except Exception:
        logger.exception("Ошибка при обращении к OpenAI API")
        reply = "⚠️ Произошла ошибка при обращении к нейросети. Попробуй позже."

    history.append({"role": "assistant", "content": reply})
    await update.message.reply_text(reply)


# ─── Точка входа ─────────────────────────────────────────────────────────────

def main() -> None:
    """Запуск бота."""
    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("reset", reset))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("Бот запущен. Ожидание сообщений…")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
