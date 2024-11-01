package testcontainer

import (
	"context"
	"fmt"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func StartRabbitMQ(ctx context.Context) (testcontainers.Container, string, error) {
	req := testcontainers.ContainerRequest{
		Image:        "rabbitmq:4.0.2-management",
		ExposedPorts: []string{"5672/tcp"},
		WaitingFor:   wait.ForListeningPort("5672/tcp"),
	}
	rabbitmqContainer, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		return nil, "", err
	}

	host, err := rabbitmqContainer.Host(ctx)
	if err != nil {
		return nil, "", err
	}
	port, err := rabbitmqContainer.MappedPort(ctx, "5672")
	if err != nil {
		return nil, "", err
	}

	url := fmt.Sprintf("amqp://%s:%s", host, port.Port())
	return rabbitmqContainer, url, nil
}
