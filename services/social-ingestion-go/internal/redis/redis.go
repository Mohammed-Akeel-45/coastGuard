package redis

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type Store struct {
	rdb *redis.Client
	ctx context.Context
}

func New(url string) *Store {
	opt, _ := redis.ParseURL(url)
	return &Store{
		rdb: redis.NewClient(opt),
		ctx: context.Background(),
	}
}

func (s *Store) Exists(key string) bool {
	n, _ := s.rdb.Exists(s.ctx, key).Result()
	return n == 1
}

func (s *Store) Mark(key string) {
	s.rdb.Set(s.ctx, key, "1", 30*24*time.Hour)
}
