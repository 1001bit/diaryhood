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

func (cfg *Config) String() string {
	return fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)
}

func New(connStr string) *redis.Client {
	slog.With("addr", connStr).Info("Connecting to Redis")
	return redis.NewClient(&redis.Options{
		Addr: connStr,
	})
}
