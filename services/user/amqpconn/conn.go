package amqpconn

import (
	"fmt"
	"log/slog"
	"time"

	"github.com/rabbitmq/amqp091-go"
)

const (
	reconnectTime = 5 * time.Second
)

type AmqpConn struct {
	user string
	pass string
	host string
	port string

	conn *amqp091.Connection
	ch   *amqp091.Channel
}

func New(user, pass, host, port string) *AmqpConn {
	return &AmqpConn{
		user: user,
		pass: pass,
		host: host,
		port: port,
	}
}

func (ac *AmqpConn) Connect() {
	for {
		slog.Info("Connecting to RabbitMQ")

		// Connect
		conn, err := amqp091.Dial(fmt.Sprintf("amqp://%s:%s@%s:%s/", ac.user, ac.pass, ac.host, ac.port))

		if err != nil {
			slog.With("err", err).Error("Failed to connect to RabbitMQ")
			time.Sleep(reconnectTime)
			continue
		}

		ch, err := conn.Channel()
		if err != nil {
			slog.With("err", err).Error("Failed to create channel")
			time.Sleep(reconnectTime)
			continue
		}

		ac.conn = conn
		ac.ch = ch

		slog.Info("Connected to RabbitMQ")
		go ac.monitorConnection()

		return
	}
}

func (ac *AmqpConn) monitorConnection() {
	closeErr := make(chan *amqp091.Error)
	ac.ch.NotifyClose(closeErr)
	err := <-closeErr

	slog.With("err", err).Error("connection to rabbitmq closed. Retrying")
	ac.ch.Close()
	ac.conn.Close()
	ac.Connect()
}

func (ac *AmqpConn) Publish(queueName string, body string) error {
	if ac.ch == nil {
		err := fmt.Errorf("not connected to rabbitmq")
		return err
	}

	_, err := ac.ch.QueueDeclare(queueName, false, false, false, false, nil)
	if err != nil {
		return err
	}

	return ac.ch.Publish(
		"",        // exchange
		queueName, // routing key (queue name)
		false,     // mandatory
		false,     // immediate
		amqp091.Publishing{
			ContentType: "text/plain",
			Body:        []byte(body),
		},
	)
}

func (ac *AmqpConn) Consume(queueName string, handler func(amqp091.Delivery)) error {
	if ac.ch == nil {
		err := fmt.Errorf("not connected to rabbitmq")
		return err
	}

	// Declare the queue in case it doesn’t exist
	_, err := ac.ch.QueueDeclare(queueName, false, false, false, false, nil)
	if err != nil {
		return err
	}

	msgs, err := ac.ch.Consume(
		queueName, // queue name
		"",        // consumer tag
		true,      // auto-acknowledge
		false,     // exclusive
		false,     // no-local
		false,     // no-wait
		nil,       // args
	)
	if err != nil {
		return err
	}

	go func() {
		for msg := range msgs {
			handler(msg)
		}

		slog.Info("Consumer closed. Attempting reconnection...")
		ac.Connect()                   // Reconnect and re-consume if the connection drops
		ac.Consume(queueName, handler) // Re-consume the queue after reconnecting
	}()

	slog.With("queue", queueName).Info("Consumer started")
	return nil
}
