package consumer

import (
	"context"
	"errors"
	"log/slog"
	"strings"
	"time"

	"github.com/rabbitmq/amqp091-go"
)

var ErrBadBody = errors.New("invalid body format")

type QueueConsumer interface {
	Consume(queueName string, handler func(amqp091.Delivery)) error
}

type EmailSender interface {
	SendOtp(ctx context.Context, email, name, otp string) error
}

func ConsumeFromQueue(consumer QueueConsumer, sender EmailSender) {
	consumer.Consume("email", func(delivery amqp091.Delivery) {
		err := handleQueueMessage(delivery.Body, sender)
		if err == ErrBadBody {
			slog.Error("Bad queue body")
			_ = delivery.Nack(false, false)
			return
		} else if err != nil {
			slog.With("err", err).Error("Failed to handle queue message")
			_ = delivery.Nack(false, true)
			return
		}

		err = delivery.Ack(false)
		if err != nil {
			slog.With("err", err).Error("Failed to ack queue message")
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
		return ErrBadBody
	}
	email, name, otp = bodySplit[0], bodySplit[1], bodySplit[2]

	// send otp email
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return sender.SendOtp(ctx, email, name, otp)
}
