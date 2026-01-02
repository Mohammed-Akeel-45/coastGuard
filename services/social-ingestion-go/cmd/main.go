package main

import (
	"crypto/sha256"
	"encoding/hex"
	"os"
	"time"

	"social-ingestion/internal/hazard"
	"social-ingestion/internal/rabbit"
	"social-ingestion/internal/redis"
	"social-ingestion/internal/sources"
)

func hashKey(source, id string) string {
	h := sha256.Sum256([]byte(source + id))
	return hex.EncodeToString(h[:])
}

func run() {
	rmq := rabbit.New(os.Getenv("RABBITMQ_URL"))
	store := redis.New(os.Getenv("REDIS_URL"))

	process := func(source string, posts []sources.Post) {
		for _, p := range posts {
			h := hazard.Detect(p.Text)
			if len(h) == 0 {
				continue
			}

			key := hashKey(source, p.ID)
			if store.Exists(key) {
				continue
			}

			msg := map[string]any{
				"type":      "social-media-post",
				"source":    source,
				"post_id":   p.ID,
				"author":    p.Author,
				"content":   p.Text,
				"timestamp": p.Timestamp,
				"hazards":   h,
				"raw_url":   p.URL,
			}

			_ = rmq.Publish(msg)
			store.Mark(key)
		}
	}

	process("telegram", sources.FetchTelegram())
	process("bluesky", sources.FetchBluesky())
}

func main() {
	ticker := time.NewTicker(30 * time.Minute)
	defer ticker.Stop()

	run() // run immediately

	for range ticker.C {
		run()
	}
}
