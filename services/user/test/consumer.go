package test

import (
	"github.com/1001bit/pathgoer/services/user/shared/rmqemail"
	"github.com/rabbitmq/amqp091-go"
)

type QueueConsumer interface {
	Consume(queueName string, handler func(amqp091.Delivery) error) error
}

func ConsumeFromQueue(consumer QueueConsumer, emailChan chan<- *rmqemail.EmailBody) {
	consumer.Consume("email", func(delivery amqp091.Delivery) error {
		emBody, err := rmqemail.VerifyBody(delivery.Body)
		if err == nil {
			emailChan <- emBody
		}
		return err
	})
}
