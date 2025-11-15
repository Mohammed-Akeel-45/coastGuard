import traceback
from app.adapters.reddit_adapter import RedditAdapter
from app.adapters.telegram_adapter import TelegramChannelAdapter
from apscheduler.schedulers.background import BackgroundScheduler
from app.config import Config
from app.adapters.twitter_adapter import TwitterAdapter
from app.publisher import RabbitPublisher
from app.dedupe import DedupeStore
import time
import os

reddit_client_id = os.getenv("REDDIT_CLIENT_ID")
reddit_client_secret = os.getenv("REDDIT_CLIENT_SECRET")
reddit_user_agent = os.getenv("REDDIT_USER_AGENT")

if reddit_client_id and reddit_client_secret and reddit_user_agent:
    adapters.append(
        RedditAdapter(
            reddit_client_id,
            reddit_client_secret,
            reddit_user_agent
        )
    )
else:
    print("Reddit adapter disabled (missing credentials).")

telegram_token = os.getenv("TELEGRAM_BOT_TOKEN")
telegram_channels = os.getenv("TELEGRAM_CHANNELS", "").split(",")

if telegram_token and telegram_channels:
    adapters.append(
        TelegramChannelAdapter(
            bot_token=telegram_token,
            channels=[c.strip() for c in telegram_channels if c.strip()]
        )
    )
else:
    print("Telegram adapter disabled (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNELS).")

def fetch_and_publish(adapters, publisher, dedupe_store):
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Running social ingestion...")
    try:
        keywords = Config.HAZARD_KEYWORDS
        geo = Config.GEO_FILTER
        for adapter in adapters:
            try:
                posts = adapter.search_posts(keywords=keywords, geo_filter=geo, limit=100)
            except Exception as e:
                print(f"Error fetching from {adapter.platform}: {e}")
                traceback.print_exc()
                continue

            for p in posts:
                platform = p.get("platform", adapter.platform)
                post_id = p.get("id")
                if not post_id:
                    continue

                # Dedup check
                try:
                    is_new = dedupe_store.is_new_and_mark(platform, post_id)
                except Exception as e:
                    print("Dedupe check failed, treating as new. Error:", e)
                    is_new = True

                if not is_new:
                    print(f"Skipping already-seen post {platform}:{post_id}")
                    continue

                # Publish
                try:
                    publisher.publish_post(p)
                    print(f"Published {platform}:{post_id}")
                except Exception as e:
                    print(f"Failed publishing {platform}:{post_id}: {e}")
                    traceback.print_exc()

    except Exception as e:
        print("Unhandled error in fetch_and_publish:", e)
        traceback.print_exc()


def main():
    # Create adapter instances
    twitter_token = os.getenv("TWITTER_BEARER_TOKEN")
    adapters = []
    if twitter_token:
        adapters.append(TwitterAdapter(twitter_token))
    else:
        print("TWITTER_BEARER_TOKEN not set; Twitter adapter disabled.")

    publisher = RabbitPublisher()
    dedupe_store = DedupeStore()

    # single run at startup
    fetch_and_publish(adapters, publisher, dedupe_store)

    # schedule periodic runs
    scheduler = BackgroundScheduler()
    interval_minutes = Config.SCHEDULER_INTERVAL_MINUTES
    scheduler.add_job(lambda: fetch_and_publish(adapters, publisher, dedupe_store),
                      'interval', minutes=interval_minutes, id='social_ingest')
    scheduler.start()
    print(f"Scheduler started: every {interval_minutes} minutes.")

    try:
        # keep alive
        while True:
            time.sleep(60)
    except (KeyboardInterrupt, SystemExit):
        print("Shutting down...")
    finally:
        scheduler.shutdown()
        publisher.close()

if __name__ == "__main__":
    main()
