package emailrmq

import (
	"context"
	"fmt"

	"github.com/rabbitmq/amqp091-go"
)

func (rmq *EmailRmq) SendOTP(ctx context.Context, email, name, otp string) error {
	body := []byte(fmt.Sprintf("%s %s %s", email, name, otp))

	return rmq.ch.PublishWithContext(
		ctx,        // context
		"",         // exchange
		rmq.q.Name, // routing key
		false,      // mandatory
		false,      // immediate
		amqp091.Publishing{
			ContentType: "text/plain",
			Body:        body,
		},
	)
}
