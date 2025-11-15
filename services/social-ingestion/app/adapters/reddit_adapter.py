import praw
from datetime import datetime, timezone
from .base_adapter import BaseAdapter

class RedditAdapter(BaseAdapter):
    platform = "reddit"

    def __init__(self, client_id, client_secret, user_agent, subreddits=None):
        self.reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent,
        )
        # List of target subreddits (India + coastal + weather)
        self.subreddits = subreddits or [
            "india", "IndiaSpeaks", "kerala", "tamilnadu", "mumbai",
            "chennai", "andhrapradesh", "bangalore", "weather", "news"
        ]

    def search_posts(self, keywords, geo_filter=None, since_id=None, limit=100):
        """
        Searches Reddit for posts matching hazard keywords.
        Standardizes post format for ingestion pipeline.
        Reddit does not guarantee 'since_id', so we filter manually using timestamp.
        """
        query = " OR ".join([f'"{k}"' if " " in k else k for k in keywords])
        if geo_filter:
            query += f" {geo_filter}"  # apply geographic narrowing when possible

        posts = []
        max_results = limit

        for sr in self.subreddits:
            try:
                subreddit = self.reddit.subreddit(sr)
                results = subreddit.search(query, sort="new", limit=max_results)
            except Exception:
                continue  # skip failed subreddit

            for submission in results:
                # Skip if older than our since filter (if provided)
                if since_id:
                    try:
                        if submission.created_utc <= float(since_id):
                            continue
                    except:
                        pass

                # Normalize created_at to ISO 8601 UTC
                created_dt = datetime.fromtimestamp(
                    submission.created_utc, tz=timezone.utc
                )
                created_at = created_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

                # Location: Reddit posts do not have structured geodata.
                # Use subreddit name or try detecting location keyword.
                detected_location = None
                if geo_filter and geo_filter.lower() in submission.title.lower():
                    detected_location = {"name": geo_filter, "source": "keyword"}
                elif sr.lower() in [
                    "kerala", "tamilnadu", "mumbai", "chennai", "bangalore"
                ]:
                    detected_location = {"name": sr, "source": "subreddit"}

                post = {
                    "id": submission.id,
                    "text": f"{submission.title}\n\n{submission.selftext}",
                    "created_at": created_at,
                    "user": {
                        "id": submission.author.id if submission.author else None,
                        "name": submission.author.name if submission.author else None,
                        "username": submission.author.name if submission.author else None,
                    },
                    "location": detected_location,   # may be None
                    "platform": self.platform,
                    "extra": {
                        "subreddit": sr,
                        "permalink": f"https://reddit.com{submission.permalink}"
                    }
                }

                posts.append(post)

                if len(posts) >= max_results:
                    break

            if len(posts) >= max_results:
                break

        return posts
