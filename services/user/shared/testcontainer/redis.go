package testcontainer

import (
	"context"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/redis"
)

func StartRedis(ctx context.Context) (testcontainers.Container, string, error) {
	redisContainer, err := redis.Run(ctx, "redis:7.4-alpine")
	if err != nil {
		return nil, "", err
	}

	connStr, err := redisContainer.ConnectionString(ctx)
	if err != nil {
		return nil, "", err
	}
	return redisContainer, connStr, nil
}
