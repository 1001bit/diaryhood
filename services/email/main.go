package main

import (
	"log/slog"
	"os"

	"github.com/1001bit/pathgoer/services/email/amqpconn"
	"github.com/1001bit/pathgoer/services/email/consumer"
	"github.com/1001bit/pathgoer/services/email/mailgunclient"
)

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

func main() {
	// email mgClient
	mgClient := mailgunclient.New(os.Getenv("MG_DOMAIN"), os.Getenv("MG_API_KEY"))

	// RabbitMQ connection
	amqpConn := amqpconn.New(os.Getenv("RABBITMQ_USER"), os.Getenv("RABBITMQ_PASS"), "email-rabbitmq", os.Getenv("RABBITMQ_PORT"))
	amqpConn.Connect()

	// start consuming
	consumer.ConsumeFromQueue(amqpConn, mgClient)

	<-make(chan struct{})
	slog.Info("Shutting down")
}
