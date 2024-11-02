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

type Config struct {
	User string
	Pass string
	Host string
	Port string
}

func (cfg *Config) String() string {
	return fmt.Sprintf("amqp://%s:%s@%s:%s/", cfg.User, cfg.Pass, cfg.Host, cfg.Port)
}

type AmqpConn struct {
	connStr string

	conn *amqp091.Connection
	ch   *amqp091.Channel
}

func New(connStr string) *AmqpConn {
	return &AmqpConn{
		connStr: connStr,

		conn: nil,
		ch:   nil,
	}
}

func (ac *AmqpConn) Connect() {
	for {
		// Connect
		conn, err := amqp091.Dial(ac.connStr)

		if err != nil {
			slog.
				With("err", err).
				Error("Failed to connect to RabbitMQ. Retrying")
			time.Sleep(reconnectTime)
			continue
		}

		ch, err := conn.Channel()
		if err != nil {
			slog.With("err", err).
				Error("Failed to create channel. Retrying")
			time.Sleep(reconnectTime)
			continue
		}

		ac.conn = conn
		ac.ch = ch
		go ac.monitorConnection()

		slog.Info("Connected to RabbitMQ")

		return
	}
}

func (ac *AmqpConn) monitorConnection() {
	closeErr := make(chan *amqp091.Error)
	ac.ch.NotifyClose(closeErr)
	err := <-closeErr

	slog.With("err", err).Warn("connection to rabbitmq closed. Retrying")
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

func (ac *AmqpConn) Consume(queueName string, callback func(amqp091.Delivery) error) error {
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
			err := callback(msg)
			if err != nil {
				slog.With("err", err).Error("Error processing message")
				continue
			}
			slog.Info("Succesfully processed message from queue")
		}

		slog.Warn("Consumer closed. Attempting reconnection...")
		ac.Connect()                    // Reconnect and re-consume if the connection drops
		ac.Consume(queueName, callback) // Re-consume the queue after reconnecting
	}()
	return nil
}
