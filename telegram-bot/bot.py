"""
Telegram-бот с ИИ (Gemini + Pollinations fallback).

Основной провайдер: Google Gemini API (быстрее и стабильнее).
Резервный провайдер: Pollinations AI без API-ключей.

Переменные окружения:
    TELEGRAM_BOT_TOKEN  — токен бота от @BotFather
    GEMINI_API_KEY      — ключ Google Gemini API
    GEMINI_MODEL        — модель Gemini (по умолчанию gemini-2.5-flash)
    GEMINI_FALLBACK_MODELS — резервные модели Gemini через запятую
    AI_MODEL            — Pollinations fallback модель (по умолчанию openai-fast)
    SYSTEM_PROMPT       — системный промпт для ИИ (опционально)
"""

import asyncio
import logging
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv
from google import genai
from google.genai import types
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
GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_FALLBACK_MODELS: str = os.getenv(
    "GEMINI_FALLBACK_MODELS",
    "gemini-2.5-flash-lite,gemini-flash-latest",
)
AI_MODEL: str = os.getenv("AI_MODEL", "openai-fast")
AI_FALLBACK_MODEL: str = os.getenv("AI_FALLBACK_MODEL", "openai")
SYSTEM_PROMPT: str = os.getenv(
    "SYSTEM_PROMPT",
    "Ты — дружелюбный и умный ИИ-ассистент. Отвечай кратко, по делу и на русском языке.",
)
AI_API_URL = "https://text.pollinations.ai/openai"
HTTP_SESSION = requests.Session()
GEMINI_CLIENT = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# ─── Логирование ─────────────────────────────────────────────────────────────
logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# Хранилище контекста диалогов: chat_id → list[dict]
chat_histories: dict[int, list[dict[str, str]]] = {}
MAX_HISTORY = 4
disabled_gemini_models: dict[str, float] = {}
def pollinations_models() -> list[str]:
    """Список Pollinations-моделей для попыток запроса."""
    models = [AI_MODEL]
    if AI_FALLBACK_MODEL and AI_FALLBACK_MODEL not in models:
        models.append(AI_FALLBACK_MODEL)
    return models


def gemini_models() -> list[str]:
    """Список Gemini-моделей для попыток запроса."""
    now = time.monotonic()
    models = [GEMINI_MODEL]
    for model in GEMINI_FALLBACK_MODELS.split(","):
        model = model.strip()
        if model and model not in models:
            models.append(model)
    return [
        model
        for model in models
        if disabled_gemini_models.get(model, 0.0) <= now
    ]


def ask_gemini(messages: list[dict[str, str]], model: str) -> str:
    """Запрос к Gemini API."""
    if GEMINI_CLIENT is None:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    contents = [
        types.Content(
            role="model" if message["role"] == "assistant" else "user",
            parts=[types.Part(text=message["content"])],
        )
        for message in messages
        if message["role"] in {"user", "assistant"}
    ]
    response = GEMINI_CLIENT.models.generate_content(
        model=model,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.7,
            max_output_tokens=384,
        ),
    )
    return response.text.strip()


def ask_pollinations(messages: list[dict[str, str]]) -> str:
    """Запрос к бесплатному Pollinations API."""
    started_at = time.monotonic()
    last_error: Exception | None = None

    for model in pollinations_models():
        for attempt in range(2):
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
                    timeout=12,
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
                    "AI request failed via %s (attempt %s/2, status=%s): %s",
                    model,
                    attempt + 1,
                    status_code,
                    error,
                )
                if status_code and status_code < 500 and status_code != 429:
                    break
                time.sleep(0.5 + attempt)

    raise RuntimeError("AI provider is temporarily unavailable") from last_error


def ask_ai(messages: list[dict[str, str]]) -> str:
    """Запрос к Gemini с fallback на Pollinations."""
    started_at = time.monotonic()

    if GEMINI_CLIENT is not None:
        for model in gemini_models():
            try:
                reply = ask_gemini(messages, model)
                logger.info(
                    "AI response received in %.2fs via %s",
                    time.monotonic() - started_at,
                    model,
                )
                return reply
            except Exception as error:
                logger.warning("Gemini request failed via %s: %s", model, error)
                disabled_gemini_models[model] = time.monotonic() + 60

    return ask_pollinations(messages)


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
            "Нейросеть сейчас перегружена и не ответила после нескольких "
            "быстрых попыток. Напиши ещё раз через 10–20 секунд."
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

    logger.info("Бот запущен (Gemini: %s). Ожидание сообщений…", GEMINI_MODEL)
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
