from datetime import datetime, timezone
from telegram import Bot
from .base_adapter import BaseAdapter

class TelegramChannelAdapter(BaseAdapter):
    platform = "telegram"

    def __init__(self, bot_token, channels, limit=100):
        """
        bot_token: Telegram bot token
        channels: list of channel usernames or IDs (e.g., ["@kerala_weather"])
        """
        self.bot = Bot(token=bot_token)
        self.channels = channels
        self.limit = limit

    def search_posts(self, keywords, geo_filter=None, since_id=None, limit=100):
        posts = []
        max_results = min(limit, self.limit)

        for channel in self.channels:
            try:
                updates = self.bot.get_chat_history(
                    chat_id=channel,
                    limit=max_results
                )
            except Exception as e:
                print(f"Telegram fetch failed for {channel}: {e}")
                continue

            for msg in updates:
                # Only use text messages
                if not msg.text:
                    continue

                # Keyword filtering
                text_lower = msg.text.lower()
                if not any(k.lower() in text_lower for k in keywords):
                    continue

                # Optional geo keyword filtering
                if geo_filter and geo_filter.lower() not in text_lower:
                    continue

                # Skip old messages if since_id provided
                if since_id:
                    try:
                        if msg.message_id <= int(since_id):
                            continue
                    except:
                        pass

                # Normalize timestamp
                dt = msg.date.astimezone(timezone.utc)
                created_at = dt.strftime("%Y-%m-%dT%H:%M:%SZ")

                post = {
                    "id": f"{channel}:{msg.message_id}",
                    "text": msg.text,
                    "created_at": created_at,
                    "user": {
                        "id": msg.chat.id,
                        "name": msg.chat.title,
                        "username": channel
                    },
                    "location": {
                        "name": channel,
                        "source": "channel"
                    },
                    "platform": self.platform,
                    "extra": {
                        "channel": channel,
                        "message_id": msg.message_id
                    }
                }

                posts.append(post)

                if len(posts) >= max_results:
                    break

        return posts
