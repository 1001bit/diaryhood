package consumer

import (
	"context"
	"errors"
	"log/slog"
	"strings"
	"time"

	"github.com/rabbitmq/amqp091-go"
)

type QueueConsumer interface {
	Consume(queueName string, handler func(amqp091.Delivery)) error
}

type EmailSender interface {
	SendOtp(ctx context.Context, email, name, otp string) error
}

func ConsumeFromQueue(consumer QueueConsumer, sender EmailSender) {
	consumer.Consume("email", func(delivery amqp091.Delivery) {
		// acknowledge message
		delivery.Ack(false)

		err := handleQueueMessage(delivery.Body, sender)
		if err != nil {
			slog.With("err", err).Error("Failed to handle queue message")
			return
		}

		slog.Info("Successfully handled queue message")
	})
}

func handleQueueMessage(body []byte, sender EmailSender) error {
	// get email, name, otp from body
	var email, name, otp string
	bodySplit := strings.Split(string(body), " ")
	if len(bodySplit) != 3 {
		return errors.New("invalid body format")
	}
	email, name, otp = bodySplit[0], bodySplit[1], bodySplit[2]

	// send otp email
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return sender.SendOtp(ctx, email, name, otp)
}
