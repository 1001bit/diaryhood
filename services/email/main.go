package main

import (
	"log/slog"
	"os"

	"github.com/1001bit/pathgoer/services/email/consumer"
	"github.com/1001bit/pathgoer/services/email/mailgunclient"
	"github.com/1001bit/pathgoer/services/email/shared/amqpconn"
)

func init() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))
}

func main() {
	// email mgClient
	mgClient := mailgunclient.New(os.Getenv("MG_DOMAIN"), os.Getenv("MG_API_KEY"))

	// RabbitMQ connection
	cfg := amqpconn.Config{
		User: os.Getenv("RABBITMQ_USER"),
		Pass: os.Getenv("RABBITMQ_PASS"),
		Host: "email-rabbitmq",
		Port: os.Getenv("RABBITMQ_PORT"),
	}
	amqpConn := amqpconn.New(cfg.String())
	amqpConn.Connect()

	// start consuming
	consumer.ConsumeFromQueue(amqpConn, mgClient)

	<-make(chan struct{})
	slog.Info("Shutting down")
}
