package main

import (
	"context"
	"log/slog"
	"os"
	"strings"
	"time"

	"github.com/1001bit/pathgoer/services/email/amqpconn"
	"github.com/1001bit/pathgoer/services/email/sender"
	"github.com/rabbitmq/amqp091-go"
)

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

func main() {
	// email sender
	sender := sender.New(os.Getenv("MG_DOMAIN"), os.Getenv("MG_API_KEY"))

	// RabbitMQ connection
	amqpConn := amqpconn.New(os.Getenv("RABBITMQ_USER"), os.Getenv("RABBITMQ_PASS"), "email-rabbitmq", os.Getenv("RABBITMQ_PORT"))
	amqpConn.Connect()

	amqpConn.Consume("email", func(delivery amqp091.Delivery) {
		handleQueueMessage(delivery.Body, sender)
	})

	<-make(chan struct{})
	slog.Info("Shutting down")
}

func handleQueueMessage(body []byte, sender *sender.Sender) {
	slog.Info("Received email message")

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
		slog.With("err", err).Error("Failed to send OTP email")
	}
}
