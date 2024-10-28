package emailrmq

import (
	"log"
	"strings"

	"github.com/rabbitmq/amqp091-go"
)

func (rmq *EmailRmq) Consume() (<-chan amqp091.Delivery, error) {
	return rmq.ch.Consume(
		rmq.q.Name, // queue
		"",         // consumer
		false,      // auto-ack
		false,      // exclusive
		false,      // no-local
		false,      // no-wait
		nil,        // args
	)
}

func (rmq *EmailRmq) ReadOTP(callback func(email, name, otp string)) {
	msgs, err := rmq.Consume()
	if err != nil {
		log.Fatal(err)
	}

	for msg := range msgs {
		splitted := strings.Split(string(msg.Body), " ")
		email, name, otp := splitted[0], splitted[1], splitted[2]
		callback(email, name, otp)
	}
}
