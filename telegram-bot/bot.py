"""
Telegram-бот с ИИ (Pollinations AI).

Бесплатный AI-провайдер без API-ключей.
Использует OpenAI-compatible endpoint Pollinations: https://text.pollinations.ai/openai

Переменные окружения:
    TELEGRAM_BOT_TOKEN  — токен бота от @BotFather
    AI_MODEL            — модель (по умолчанию openai-fast)
    SYSTEM_PROMPT       — системный промпт для ИИ (опционально)
"""

import asyncio
import logging
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv
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
AI_MODEL: str = os.getenv("AI_MODEL", "openai-fast")
AI_FALLBACK_MODEL: str = os.getenv("AI_FALLBACK_MODEL", "openai")
SYSTEM_PROMPT: str = os.getenv(
    "SYSTEM_PROMPT",
    "Ты — дружелюбный и умный ИИ-ассистент. Отвечай кратко, по делу и на русском языке.",
)
AI_API_URL = "https://text.pollinations.ai/openai"
HTTP_SESSION = requests.Session()

# ─── Логирование ─────────────────────────────────────────────────────────────
logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# Хранилище контекста диалогов: chat_id → list[dict]
chat_histories: dict[int, list[dict[str, str]]] = {}
MAX_HISTORY = 4


def ai_models() -> list[str]:
    """Список моделей для попыток запроса."""
    models = [AI_MODEL]
    if AI_FALLBACK_MODEL and AI_FALLBACK_MODEL not in models:
        models.append(AI_FALLBACK_MODEL)
    return models


def ask_ai(messages: list[dict[str, str]]) -> str:
    """Запрос к бесплатному AI API."""
    started_at = time.monotonic()
    last_error: Exception | None = None

    for model in ai_models():
        for attempt in range(3):
            try:
                response = HTTP_SESSION.post(
                    AI_API_URL,
                    json={
                        "model": model,
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            *messages,
                        ],
                        "temperature": 0.7,
                        "max_tokens": 384,
                    },
                    headers={
                        "Content-Type": "application/json",
                        "User-Agent": "telegram-ai-bot",
                    },
                    timeout=45,
                )
                response.raise_for_status()
                data = response.json()
                logger.info(
                    "AI response received in %.2fs via %s",
                    time.monotonic() - started_at,
                    model,
                )
                return data["choices"][0]["message"]["content"].strip()
            except requests.RequestException as error:
                last_error = error
                status_code = getattr(error.response, "status_code", None)
                logger.warning(
                    "AI request failed via %s (attempt %s/3, status=%s): %s",
                    model,
                    attempt + 1,
                    status_code,
                    error,
                )
                if status_code and status_code < 500 and status_code != 429:
                    break
                time.sleep(1 + attempt * 2)

    raise RuntimeError("AI provider is temporarily unavailable") from last_error


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
    """Обработка текстовых сообщений — запрос к AI."""
    chat_id = update.effective_chat.id
    user_text = update.message.text

    if chat_id not in chat_histories:
        chat_histories[chat_id] = []

    history = chat_histories[chat_id]
    history.append({"role": "user", "content": user_text})

    if len(history) > MAX_HISTORY * 2:
        history[:] = history[-(MAX_HISTORY * 2):]

    # Отправляем «печатает…»
    await update.effective_chat.send_action("typing")

    try:
        reply = await asyncio.to_thread(ask_ai, history)
    except Exception:
        logger.exception("Ошибка при обращении к AI")
        history.pop()
        reply = (
            "Бесплатная нейросеть сейчас перегружена и не ответила после нескольких "
            "попыток. Напиши ещё раз через 10–20 секунд."
        )
    else:
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

    logger.info("Бот запущен (модель: %s). Ожидание сообщений…", AI_MODEL)
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
