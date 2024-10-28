package emailpub

import (
	"context"
	"fmt"

	"github.com/rabbitmq/amqp091-go"
)

func (p *Publisher) SendOTP(ctx context.Context, email, name, otp string) error {
	body := []byte(fmt.Sprintf("%s %s %s", email, name, otp))

	return p.ch.PublishWithContext(
		ctx,      // context
		"",       // exchange
		p.q.Name, // routing key
		false,    // mandatory
		false,    // immediate
		amqp091.Publishing{
			ContentType: "text/plain",
			Body:        body,
		},
	)
}
