package testcontainer

import (
	"context"
	"fmt"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func StartRedis(ctx context.Context) (testcontainers.Container, string, error) {
	req := testcontainers.ContainerRequest{
		Image:        "redis:7.4-alpine",
		ExposedPorts: []string{"6379/tcp"},
		WaitingFor:   wait.ForListeningPort("6379/tcp"),
	}
	redisContainer, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		return nil, "", err
	}

	host, err := redisContainer.Host(ctx)
	if err != nil {
		return nil, "", err
	}
	port, err := redisContainer.MappedPort(ctx, "6379")
	if err != nil {
		return nil, "", err
	}

	address := fmt.Sprintf("%s:%s", host, port.Port())
	return redisContainer, address, nil
}
