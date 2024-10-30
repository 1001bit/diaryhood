package consumer

import (
	"context"
	"log/slog"
	"strings"
	"time"

	"github.com/1001bit/pathgoer/services/email/amqpconn"
	"github.com/1001bit/pathgoer/services/email/sender"
	"github.com/rabbitmq/amqp091-go"
)

func ConsumeFromQueue(conn *amqpconn.AmqpConn, sender *sender.Sender) {
	conn.Consume("email", func(delivery amqp091.Delivery) {
		handleQueueMessage(delivery.Body, sender)
	})
}

func handleQueueMessage(body []byte, sender *sender.Sender) {
	slog.Info("Received email message from queue")

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
		return
	}

	slog.Info("OTP email sent")
}
