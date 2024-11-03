package rabbittest

import (
	"context"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/rabbitmq"
)

func StartContainer(ctx context.Context) (testcontainers.Container, string, error) {
	rmqContainer, err := rabbitmq.Run(ctx, "rabbitmq:4.0.2-management")

	if err != nil {
		return nil, "", err
	}

	connStr, err := rmqContainer.AmqpURL(ctx)
	if err != nil {
		return nil, "", err
	}

	return rmqContainer, connStr, nil
}
