package redisclient

import (
	"fmt"
	"log/slog"

	"github.com/redis/go-redis/v9"
)

type Config struct {
	Host string
	Port string
	Pass string
	Db   int
}

func New(cfg Config) *redis.Client {
	slog.With("host", cfg.Host).With("port", cfg.Port).Info("Connecting to Redis")
	return redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),
		Password: cfg.Pass,
		DB:       cfg.Db,
	})
}
