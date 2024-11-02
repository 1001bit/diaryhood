package consumer

import (
	"context"
	"time"

	"github.com/1001bit/pathgoer/services/email/shared/rmqemail"
	"github.com/rabbitmq/amqp091-go"
)

type QueueConsumer interface {
	Consume(queueName string, handler func(amqp091.Delivery) error) error
}

type EmailSender interface {
	SendOtp(ctx context.Context, email, name, otp string) error
}

func ConsumeFromQueue(consumer QueueConsumer, sender EmailSender) {
	consumer.Consume("email", func(delivery amqp091.Delivery) error {
		err := handleQueueMessage(delivery.Body, sender)

		switch err {
		case nil:
			delivery.Ack(false)
		case rmqemail.ErrBadBody:
			delivery.Nack(false, false)
		default:
			delivery.Nack(false, true)
		}

		return err
	})
}

func handleQueueMessage(body []byte, sender EmailSender) error {
	// get email, name, otp from body
	emBody, err := rmqemail.VerifyBody(body)
	if err != nil {
		return err
	}

	// send otp email
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return sender.SendOtp(ctx, emBody.Email, emBody.Name, emBody.Otp)
}
