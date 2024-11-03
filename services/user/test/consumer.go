package test

import (
	"github.com/1001bit/pathgoer/services/user/shared/rabbitemail"
	"github.com/rabbitmq/amqp091-go"
)

type QueueConsumer interface {
	Consume(queueName string, handler func(amqp091.Delivery) error) error
}

func ConsumeFromQueue(consumer QueueConsumer, emailChan chan<- *rabbitemail.EmailBody) {
	consumer.Consume("email", func(delivery amqp091.Delivery) error {
		emBody, err := rabbitemail.VerifyBody(delivery.Body)
		if err == nil {
			emailChan <- emBody
		}
		return err
	})
}
