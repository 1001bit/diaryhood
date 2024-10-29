package main

import (
	"context"
	"log"
	"os"
	"strings"
	"time"

	"github.com/1001bit/pathgoer/services/email/amqpconn"
	"github.com/1001bit/pathgoer/services/email/sender"
	"github.com/rabbitmq/amqp091-go"
)

func main() {
	// email sender
	sender := sender.New(os.Getenv("MG_DOMAIN"), os.Getenv("MG_API_KEY"))

	// RabbitMQ connection
	amqpConn := amqpconn.New(os.Getenv("RABBITMQ_USER"), os.Getenv("RABBITMQ_PASS"), "email-rabbitmq", os.Getenv("RABBITMQ_PORT"))
	amqpConn.Connect()

	amqpConn.Consume("email", func(delivery amqp091.Delivery) {
		handleQueueMessage(delivery.Body, sender)
	})

	log.Println("Listening for messages")
	<-make(chan struct{})
}

func handleQueueMessage(body []byte, sender *sender.Sender) {
	var email, name, otp string
	bodySplit := strings.Split(string(body), " ")
	if len(bodySplit) != 3 {
		return
	}
	email, name, otp = bodySplit[0], bodySplit[1], bodySplit[2]

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err := sender.SendOtp(ctx, email, name, otp)
	if err != nil {
		log.Println(err)
	}
}
