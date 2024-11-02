package rabbitclient

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

type Client struct {
	connStr string

	conn *amqp091.Connection
	ch   *amqp091.Channel
}

func New(connStr string) *Client {
	return &Client{
		connStr: connStr,

		conn: nil,
		ch:   nil,
	}
}

func (c *Client) Connect() {
	for {
		// Connect
		conn, err := amqp091.Dial(c.connStr)

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

		c.conn = conn
		c.ch = ch
		go c.monitorConnection()

		slog.Info("Connected to RabbitMQ")
		return
	}
}

func (c *Client) monitorConnection() {
	closeErr := make(chan *amqp091.Error)
	c.ch.NotifyClose(closeErr)
	err := <-closeErr

	slog.With("err", err).Warn("connection to rabbitmq closed. Retrying")
	c.ch.Close()
	c.conn.Close()
	c.Connect()
}

func (c *Client) Publish(queueName string, body string) error {
	if c.ch == nil {
		err := fmt.Errorf("not connected to rabbitmq")
		return err
	}

	_, err := c.ch.QueueDeclare(queueName, false, false, false, false, nil)
	if err != nil {
		return err
	}

	return c.ch.Publish(
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

func (c *Client) Consume(queueName string, callback func(amqp091.Delivery) error) error {
	if c.ch == nil {
		err := fmt.Errorf("not connected to rabbitmq")
		return err
	}

	// Declare the queue in case it doesn’t exist
	_, err := c.ch.QueueDeclare(queueName, false, false, false, false, nil)
	if err != nil {
		return err
	}

	msgs, err := c.ch.Consume(
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

		slog.Warn("Consumer closed. Opening new consumer...")
		time.Sleep(reconnectTime)
		c.Consume(queueName, callback) // Re-consume the queue after reconnecting
	}()
	return nil
}

func (c *Client) Close() {
	if c.ch != nil {
		c.ch.Close()
	}

	if c.conn != nil {
		c.conn.Close()
	}
}
